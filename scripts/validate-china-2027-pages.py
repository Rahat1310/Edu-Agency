"""Read-only checks against the running site's ordinary public HTTP routes."""
import concurrent.futures
import json
import os
import re
import urllib.parse
import urllib.request
import urllib.error
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get("CHINA_VALIDATION_URL", "http://localhost:3000")
OFFERS = json.loads((ROOT / "lib/china-2027/offers.json").read_text())
REPORT = ROOT / "imports/china-2027/reconciliation/http-validation.json"
RESULTS = []


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.hidden = 0
        self.text = []
        self.links = []
        self.headings = []
        self.in_h1 = False
        self.current_h1 = []
        self.select_names = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("script", "style"):
            self.hidden += 1
        if tag == "a":
            self.links.append(attrs.get("href", ""))
        if tag == "select":
            self.select_names.append(attrs.get("name"))
        if tag == "h1":
            self.in_h1 = True
            self.current_h1 = []

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.hidden -= 1
        if tag == "h1":
            self.headings.append("".join(self.current_h1))
            self.in_h1 = False

    def handle_data(self, data):
        if not self.hidden:
            self.text.append(data)
            if self.in_h1:
                self.current_h1.append(data)

    @property
    def visible(self):
        return " ".join(self.text)


def get(path):
    try:
        response = urllib.request.urlopen(BASE + path, timeout=90)
    except urllib.error.HTTPError as error:
        raise AssertionError((path, error.code)) from error
    with response:
        assert response.status == 200, (path, response.status)
        result = Page(response.read().decode())
        assert len(result.headings) == 1, (path, result.headings)
    return result


