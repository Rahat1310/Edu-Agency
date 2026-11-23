#!/usr/bin/env python3
"""Private source coverage, arithmetic and release-readiness report. No DB writes."""
import collections,csv,hashlib,json,re,sys
from decimal import Decimal
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
PACK=ROOT/'imports/malaysia-offers-import'
OUT=PACK/'audit'
cat=json.loads((ROOT/'lib/malaysia/catalogue.json').read_text())
coverage=json.loads((OUT/'coverage.json').read_text())
review=json.loads((OUT/'visual-review.json').read_text())
index=list(csv.DictReader((PACK/'source-index.csv').open(encoding='utf-8-sig')))
assert len(index)==len(coverage)==149
assert sum(int(r['pdf_page_count'] or 0) for r in index)==466
by_source={r['source_id']:r for r in index}
by_schedule={s['id']:s for s in cat['schedules']}
by_program={p['id']:p for p in cat['programmes']}
conflicts=[]
def issue(key,sources,detail,programme_ids=None):
    conflicts.append(dict(key=key,sources=sources,detail=detail,programmeIds=programme_ids or []))
def ids(inst,pattern):return [p['id'] for p in cat['programmes'] if p['institutionId']==inst and re.search(pattern,p['title'],re.I)]
def money(value):
    v=re.sub(r'^(?:MYR|RM|USD)\s*','',value.strip()).replace(',','')
    return Decimal(v) if re.fullmatch(r'\d+(?:\.\d+)?',v) else None
issue('lincoln-management-mode',[dict(id='MY-113',page=19,rows=[134,135]),dict(id='MY-114',page=19,rows=[134,135])],'Both rows print PhD Management, Research, 3 years; programme totals RM54,200 and RM47,000. Both schedules retained; no ODL mode inferred.',ids('lincoln',r'^Doctor of Philosophy \(PhD\) in Management$'))
issue('klust-accountancy-code',[dict(id='MY-025',page=1,field='programme code'),dict(id='MY-075',page=1,field='programme code')],'Same title, different printed codes: R3/0411/6/0107 and R2/344/6/0523. Separate code identities retained; confirm successor/eligibility.',ids('klust','Accountancy'))
issue('klust-mba-odl-dates',[dict(id='MY-013',page=1,field='intake and fee matrix'),dict(id='MY-067',page=1,field='intake and fee matrix'),dict(id='MY-014',page=1,field='fee matrix'),dict(id='MY-068',page=1,field='fee matrix')],'RM12,660 schedules have different printed cohorts (July–November 2026 vs March 2026). RM13,000 variants differ in their printed discount rows/terms; no filename-based merging.',ids('klust','BUSINESS ADMINISTRATION.*ODL'))
issue('binary-doctorate-award',[dict(id='MY-124',page=3,field='column heading / banner / tuition rows')],'Heading says After MYBIG 50%, banner says RM10K; base RM60,000 and conditional RM50,000 retained. Eligibility/award wording needs confirmation.',ids('binary','Doctor'))
issue('help-market',[dict(id='MY-005',page=1,rows=['Diploma in Early Childhood Education','Diploma in Education']),dict(id='MY-005',page=2,field='international audience and conditions')],'Header is international; filename is JAPAN. Bangladesh applicability of the two discounted 2026 rows is unresolved. Public rows quote original RM46,800 / RM47,200 only.',ids('help','Diploma in (Early Childhood|Education)'))
issue('school-issuer',[dict(id='MY-128',page='JPEG',field='Swadesh Global branding'),dict(id='MY-129',page='JPEG',field='unnamed yearly fee table')],'No verified Cranbridge issuer attribution. Both images retained privately; school-specific prices and limited-time registration discount are held.')
issue('taylor-printed-duration',[dict(id='MY-145',page=13,programme='Master of Applied Computing',intake='September',field='duration “1 Months”')],'All 18 original pages were inspected and programme/intake/currency mappings replaced with explicit reviewed rows. September Master of Applied Computing still prints “1 Months”; the literal duration is retained pending issuer confirmation.',ids('taylors',r'^Master of Applied Computing$'))
# Arithmetic checks preserve the printed amount; a calculated sum is private only.
for p in cat['programmes']:
    for s in [by_schedule[i] for i in p['scheduleIds']]:
        sid=s['refs'][0]['id'];tables=s['tables']
        if sid=='MY-113':
            total=money(tables[0]['rows'][1][1]);annual=[money(r[-1]) for r in tables[1]['rows']]
            if total is not None and all(a is not None for a in annual) and sum(annual)!=total:issue('printed-yearly-total-mismatch',s['refs'],f'Lincoln: yearly payment sum {sum(annual)} vs printed programme total {total}. Original figures retained.',[p['id']])
        if sid=='MY-124' and 'MASTER OF BUSINESS ADMINISTRATION (MBA)'==p['title']:
            rows=tables[0]['rows'];offer=money(rows[1][1]);years=[money(r[1]) for r in rows[2:]]
            if all(v is not None for v in years) and sum(years)!=offer:issue('binary-mba-instalments',s['refs'],f'Yearly amounts sum to {sum(years)}, printed conditional total {offer}; difference {offer-sum(years)}.',[p['id']])
        if sid=='MY-004':
            rows=tables[0]['rows'];promo=money(rows[0][1]);printed=money(rows[-1][1]);years=[money(r[1]) for r in rows if r[0].startswith('Year') and money(r[1]) is not None]
            if years and sum(years)!=printed:issue('city-yearly-total',s['refs'],f'{p["title"]}: printed year payments sum {sum(years)}, printed total {printed}; promotional tuition {promo}. No replacement total displayed.',[p['id']])
            if promo is not None and printed is not None and promo>printed:issue('city-promo-exceeds-total',s['refs'],f'Promotional tuition {promo} exceeds printed total {printed}; original cells retained.',[p['id']])
        if sid=='MY-126' and 'Business Administration' in p['title'] and 'ODL' in p['title']:issue('kings-odl-total',s['refs'],'MBA ODL: printed semester amounts and total differ; confirm which payment plan applies.',[p['id']])
        if sid=='MY-121' and any(money(r[1]) and money(r[1])>0 for r in tables[0]['rows'] if 'Scholarship' in r[0]):issue('unirazak-scholarship-basis',s['refs'],'Printed scholarship column does not establish the net payable fee. All eight source columns retained without subtracting an award.',[p['id']])
