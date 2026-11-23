# Malaysia catalogue import and coverage report

**NOT READY FOR DEPLOYMENT.** All 149 files have dispositions, but original-layout review is incomplete. Do not equate extraction/row mapping with sign-off.

Catalogue: 31 institutions/groups; 2039 programme / pathway records; 2259 dated fee schedules.
PDF page review: 88 / 466 visually inspected; 378 pending. Both JPEGs, all supplied nonblank workbook cells and the original DOCX link were checked.

All 25 inventoried mock IDs are excluded from public reads, comparison, matching, calculator, related records, static parameters and sitemap. The seed no longer creates Malaysia mocks. Offline guarded SQL is in `retire-mocks.sql`; no production migration or deployment was executed. There are no verified one-to-one successor redirects.

## Source conflicts and holds

- **lincoln-management-mode** — [{"id": "MY-113", "page": 19, "rows": [134, 135]}, {"id": "MY-114", "page": 19, "rows": [134, 135]}]: Both rows print PhD Management, Research, 3 years; programme totals RM54,200 and RM47,000. Both schedules retained; no ODL mode inferred.
- **klust-accountancy-code** — [{"id": "MY-025", "page": 1, "field": "programme code"}, {"id": "MY-075", "page": 1, "field": "programme code"}]: Same title, different printed codes: R3/0411/6/0107 and R2/344/6/0523. Separate code identities retained; confirm successor/eligibility.
- **klust-mba-odl-dates** — [{"id": "MY-013", "page": 1, "field": "intake and fee matrix"}, {"id": "MY-067", "page": 1, "field": "intake and fee matrix"}, {"id": "MY-014", "page": 1, "field": "fee matrix"}, {"id": "MY-068", "page": 1, "field": "fee matrix"}]: RM12,660 schedules have different printed cohorts (July–November 2026 vs March 2026). RM13,000 variants differ in their printed discount rows/terms; no filename-based merging.
- **binary-doctorate-award** — [{"id": "MY-124", "page": 3, "field": "column heading / banner / tuition rows"}]: Heading says After MYBIG 50%, banner says RM10K; base RM60,000 and conditional RM50,000 retained. Eligibility/award wording needs confirmation.
- **help-market** — [{"id": "MY-005", "page": 1, "rows": ["Diploma in Early Childhood Education", "Diploma in Education"]}, {"id": "MY-005", "page": 2, "field": "international audience and conditions"}]: Header is international; filename is JAPAN. Bangladesh applicability of the two discounted 2026 rows is unresolved. Public rows quote original RM46,800 / RM47,200 only.
- **school-issuer** — [{"id": "MY-128", "page": "JPEG", "field": "Swadesh Global branding"}, {"id": "MY-129", "page": "JPEG", "field": "unnamed yearly fee table"}]: No verified Cranbridge issuer attribution. Both images retained privately; school-specific prices and limited-time registration discount are held.
- **taylor-printed-duration** — [{"id": "MY-145", "page": 13, "programme": "Master of Applied Computing", "intake": "September", "field": "duration “1 Months”"}]: All 18 original pages were inspected and programme/intake/currency mappings replaced with explicit reviewed rows. September Master of Applied Computing still prints “1 Months”; the literal duration is retained pending issuer confirmation.
- **binary-mba-instalments** — [{"id": "MY-124", "page": "2", "title": "Binary University — scanned fee and scholarship schedule", "period": "2025/2026"}]: Yearly amounts sum to 26040, printed conditional total 30240; difference 4200.
- **kings-odl-total** — [{"id": "MY-126", "page": "2", "title": "Kings University College — fee schedule", "period": "2026"}, {"id": "MY-126", "page": "1", "title": "Kings University College — fee schedule", "period": "2026"}, {"id": "MY-126", "page": "4", "title": "Kings University College — fee schedule", "period": "2026"}]: MBA ODL: printed semester amounts and total differ; confirm which payment plan applies.
- **klust-historical-code-identity** — [{"id": "MY-030", "page": "1", "field": "programme code"}, {"id": "MY-030", "page": "2", "field": "programme code"}, {"id": "MY-080", "page": "1", "field": "programme code"}, {"id": "MY-080", "page": "2", "field": "programme code"}, {"id": "MY-109", "page": "1", "field": "programme code"}, {"id": "MY-109", "page": "4", "field": "programme code"}]: Same-title KLUST records retain different printed codes: KP/JPS(R3/0321/6/0001)1/29; KP/JPS(R3/0321/6/0011)1/29. Historical successor identity is not established; no code-based merging or redirect is inferred.
- **klust-historical-code-identity** — [{"id": "MY-046", "page": "1", "field": "programme code"}, {"id": "MY-046", "page": "2", "field": "programme code"}, {"id": "MY-046", "page": "3", "field": "programme code"}, {"id": "MY-097", "page": "1", "field": "programme code"}, {"id": "MY-097", "page": "2", "field": "programme code"}, {"id": "MY-097", "page": "3", "field": "programme code"}, {"id": "MY-109", "page": "3", "field": "programme code"}, {"id": "MY-109", "page": "1", "field": "programme code"}, {"id": "MY-109", "page": "4", "field": "programme code"}]: Same-title KLUST records retain different printed codes: KP/JPS(R3/0715/4/0003)8/28; KP/JPS(R2/525/4/0037)8/28. Historical successor identity is not established; no code-based merging or redirect is inferred.
- **klust-historical-code-identity** — [{"id": "MY-021", "page": "1", "field": "programme code"}, {"id": "MY-021", "page": "2", "field": "programme code"}, {"id": "MY-072", "page": "1", "field": "programme code"}, {"id": "MY-072", "page": "2", "field": "programme code"}, {"id": "MY-110", "page": "1", "field": "programme code"}, {"id": "MY-110", "page": "3", "field": "programme code"}]: Same-title KLUST records retain different printed codes: KP/JPS(R2/0323/8/0005)10/33; KP/JPS(R/321/8/0049)10/26. Historical successor identity is not established; no code-based merging or redirect is inferred.
- **klust-historical-code-identity** — [{"id": "MY-023", "page": "1", "field": "programme code"}, {"id": "MY-023", "page": "2", "field": "programme code"}, {"id": "MY-074", "page": "1", "field": "programme code"}, {"id": "MY-074", "page": "2", "field": "programme code"}, {"id": "MY-110", "page": "1", "field": "programme code"}, {"id": "MY-110", "page": "3", "field": "programme code"}]: Same-title KLUST records retain different printed codes: KP/JPS(R2/0611/8/0034)09/33; KP/JPS(R/481/8/0200)09/26. Historical successor identity is not established; no code-based merging or redirect is inferred.

