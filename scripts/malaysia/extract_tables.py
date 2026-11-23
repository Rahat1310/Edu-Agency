#!/usr/bin/env python3
"""Private geometric table candidates. These are review aids, never public assets."""
import concurrent.futures,json
from pathlib import Path
import pdfplumber
ROOT=Path(__file__).resolve().parents[2]
def extract(n):
    pages=[]
    with pdfplumber.open(f'/tmp/sac-malaysia-sources/MY-{n:03}.pdf') as doc:
        for number,page in enumerate(doc.pages,1):
            tabs=[]
            for tab in page.find_tables():
                tabs.append(dict(bbox=list(tab.bbox),rows=tab.extract(),cells=[[list(c) if c else None for c in row.cells] for row in tab.rows]))
            pages.append(dict(page=number,tables=tabs))
    return f'MY-{n:03}',pages
if __name__=='__main__':
    numbers=[3,5,109,110,115,116,117,118,119,120,121,122,123,125,126,133,134,135,136,137,138,139,140,142,143,144,145,146,147]
    with concurrent.futures.ProcessPoolExecutor(max_workers=4) as pool:results=dict(pool.map(extract,numbers))
    (ROOT/'imports/malaysia-offers-import/audit/table-candidates.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
    print(f'Extracted table candidates from {len(results)} originals')