checks=[]
for r in csv.DictReader((PACK/'source-checks.csv').open(encoding='utf-8-sig')):
    sid=r['source_id'];needle=r['amount'].replace(',','')
    ss=[s for s in cat['schedules'] if any(ref['id']==sid for ref in s['refs'])]
    hits=[s['id'] for s in ss if any(needle in c.replace(',','') for t in s['tables'] for row in t['rows'] for c in row)]
    status='held — school attribution unresolved' if sid=='MY-129' else 'matched' if hits else 'MISSING'
    checks.append(dict(source=sid,location=r['page_or_cell'],item=r['programme_or_item'],basis=r['printed_fee_basis'],currency=r['currency'],amount=r['amount'],status=status,scheduleIds=hits))
# Case-independent identity diagnostics retain campus, provider and mode scope.
names=collections.defaultdict(list)
for p in cat['programmes']:
    key=(p['institutionId'],p['provider'],p['campus'],p['mode'],re.sub(r'[^a-z0-9]','',p['title'].lower().replace('honours','hons')))
    names[key].append(p['id'])
possible_duplicates=[v for v in names.values() if len(v)>1]
source_dupes=[]
for s in cat['schedules']:
    refs=sorted({r['id'] for r in s['refs']})
    if len(refs)>1 and any(int(r[3:]) in range(6,109) for r in refs):source_dupes.append(dict(scheduleId=s['id'],sources=refs))
expected_rows=json.loads((ROOT/'scripts/malaysia/reviewed-row-counts.json').read_text())
row_checks=[]
for source_id,by_page in expected_rows.items():
    for pg,expected in by_page.items():
        actual=len({p['id'] for p in cat['programmes'] for sk in p['scheduleIds'] if by_schedule[sk]['refs'][0]['id']==source_id and by_schedule[sk]['refs'][0]['page']==pg})
        assert actual==expected,(source_id,pg,expected,actual)
        row_checks.append(dict(sourceId=source_id,page=int(pg),expectedUniqueProgrammeRows=expected,importedProgrammeRows=actual,method='Original full-page image inspection; shared merged programme/intake cells reconciled explicitly'))
for group in possible_duplicates:
    ps=[by_program[k] for k in group]
    if ps[0]['institutionId']=='klust' and not any('Accountancy' in p['title'].title() for p in ps):
        issue('klust-historical-code-identity',[dict(id=r['id'],page=r['page'],field='programme code') for p in ps for sk in p['scheduleIds'] for r in by_schedule[sk]['refs']], 'Same-title KLUST records retain different printed codes: '+ '; '.join(p['code'] for p in ps)+'. Historical successor identity is not established; no code-based merging or redirect is inferred.',group)
pages=[]
for entry in coverage:
    reviewed=set(review['reviewedPdfPages'].get(entry['sourceId'],[]))
    for p in entry['pages']:
        p['visualReview']='reviewed' if p['page'] in reviewed else 'pending'
        assert p['disposition']!='unmapped',(entry['sourceId'],p['page'])
        pages.append(dict(sourceId=entry['sourceId'],page=p['page'],visualReview=p['visualReview'],disposition=p['disposition']))
rollups=[]
for i in cat['institutions']:
    ps=[p for p in cat['programmes'] if p['institutionId']==i['id']]
    rollups.append(dict(institution=i['name'],id=i['id'],programmes=len(ps),levels=dict(collections.Counter(p['level'] for p in ps)),schedules=len({s for p in ps for s in p['scheduleIds']})))