Additional record-level arithmetic / eligibility queries: 178 total entries in `source-conflicts.json`, keyed to source location and affected programme IDs.

Possible same-title identity groups needing review: 5. Distinct code/campus/provider/mode variants remain separate; linked exact duplicate sources: 1.

## Representative source checks

| Source | Location | Item | Currency / amount | Result |
|---|---|---|---|---|
| MY-002 | 2 | PhD in Business Administration, full-time on-campus — Total Published Fee | MYR 60800.00 | matched |
| MY-002 | 2 | PhD in Business Administration, full-time on-campus — Total Programme Fee (After Scholarship) | MYR 45800.00 | matched |
| MY-024 | 1 | Bachelor in Software Engineering (Honours) — Total fee, discounted schedule | MYR 91340.00 | matched |
| MY-090 | 1 | Bachelor in Software Engineering (Honours) — Total fee, normal schedule | MYR 105900.00 | matched |
| MY-024 | 1 | Bachelor in Software Engineering (Honours) — Total semester fees with 6% SST | MYR 87420.00 | matched |
| MY-113 | 1 | PhD in Medical Anatomy — Programme total | MYR 59200 | matched |
| MY-119 | 1 | Doctor of Philosophy in Management (by Research) — Grand Total | USD 12748 | matched |
| MY-124 | 2 | Master of Business Administration (MBA) — Fees | MYR 54000 | matched |
| MY-124 | 2 | Master of Business Administration (MBA) — After MYBIG 50% Scholarship | MYR 30240 | matched |
| MY-127 | 4 | Intensive English Programme — Amount | MYR 5000 | matched |
| MY-129 | JPEG | Reception — Yearly | MYR 13014 | held — school attribution unresolved |
| MY-131 | Basic Invoice!D17 | Cyberjaya — Bus | MYR 250 | matched |
| MY-131 | Basic Invoice!E17 | Cyberjaya — Van/MPV | MYR 320.00 | matched |
| MY-134 | 2 | Subject group including Artificial Intelligence — Degree Level 1 full-payment option | MYR 34900 | matched |
| MY-138 | 1 | Foundation in Business, Arts, Science and IT — Approximate Tuition Fee | MYR 21931 | matched |
| MY-140 | 1 | Bachelor of Science (Honours) in Applied Artificial Intelligence — Total Programme Fee | MYR 77250 | matched |
| MY-144 | 1 | Cambridge GCE Advanced Level — Grand total fees | MYR 44375 | matched |
| MY-148 | 2 | Diploma in Nursing — Total Fee | MYR 59955 | matched |
| MY-148 | 2 | Diploma in Nursing — 1st Sem | MYR 17175 | matched |

