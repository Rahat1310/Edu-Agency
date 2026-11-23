import json,re

from pathlib import Path
allrows={}
for n in [113,114]:
 d=json.load(open(f'imports/malaysia-offers-import/extracted/MY-{n:03}.json'))['pages'];rows=[]
 for p in d:
  words=p['words_bbox']
  def textbox(rect):
   x0,y0,x1,y1=rect
   selected=[w for w in words if x0<=(w[0]+w[2])/2<x1 and y0<=(w[1]+w[3])/2<y1]
   selected.sort(key=lambda w:(round(w[1]/3),w[0]))
   return ' '.join(w[4] for w in selected)
  # Year column is found from the first Year 1 pair on each page.
  year1=[]
  for k,w in enumerate(words[:-1]):
   v=words[k+1]
   if w[4]=='Year' and v[4]=='1' and abs(v[1]-w[1])<3 and 320<w[0]<440:year1.append(w)
  if not year1:continue
  year1.sort(key=lambda w:w[1]);yearx=year1[0][0]
  # Column boundaries scale with the table's Year column. The earlier part has variable widths.
  # Programme number and full programme title can be extracted by the printed level column.
  for j,w in enumerate(year1):
   y0=w[1]-4;y1=year1[j+1][1]-4 if j+1<len(year1) else 565
   ys=[q[1] for k,q in enumerate(words[:-1]) if q[4]=='Year' and abs(q[1]-words[k+1][1])<3 and words[k+1][4].isdigit() and q[0]>yearx-2 and q[0]<yearx+2 and y0<q[1]<y1]
   if ys:y1=min(y1,max(ys)+14)
   box=lambda x0,x1:re.sub(r'\s+',' ',textbox((x0,y0,x1,y1))).strip()
   number=box(18,39)
   if not re.fullmatch(r'\d+',number):continue
   # Use row's level/mode word positions, not assumptions from the filename.
   levs=[q for q in words if y0<q[1]<y1 and q[4] in ['PhD','Master','Bachelor','Diploma','Foundation','Certificate'] and q[0]>200 and q[0]<yearx-20]
   if not levs:continue
   lx=min(q[0] for q in levs)
   # Level is a single word column. The longest title cannot cross its left boundary.
   levelw=min(levs,key=lambda q:q[0])
   # Physical boundaries established from the header's columns for each file.
   bounds=[39,250,290,345,392,424,463,512,565,635,674,710,756] if n==113 else [39,220,260,315,363,395,434,484,536,586,630,673,716,756]
   # Source pages occasionally use a slightly narrower title; detect the title/level gap by row level x.
   bounds[1]=lx-3
   title=box(39,bounds[1]);cells=[box(bounds[i],bounds[i+1]) for i in range(1,len(bounds)-1)]
   payments=[]
   for k,q in enumerate(words[:-1]):
    if q[4]=='Year' and abs(q[1]-words[k+1][1])<3 and words[k+1][4].isdigit() and abs(q[0]-yearx)<2 and y0<q[1]<y1:
     rect0,rect1=y0,y1;y0=q[1]-3;y1=q[3]+3
     payments.append(['Year '+words[k+1][4],*[box(bounds[z],bounds[z+1]) for z in range(6,11)]])
     y0,y1=rect0,rect1
   rows.append(dict(page=p['page'],number=number,title=title,yearX=yearx,cells=cells,payments=payments,rect=[y0,y1]))
 allrows[str(n)]=rows
Path('imports/malaysia-offers-import/audit/lincoln-candidates.json').write_text(json.dumps(allrows,indent=2))
for n,rows in allrows.items():
 print(f'MY-{n}: {len(rows)} programme rows extracted to the private audit')
