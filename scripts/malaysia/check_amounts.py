#!/usr/bin/env python3
"""Private diagnostic only: amount presence cannot establish column association.

Run verify_sources.py --extract-to /tmp/sac-malaysia-sources first. Original
scans require the separately logged full-page visual review.
"""
import json,csv,re,subprocess,concurrent.futures
from decimal import Decimal
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
P=ROOT/'imports/malaysia-offers-import';C=json.loads((ROOT/'lib/malaysia/catalogue.json').read_text());I=list(csv.DictReader((P/'source-index.csv').open(encoding='utf-8-sig')));D={r['source_id']:json.loads((P/r['extracted_json']).read_text()) for r in I}
def numbers(text):
 text=re.sub(r'(?<=\d)\s*,\s*(?=\d)',',',text)
 vals=[]
 for m in re.finditer(r'(?<![\d.])\d+(?:,\d{3})*(?:\.\d+)?(?![\d.])',text):
  try: vals.append(Decimal(m[0].replace(',','')))
  except:pass
 return set(vals)
def read(r):
 k=r['source_id'];path=Path('/tmp/sac-malaysia-sources')/(k+'.pdf')
 if path.exists():
  t=subprocess.check_output(['pdftotext','-layout',str(path),'-']).decode('utf8','replace').split('\f')
  return k,{str(j+1):t[j]+'\n'+p.get('ocr',{}).get('layout_text','') for j,p in enumerate(D[k]['pages'])}
 return k,{'all':json.dumps(D[k],ensure_ascii=False)}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:original=dict(pool.map(read,I))
sets={k:{p:numbers(t) for p,t in v.items()} for k,v in original.items()}
miss=[];checked=0
for s in C['schedules']:
 available=set()
 for r in s['refs']:available|=sets[r['id']].get(r['page'],sets[r['id']].get('all',set()))
 for t in s['tables']:
  for ri,row in enumerate(t['rows']):
   for ci,value in enumerate(row[1:],1):
    for n in numbers(value):
     if n<100:continue
     checked+=1
     if n not in available:miss.append(dict(schedule=s['id'],sources=s['refs'],table=t['caption'],row=ri,column=ci,value=value,number=str(n)))
report=dict(checkedAmounts=checked,unmatched=miss,note='Independent amount-presence check against original PDFs via pdftotext, visually reviewed OCR for scans, and supplied workbook cells. Presence does not verify row/column association. All mismatches require investigation.')
(P/'audit/amount-presence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checked':checked,'unmatched':len(miss),'bySource':{k:sum(m['sources'][0]['id']==k for m in miss) for k in sorted(set(m['sources'][0]['id'] for m in miss))}},indent=2))