report=dict(reviewedRowChecks=row_checks,status='NOT READY FOR DEPLOYMENT',originalFiles=149,pdfPages=466,sourceDispositions=dict(collections.Counter(r['disposition'] for r in coverage)),institutions=len(cat['institutions']),programmes=len(cat['programmes']),schedules=len(cat['schedules']),scheduleStatus=dict(collections.Counter(s['status'] for s in cat['schedules'])),visualReview=dict(reviewed=sum(p['visualReview']=='reviewed' for p in pages),pending=sum(p['visualReview']=='pending' for p in pages),imagesReviewed=2,workbook='original cells verified',docx='original hyperlink verified'),possibleDuplicateProgrammeGroups=possible_duplicates,linkedDuplicateSources=source_dupes,retiredMockRecords=25,verifiedRedirects=0,retirementPolicy='Exact mock IDs are 404. No degree successor is established for the APU subject-group quote. No DB mutation executed.',nottingham='Original folder empty; no offer imported.',conflicts=conflicts,sourceChecks=checks,institutionTotals=rollups,coverage=coverage)
OUT.mkdir(exist_ok=True)
(OUT/'import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(OUT/'source-conflicts.json').write_text(json.dumps(conflicts,ensure_ascii=False,indent=2)+'\n')
lines=['# Malaysia catalogue import and coverage report','','**NOT READY FOR DEPLOYMENT.** All 149 files have dispositions, but original-layout review is incomplete. Do not equate extraction/row mapping with sign-off.','',f"Catalogue: {report['institutions']} institutions/groups; {report['programmes']} programme / pathway records; {report['schedules']} dated fee schedules.",f"PDF page review: {report['visualReview']['reviewed']} / 466 visually inspected; {report['visualReview']['pending']} pending. Both JPEGs, all supplied nonblank workbook cells and the original DOCX link were checked.",'','All 25 inventoried mock IDs are excluded from public reads, comparison, matching, calculator, related records, static parameters and sitemap. The seed no longer creates Malaysia mocks. Offline guarded SQL is in `retire-mocks.sql`; no production migration or deployment was executed. There are no verified one-to-one successor redirects.','','## Source conflicts and holds','']
for c in conflicts:
    if c['key'] not in ['printed-yearly-total-mismatch','city-yearly-total','city-promo-exceeds-total','unirazak-scholarship-basis']:lines.append(f"- **{c['key']}** — {json.dumps(c['sources'],ensure_ascii=False)}: {c['detail']}")
lines+=['',f"Additional record-level arithmetic / eligibility queries: {len(conflicts)} total entries in `source-conflicts.json`, keyed to source location and affected programme IDs.",'',f"Possible same-title identity groups needing review: {len(possible_duplicates)}. Distinct code/campus/provider/mode variants remain separate; linked exact duplicate sources: {len(source_dupes)}.",'','## Representative source checks','','| Source | Location | Item | Currency / amount | Result |','|---|---|---|---|---|']
for r in checks:lines.append(f"| {r['source']} | {r['location']} | {r['item']} — {r['basis']} | {r['currency']} {r['amount']} | {r['status']} |")
lines+=['','## Institution totals','','| Institution | Records | Schedules | Levels |','|---|---:|---:|---|']
for r in rollups:lines.append(f"| {r['institution']} | {r['programmes']} | {r['schedules']} | {json.dumps(r['levels'],ensure_ascii=False)} |")
lines+=['','## Reproduction and verification','','```sh','python3 imports/malaysia-offers-import/verify_sources.py --extract-to /tmp/sac-malaysia-sources','python3 scripts/malaysia/extract_tables.py','python3 scripts/malaysia/extract_lincoln.py','python3 scripts/malaysia/build_catalogue.py --apply','python3 scripts/malaysia/build_catalogue.py --check','npm run test:malaysia','npm run test:programs','npm run lint','npm run typecheck','npm run build','npm run audit:malaysia','npm run check:malaysia-release','tsx scripts/reconcile-malaysia.ts --snapshot imports/malaysia-offers-import/audit/database-before.json --write-sql imports/malaysia-offers-import/audit/retire-mocks.sql','```','','Python extraction tools require `scripts/malaysia/requirements.txt`. The release command intentionally exits nonzero while original-page sign-off or source questions remain. See `browser-verification.json` for rendered route/locale checks when available.']
(OUT/'IMPORT_REPORT.md').write_text('\n'.join(lines)+'\n')

public_coverage=[dict(sourceId=e['sourceId'],sha256=e['sha256'],disposition=e['disposition'],pages=[dict(page=p['page'],disposition=p['disposition'],visualReview=p['visualReview'],linkedProgrammes=len(set(p['programmeIds'])),linkedSchedules=len(set(p['scheduleIds']))) for p in e['pages']]) for e in coverage]
(ROOT/'docs/malaysia-coverage.json').write_text(json.dumps(dict(status=report['status'],sources=public_coverage,reviewedRowChecks=row_checks,unresolvedConflicts=conflicts),ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/malaysia-import-report.md').write_text('\n'.join(lines)+'\n')

missing=[r for r in checks if r['status']=='MISSING']
assert not missing,missing
print(json.dumps({k:report[k] for k in ['status','originalFiles','pdfPages','institutions','programmes','schedules','scheduleStatus','visualReview']},ensure_ascii=False,indent=2))
if '--release' in sys.argv and (report['visualReview']['pending'] or conflicts or possible_duplicates):sys.exit(1)