## Institution totals

| Institution | Records | Schedules | Levels |
|---|---:|---:|---|
| Kuala Lumpur University of Science and Technology (KLUST) | 56 | 143 | {"bachelor": 23, "diploma": 12, "phd": 7, "foundation": 2, "language": 2, "master": 10} |
| ALFA University College | 58 | 58 | {"bachelor": 12, "diploma": 20, "phd": 8, "foundation": 2, "graduate_certificate": 1, "graduate_diploma": 2, "master": 13} |
| Asia e University (AeU) | 10 | 10 | {"bachelor": 2, "diploma": 1, "foundation": 1, "graduate_diploma": 1, "master": 3, "phd": 2} |
| KPJ Healthcare University | 22 | 22 | {"bachelor": 8, "diploma": 6, "phd": 1, "foundation": 1, "master": 6} |
| Limkokwing University | 11 | 11 | {"bachelor": 6, "phd": 1, "foundation": 1, "master": 3} |
| UNITAR International University | 56 | 56 | {"bachelor": 18, "diploma": 14, "phd": 6, "foundation": 6, "master": 11, "graduate_diploma": 1} |
| Sunway University / Sunway education programmes | 92 | 92 | {"degree_transfer": 2, "foundation": 6, "bachelor": 39, "certificate": 2, "diploma": 14, "phd": 10, "master": 18, "other": 1} |
| Monash University Malaysia | 0 | 0 | {} |
| Global Modern International School (GMIS) | 9 | 9 | {"ausmat": 1, "school": 8} |
| Lincoln University College | 183 | 184 | {"bachelor": 55, "diploma": 21, "phd": 33, "foundation": 5, "master": 64, "certificate": 1, "other": 1, "postgraduate_diploma": 3} |
| Management & Science University (MSU) | 181 | 313 | {"diploma": 56, "bachelor": 80, "phd": 11, "foundation": 9, "master": 25} |
| INTI | 148 | 148 | {"bachelor": 55, "master": 21, "degree_transfer": 4, "foundation": 16, "certificate": 7, "diploma": 37, "phd": 5, "language": 3} |
| University of Cyberjaya (UoC) | 60 | 60 | {"bachelor": 20, "diploma": 13, "phd": 7, "foundation": 4, "master": 16} |
| MAHSA University | 97 | 97 | {"diploma": 27, "bachelor": 30, "phd": 9, "foundation": 3, "master": 20, "other": 4, "postgraduate_certificate": 3, "postgraduate_diploma": 1} |
| Universiti Geomatika Malaysia | 40 | 40 | {"phd": 5, "bachelor": 16, "diploma": 2, "language": 3, "foundation": 2, "master": 12} |
| Goon Institution | 16 | 16 | {"bachelor": 3, "certificate": 5, "diploma": 7, "foundation": 1} |
| Binary University | 45 | 45 | {"bachelor": 13, "phd": 19, "foundation": 1, "master": 12} |
| University of Wollongong Malaysia (UOW Malaysia) | 53 | 53 | {"other": 1, "bachelor": 20, "certificate": 2, "diploma": 12, "phd": 5, "foundation": 4, "master": 7, "postgraduate_certificate": 1, "postgraduate_diploma": 1} |
| Asia Pacific University (APU) / APIIT | 64 | 64 | {"foundation": 3, "language": 1, "certificate": 2, "bachelor": 4, "diploma": 11, "phd": 12, "master": 29, "postgraduate_certificate": 1, "postgraduate_diploma": 1} |
| Kings University College | 21 | 21 | {"bachelor": 8, "diploma": 6, "foundation": 2, "master": 5} |
| HELP University / HELP Academy | 29 | 29 | {"bachelor": 19, "certificate": 1, "diploma": 5, "foundation": 2, "language": 1, "degree_transfer": 1} |
| BAC Education Group | 44 | 44 | {"bachelor": 15, "foundation": 6, "diploma": 11, "phd": 4, "master": 4, "other": 3, "degree_transfer": 1} |
| SEGi | 137 | 137 | {"bachelor": 67, "certificate": 10, "language": 3, "diploma": 28, "phd": 5, "foundation": 4, "master": 20} |
| Spectrum International University College | 16 | 16 | {"other": 2, "bachelor": 4, "diploma": 5, "phd": 1, "foundation": 1, "language": 1, "master": 2} |
| City University Malaysia | 83 | 83 | {"bachelor": 28, "diploma": 24, "phd": 11, "foundation": 8, "master": 12} |
| MILA University | 25 | 25 | {"bachelor": 10, "diploma": 2, "phd": 3, "foundation": 3, "master": 7} |
| Universiti Tun Abdul Razak (UNIRAZAK) | 36 | 36 | {"bachelor": 14, "diploma": 6, "phd": 3, "foundation": 1, "master": 10, "master_phd": 1, "postgraduate_diploma": 1} |
| Universiti Kuala Lumpur (UniKL) | 146 | 146 | {"bachelor": 70, "diploma": 25, "phd": 12, "other": 1, "foundation": 8, "master": 30} |
| Universiti Selangor (UNISEL) | 79 | 79 | {"bachelor": 30, "diploma": 26, "phd": 7, "foundation": 5, "master": 11} |
| Taylor’s University / Taylor’s College | 145 | 145 | {"other": 3, "diploma": 11, "degree_transfer": 4, "foundation": 13, "bachelor": 51, "phd": 29, "language": 1, "master": 32, "postgraduate_certificate": 1} |
| Multimedia University (MMU) | 77 | 77 | {"bachelor": 35, "diploma": 13, "phd": 7, "language": 1, "master": 14, "foundation": 7} |

## Reproduction and verification

```sh
python3 imports/malaysia-offers-import/verify_sources.py --extract-to /tmp/sac-malaysia-sources
python3 scripts/malaysia/extract_tables.py
python3 scripts/malaysia/extract_lincoln.py
python3 scripts/malaysia/build_catalogue.py --apply
python3 scripts/malaysia/build_catalogue.py --check
npm run test:malaysia
npm run test:programs
npm run lint
npm run typecheck
npm run build
npm run audit:malaysia
npm run check:malaysia-release
tsx scripts/reconcile-malaysia.ts --snapshot imports/malaysia-offers-import/audit/database-before.json --write-sql imports/malaysia-offers-import/audit/retire-mocks.sql
```

Python extraction tools require `scripts/malaysia/requirements.txt`. The release command intentionally exits nonzero while original-page sign-off or source questions remain. See `browser-verification.json` for rendered route/locale checks when available.