def directory(locale, filters, expected):
    prefix = "/bn" if locale == "bn" else ""
    ids = []
    pages = max(1, (len(expected) + 11) // 12)
    for number in range(1, pages + 1):
        query = urllib.parse.urlencode({"country": "china", **filters, "page": number})
        path = prefix + "/programs?" + query
        page = get(path)
        assert {"country", "level", "intake", "university", "language"} <= set(page.select_names), path
        found = [re.fullmatch(prefix + r"/programs/([0-9a-f-]{36})", url) for url in page.links]
        ids += [match[1] for match in found if match]
        assert not re.search(r"\.pdf|extracted_text|reconciliation/", page.visible), path
    assert Counter(ids) == Counter(expected), (locale, filters, ids, expected)
    assert len(ids) == len(set(ids)), (locale, filters, "duplicate cards")
    return {"kind": "directory", "locale": locale, "filters": filters, "pages": pages, "offers": len(ids)}


def detail(locale, offer):
    prefix = "/bn" if locale == "bn" else ""
    path = prefix + "/programs/" + offer["id"]
    page = get(path)
    assert page.headings == [offer["university"]], path
    for text in [offer["title"], offer["tuition"]["display"], *[f["value"] for f in offer["fees"]]]:
        assert text in page.visible, (path, text)
    university = prefix + "/programs?country=china&university=" + urllib.parse.quote(offer["universityId"])
    assert university in page.links, path
    if offer.get("progressionStart"):
        assert offer["progressionStart"] in page.visible, path
    assert not re.search(r"\.pdf|extracted_text|reconciliation/", page.visible), path
    ctas = [u for u in page.links if "/consultation?" in u]
    if offer["eligibility"] == "unavailable":
        assert not any(offer["id"] in u for u in ctas), path
    else:
        assert any("programId=" + offer["id"] in u for u in ctas), path
    return {"kind": "detail", "locale": locale, "offerId": offer["id"]}


def main():
    jobs = []
    for locale in ["en", "bn"]:
        prefix = "/bn" if locale == "bn" else ""
        guide = get(prefix + "/destinations/china")
        assert any("/programs?" in u and "country=china" in u for u in guide.links)
        RESULTS.append({"kind": "destination", "locale": locale})
        jobs.append((directory, (locale, {}, [o["id"] for o in OFFERS])))
        for intake, count in [("March 2027", 61), ("September 2027", 21), ("Rolling enrollment", 1), ("Intake to be confirmed", 2)]:
            matches = [o["id"] for o in OFFERS if intake in o.get("entryIntakes", [o["intake"]])]
            assert len(matches) == count
            jobs.append((directory, (locale, {"intake": intake}, matches)))
        for university in sorted({o["universityId"] for o in OFFERS}):
            matches = [o["id"] for o in OFFERS if o["universityId"] == university]
            jobs.append((directory, (locale, {"university": university}, matches)))
        for level in ["foundation", "foundation_bachelor", "language", "bachelor", "master", "phd"]:
            matches = [o["id"] for o in OFFERS if level in o.get("categories", [o["level"]])]
            jobs.append((directory, (locale, {"level": level}, matches)))
        for language in ["English", "Chinese"]:
            matches = [o["id"] for o in OFFERS if language in o["language"]]
            jobs.append((directory, (locale, {"language": language}, matches)))
        jobs.append((directory, (locale, {"scholarship": "1"}, [o["id"] for o in OFFERS if o["scholarship"]["available"]])))
        jobs.append((directory, (locale, {"university": "wenzhou-medical-university", "intake": "September 2027"}, [])))
        jobs.append((directory, (locale, {"university": "wenzhou-medical-university", "intake": "March 2027", "level": "bachelor", "language": "English"}, ["920535d4-f521-54c5-ba92-07746630f3a3"])))
        jobs.append((directory, (locale, {"field": "no-such-subject-4821"}, [])))
        for offer in OFFERS:
            jobs.append((detail, (locale, offer)))
    # Compile each detail route before concurrent requests, keeping dev-server load bounded.
    RESULTS.append(detail("en", OFFERS[0]))
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        pending = [executor.submit(fn, *args) for fn, args in jobs]
        for count, future in enumerate(concurrent.futures.as_completed(pending), 1):
            RESULTS.append(future.result())
            if count % 50 == 0:
                print(f"Validated {count}/{len(jobs)} route scenarios", flush=True)
    # Exercise consultation prefill without submitting a lead or sending a message.
    for university in ["wenzhou-medical-university", "chengdu-normal-university", "wuhan-vocational-college-of-commerce-and-trade", "tsinghua-university"]:
        ident = next(o["id"] for o in OFFERS if o["universityId"] == university and (university != "chengdu-normal-university" or o["level"] == "language"))
        page = get("/consultation?destination=china&programId=" + ident)
        assert "Free Student Profile Assessment" in page.visible
        RESULTS.append({"kind": "consultation", "offerId": ident})
    legacy = json.loads((REPORT.parent / "db-inventory.json").read_text())
    for locale in ["en", "bn"]:
        prefix = "/bn" if locale == "bn" else ""
        for row in legacy:
            if not row["isPublished"]:
                continue
            page = get(prefix + "/programs/" + row["id"])
            assert row["universityName"] in page.visible
            RESULTS.append({"kind": "legacy detail", "locale": locale, "offerId": row["id"]})
        selected = OFFERS[:3]
        page = get(prefix + "/programs/compare?ids=" + ",".join(o["id"] for o in selected))
        assert all(o["university"] in page.visible for o in selected)
        RESULTS.append({"kind": "comparison", "locale": locale})
    with urllib.request.urlopen(BASE + "/en/programs?country=china", timeout=90) as response:
        assert "/en/" not in urllib.parse.urlparse(response.url).path
        assert response.status == 200
    REPORT.write_text(json.dumps({"baseUrl": BASE, "status": "passed", "scenarioCount": len(RESULTS), "results": RESULTS, "browserValidation": "Unavailable: browser access host is unavailable. These checks validate server-rendered HTTP pages, links and filters, not visual layout or browser interaction."}, indent=2) + "\n")
    print(f"Passed {len(RESULTS)} route scenarios. Report: {REPORT}", flush=True)


if __name__ == "__main__":
    main()
