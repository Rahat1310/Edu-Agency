# China 2027 destination and offer update

## Phase 1 Problem and audience

Students arriving from the agency's Bangladesh campaigns cannot currently compare the actual March and September 2027 offers. The China page leads with visa administration; its directory contains ten older generic records with no intake year or clear scholarship coverage. A family cannot tell whether a fee is annual, per semester, or conditional on an award.

The primary reader is a Bangladeshi HSC graduate and the parent funding their study, choosing between a Chinese language course, foundation course, foundation-to-bachelor route, or direct bachelor admission. Postgraduate applicants also need the master's and doctoral offers supplied in the same archive. Study Abroad Consultant is the business maintaining and funding the website; students use the existing free assessment before counselling.

Three reference solutions and the gap this update fills:

| Reference                               | Useful capability                                   | Gap for this specific task                                                                                                                                           |
| --------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campus China / CSC                      | Official scholarship and institution information    | Does not assemble the agency's supplied offers and its Bangladesh counselling route into one shortlist. The site was intermittently inaccessible during this review. |
| CUCAS program search                    | Filters across degrees, intakes, languages and fees | Its broader inventory does not define which offers this agency has approved for 2027.                                                                                |
| Individual university admission portals | Institution-specific admission rules                | Families must compare different formats and application windows across many sites.                                                                                   |

## Phase 2 Scope

The core action is choosing an intake and opening one offer that explains its costs, eligibility, scholarship and next step.

Ship three capabilities:

1. A China destination guide explaining study opportunities, facilities, funding and the differences between the March and September routes.
2. A searchable offer directory with university, level, intake and teaching-language filters, using only the universities in Offer-2027(1).zip.
3. Offer detail pages showing majors, original versus scholarship fees, accommodation, documents, deadlines, progression conditions and a link to the existing free assessment.

Use existing routing, locale support, layout and consultation form. No account is required to browse. Retain other countries' database-backed programs. Keep the new China offers in a versioned, reviewed manifest so the update does not depend on running the existing destructive whole-table seed script. The manifest is authoritative for this public China 2027 catalogue; legacy database rows are retained, but excluded from directory results. Legacy detail URLs remain available. New China offers are edited through this manifest, not the existing database program editor.

## Phase 3 Happy path

China guide → Explore universities and programs → offer details → free profile assessment. The guide exposes the value and next step immediately; the directory starts populated and offers reset links when filters return no results. Links and filters preserve the selected locale.

## Phase 4 Distribution and advantage

Direct the agency's China posts, lead campaigns and WhatsApp enquiries to the guide or an intake-filtered directory. The useful distinction is its reviewed offer inventory and Bangladesh counselling support. The website makes no claim of exclusive university access, guaranteed scholarships or guaranteed admission.

## Editorial controls

- Archive folder names establish the March / September 2027 intake. Empty folders do not establish available offers.
- Preserve fee units, award duration, annual review conditions and country restrictions. Harbin Far East's supplied language offer excludes Bangladesh and must say so prominently.
- Flag conflicting MOI statements, unusual fees and accommodation availability. Never silently repair them into an attractive offer.
- General CSC coverage is explanatory; it must not be applied to every listed offer.
- QS badges identify the ranking system and edition. Unattributed rankings in the archive are not republished.
- No university outside the archive is added. No partner-status or accreditation claims are inferred from the existence of a document.

## Sources checked 10 November 2026

- Agency pages: https://www.studyabroadconsultantbd.com/destinations/china and https://www.studyabroadconsultantbd.com/programs?country=china
- Reference search: https://search.cucas.cn/
- CSC explanation republished by Shanghai government: https://english.shanghai.gov.cn/en-Individuals-HigherEducation-Scholarships/20260813/305c553a1e5946929d81b3715bff50e0.html
- Rankings: individual QS 2027 profiles for Tongji, Xi'an Jiaotong, Xiamen, HUST and SCUT at https://www.topuniversities.com/universities/
- TOEFL scale: https://www.ets.org/toefl/test-takers/ibt/scores/understand-scores.htm.html — TOEFL 3.5 is valid on the new 1–6 scale; it is not treated as a malformed score.
- SCUT foundation admission guide, used to flag an MOI-policy difference rather than replace the supplied 2027 offer: https://www.scut.edu.cn/en/2025/1202/c607a58742/page.htm
- Campus facilities: https://iso.hust.edu.cn/Services_Information/Campus_Facilities/Housing___Dining.htm and https://english.life.hust.edu.cn/Education/UPSaclay/Campus_Life.htm

The supplied Facebook reel was inaccessible. Campus China could not be fully retrieved. Neither is treated as verified evidence for an individual offer.

## Maintenance and validation

Edit `lib/china-2027/offers.json` to update China 2027 offer details. Each record retains its archive source path. Add a new institution only after the agency approves it. The database program editor continues to manage other countries; it does not overwrite this versioned China catalogue.

The new foundation level names extend the existing text-column value list; no database migration or destructive seed is required. The annual cost calculator only receives eligible, exact annual original tuition, so semester charges, ranges, combined packages and unknown prices cannot silently become an annual estimate.

Checks completed for this change:

- TypeScript type check passed.
- ESLint passed with generated `.next-dev` output excluded.
- 21 catalogue, comparison and assessment tests passed.
- 88 views server-rendered in English and Bengali, covering the guide, directory states and every offer detail. Heading counts, links, filters and the restricted offer's action were checked.
- Browser screenshots and local HTTP checks were blocked by this environment's socket / network restrictions. No visual browser or end-to-end validation is claimed.
- A production build and live database integration were not validated without the deployment's database and Clerk configuration. Review the deployment preview before merging.

The notable owner-review items are the XJTU English engineering fee, SCUT foundation MOI policy, unspecified Xingtai / Hechi country restrictions, Hangzhou Normal's teaching-language label, and final dormitory availability. Their uncertainty remains visible in the relevant offers. Harbin Far East is clearly marked as unavailable to Bangladesh and has no application CTA.
