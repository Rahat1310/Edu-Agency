#!/usr/bin/env python3
"""Build reviewed public Malaysia records; never copy whole source extracts.

The private pack is deliberately required. Unmapped pages remain audit items,
not implicit evidence of programme/fee coverage. No network or DB writes.
"""
import csv
import hashlib
import json
import os
import sys
import subprocess
import re
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACK = ROOT / 'imports/malaysia-offers-import'
OUT = ROOT / 'lib/malaysia/catalogue.json'
NS = uuid.UUID('796abbe9-8a64-51bd-9233-6bb365fe6a21')
subprocess.run([sys.executable,str(PACK/'verify_sources.py')],check=True,capture_output=True)
index = list(csv.DictReader((PACK/'source-index.csv').open(encoding='utf-8-sig')))
source = {r['source_id']: r for r in index}
docs = {sid: json.loads((PACK/r['extracted_json']).read_text()) for sid,r in source.items()}
catalogue = dict(edition='2026-11-22', institutions=[], programmes=[], schedules=[])
audit = {sid: dict(sourceId=sid, sha256=r['sha256'], pages=[dict(page=p['page'], disposition='unmapped', programmeIds=[], scheduleIds=[], visualReview='pending') for p in docs[sid].get('pages',[])], disposition='pending') for sid,r in source.items()}
programmes = {}
schedules = {}


def clean(s):
    return re.sub(r'\s+', ' ', s).strip()


def sid(n): return f'MY-{n:03}'
def page(n,p):
    pg = docs[sid(n)]['pages'][p-1]
    return pg.get('ocr',{}).get('layout_text',pg['layout_text']) if len(pg['layout_text'])<600 else pg['layout_text']
def institution(key,n,kind='university',name=None,aliases=None,notes=None,links=None):
    catalogue['institutions'].append(dict(id=key,name=name or source[sid(n)]['institution_or_group'],kind=kind,aliases=aliases or [],notes=notes or [],links=links or []))
def ref(n,p,period):
    # Human-facing titles, never archive paths, bank material or private filenames.
    return dict(id=sid(n),page=str(p),title=source[sid(n)]['institution_or_group']+' — '+source[sid(n)]['role'].replace('nested discount schedule','international fee schedule').replace('nested normal schedule','international fee schedule'),period=period)
def level(title):
    s=title.lower()
    if re.search(r'\b(phd|ph\.d|doctor|doctorate)\b',s):return 'phd'
    if re.search(r'\b(master|msc|mba|m\.sc|llm)\b',s):return 'master'
    if re.search(r'\b(bachelor|bsc|b\.sc|b\.a|beng|llb|bba)\b',s) or re.match(r'^(?:[34](?:\.5)?\+0\s+)?ba\b',s):return 'bachelor'
    if re.search(r'\b(foundation|a.level|advanced level|matriculation|ausmat|pre-university)\b',s):return 'foundation'
    if re.search(r'post[ -]?graduate diploma',s):return 'postgraduate_diploma'
    if re.search(r'post[ -]?graduate certificate',s):return 'postgraduate_certificate'
    if 'graduate diploma' in s:return 'graduate_diploma'
    if 'graduate certificate' in s:return 'graduate_certificate'
    if 'degree transfer' in s:return 'degree_transfer'
    if 'diploma' in s:return 'diploma'
    if 'english' in s and not ('teaching' in s or 'education' in s):return 'language'
    return 'certificate' if 'certificate' in s else 'other'
def add_program(inst,title,code=None,provider=None,campus=None,mode=None,duration=None,intakes=None,notes=None,lev=None):
    title=clean(title)
    identity='|'.join(clean(str(s or '')).casefold() for s in [inst,provider,campus,lev or level(title),mode,(code or '')+'|'+title])
    if identity not in programmes:
        programmes[identity]=dict(id=str(uuid.uuid5(NS,identity)),identityKey=identity,institutionId=inst,title=title,code=code,provider=provider,campus=campus,level=lev or level(title),mode=mode,duration=duration,intakes=intakes or [],scheduleIds=[],notes=notes or [])
    return programmes[identity]
def add_schedule(pr,n,p,period,tables,terms=None,label=None,audience='International students; confirm current availability',extra_pages=None,variant_key=None):
    identity=f'{sid(n)}:{p}:{pr["id"]}'+(':'+variant_key if variant_key else '')
    item=dict(id=str(uuid.uuid5(NS,identity)),label=label or f'{period} fee schedule',period=period,status='historical' if '2025' in period and '2026' not in period else 'confirmation-required',audience=audience,refs=[ref(n,pg,period) for pg in dict.fromkeys([p,*(extra_pages or [])])],tables=tables,terms=terms or [])
    if identity in schedules:
        old=schedules[identity]
        assert old['tables']==item['tables'] and old['terms']==item['terms'],f'Conflicting schedule key {identity}: {pr["title"]}; define a source variant key'
    schedules[identity]=item
    pr['scheduleIds'].append(item['id'])
    for pg in ([p,*(extra_pages or [])] if docs[sid(n)].get('pages') else []):
        a=audit[sid(n)]['pages'][pg-1];a['disposition']='imported';a['programmeIds'].append(pr['id']);a['scheduleIds'].append(item['id'])
    audit[sid(n)]['disposition']='mapped'
    return item

def table(caption,headers,rows):
    assert all(len(r)==len(headers) for r in rows),(caption,len(headers),rows)
    return dict(caption=caption,headers=headers,rows=rows)

def paragraphs(text):
    # Explicitly exclude payment routing. Public CTA uses the consultation flow.
    text=re.split(r'BANK ACCOUNT DETAILS|BANK DETAILS|Bank Details:',text,flags=re.I)[0]
    return [clean(s) for s in re.split(r'\n\s*\n',text) if clean(s)]

# KLUST: stable programme codes; same-title accountancy collision stays separate.
institution('klust',6,aliases=['IUKL','Infrastructure University Kuala Lumpur','Kuala Lumpur University of Science & Technology'],notes=['Former IUKL branding appears in dated sources. Accountancy codes differ between schedules and need confirmation before combining.'])
for row in csv.DictReader((PACK/'klust-schedule-index.csv').open(encoding='utf-8-sig')):
    n=int(row['source_id'][3:]);text=page(n,1);title=row['programme_name_printed'];code=row['programme_code_printed']
    cohort=clean(row['intake_printed'].replace('INTAKE :',''))
    audience=('Postgraduate' if row['audience_folder']=='POSTGRADUATE' else 'Undergraduate')+' international students'
    # IEP audiences are distinct, not additional degrees. All price variants share a programme.
    provider=audience if 'ENGLISH' in title else None
    pr=add_program('klust',title,code,provider=provider,mode='ODL' if 'ODL' in title else None,intakes=[cohort],notes=['Accountancy programme codes differ in the supplied normal and discount schedules; confirm code applicability.'] if 'ACCOUNTANCY' in title else [])
    if cohort not in pr['intakes']:pr['intakes'].append(cohort)
    fee_rows=[];pending=''
    raw=text.split('Notes:-')[0]
    # Amounts are transcribed per printed row, not added or annualised.
    money=re.compile(r'\(?[\d,]+\.\d{2}\)?|(?<!\S)-(?!\S)')
    for line in raw.splitlines():
        matches=list(money.finditer(line))
        if not matches:continue
        label=clean(line[:matches[0].start()])
        values=[m.group() for m in matches]
        if not label:
            # Wrapped labels are handled using the preceding non-numeric source line.
            before=raw[:raw.find(line)].splitlines()
            label=clean(next((l for l in reversed(before) if l.strip()),''))
        if re.search(r'^(Jul|Jun|Mar|May|Oct|Nov|Dec) \d',label):continue
        if not label or label.startswith('('):
            before=raw[:raw.find(line)].splitlines()
            label=clean(next((l for l in reversed(before) if l.strip() and not money.search(l)),''))+' '+label
        if len(values)>1:
            for i,value in enumerate(values):
                fee_rows.append([clean(label),f'Printed payment column {i+1}' if i<len(values)-1 else 'Printed total',value])
        else:fee_rows.append([label,'Printed amount',values[0]])
    # Keep semester names and academic periods in the same source order as the amounts.
    period_lines=[clean(l) for l in raw.splitlines() if re.search(r'Academic Period|Sem \(\d|IEP - LEVEL|(?:Jul|Mar|Jun|Oct|Nov|Dec|May)-\d\d',l)]
    terms_text='\n'.join(page(n,p) for p in range(1,len(docs[sid(n)]['pages'])+1))
    terms_text=terms_text[terms_text.find('Notes:-')+7:]
    numbered=re.split(r'\n\s*(?=\d+\))',terms_text)
    terms=[]
    for part in numbered:
        part=clean(part)
        if re.match(r'7\)',part):
            terms.append('Payment methods: official university online/student portal, card, e-wallet, bank draft or transfer. Obtain payment instructions through the official application process.');continue
        if part and 'Bank :' not in part and 'Account No' not in part:terms.append(part)
    # Reconstruct the matrix: column order is printed, not an annual estimate.
    matrix=[]
    for fee_label,basis,amount in fee_rows:
        if basis=='Printed payment column 1':matrix.append([fee_label,amount])
        elif basis.startswith('Printed payment column') or basis=='Printed total':
            if matrix and matrix[-1][0]==fee_label:matrix[-1].append(amount)
        else:matrix.append([fee_label,amount])
    width=max(len(r) for r in matrix)
    headers=['Fee / source label',*[f'Payment {i}' for i in range(1,width-1)],'Printed total']
    for r in matrix:
        if len(r)<width:r[1:1]=['Not applicable to this row']*(width-len(r))
    tables=[table('Printed semester / level fee schedule (MYR / RM)',headers,matrix)]
    # Indexed totals are checks against transcription; all lines above remain distinct.
    summary=[]
    for field,label in [('total_fee_rm_printed','Total fee'),('total_semester_fees_with_sst_rm_printed','Total semester fees with SST'),('application_processing_fee_rm_printed','Application / processing fee'),('twenty_percent_discount_total_rm_printed','20% discount (printed deduction)')]:
        if row[field]:summary.append([label,row[field]])
    if summary:tables.insert(0,table('Schedule totals (MYR / RM)',['Basis','Printed amount'],summary))
    terms=['Payment column order: '+'; '.join(period_lines),'A source dash is retained as “-”; it is not converted into zero.',*terms]
    label=('20% discount schedule' if row['twenty_percent_discount_total_rm_printed'] and re.search(r'[1-9]',row['twenty_percent_discount_total_rm_printed']) else 'Published price schedule')+' — '+cohort
    add_schedule(pr,n,1,cohort,tables,terms,label,audience,extra_pages=list(range(2,len(docs[sid(n)]['pages'])+1)))

# ALFA: fixed printed columns; source dashes and zero are preserved.
institution('alfa',1)
for p in [1,2,3]:
    text=page(1,p);lines=text.splitlines()
    starts=[]
    for i,line in enumerate(lines):
        m=re.match(r'\s*(F\d+|D\d+|GC\d+|GD\d+|B\d+|M\d+|P\d+)\s+',line)
        if m:starts.append((i,m))
    for j,(i,m) in enumerate(starts):
        end=starts[j+1][0] if j+1<len(starts) else len(lines)
        block=lines[i:end];first=block[0]
        if m[1]=='M7':block.insert(0,lines[i-1])
        title=[];amounts=[];duration=[]
        for l in block:
            if re.search(r'PROGRAMMES|University College|Page \d|INITIAL FEES|BANK ACCOUNT|GRADUATE|BACHELOR|MASTER PROGRAMMES',l):break
            if 'RM' in l:
                pos=l.index('RM');left=l[:pos];right=l[pos:]
                vals=re.findall(r'RM\s*([\d,]+)|(?<!\S)-(?!\S)',right)
                # The explicit column schema below supplies source dash meaning.
                amounts+= [x if x else '-' for x in vals]
            else:left=l
            c=re.sub(r'^\s*(?:F\d+|D\d+|GC\d+|GD\d+|B\d+|M\d+|P\d+)\s+','',left)
            cells=re.split(r'\s{2,}',c.strip())
            if cells:
                if re.match(r'\d',cells[0]):duration.append(clean(c));continue
                title.append(cells[0]);duration+=cells[1:]
        if not amounts:continue
        t=clean(' '.join(title));d=clean(' '.join(duration));
        t=t.replace(' Months','').replace(' AMOUNT','');d=d.replace(' Remarks:','');
        if m[1] in ['M1','M3','M4','M5']:d+=' Months'
        if m[1]=='M6':t='Master of Education in Early Childhood Education (By Research)'
        if m[1]=='M7':amounts=['13,500','1,500','11,500','-','26,500']
        prefix=re.sub(r'\d','',m[1])
        labels={'F':['Year 1','Resource fee','Total'],'D':['Year 1','Resource fee','Year 2','Year 3','Year 4 (dash = not scheduled)','Total'],'GC':['Year 1','Resource fee','Total'],'GD':['Year 1','Resource fee','Year 2','Total'],'B':['Year 1','Resource fee','Year 2','Year 3','Total'],'M':['Year 1','Resource fee','Year 2','Year 3 (dash = not scheduled)','Total'],'P':['Year 1','Resource fee','Year 2','Year 3','Total']}[prefix]
        if len(amounts)!=len(labels):
            labels=[f'Printed fee column {i+1}' for i in range(len(amounts)-1)]+['Total']
        pr=add_program('alfa',t,code=m[1],mode='ODL' if 'ODL' in t else None,duration=d)
        add_schedule(pr,1,p,'2025 intakes',[table('Programme fees (MYR / RM)',['Basis','Amount'],list(map(list,zip(labels,amounts)))),table('Initial fees (MYR / RM)',['Fee','Amount'],[['EMGS and visa processing','2,500'],['Registration','1,000'],['International student fee','1,500'],['Total initial fees upon application','5,000'],['EMGS and visa renewal','1,000']])],['New international students pay first-year tuition and initial fees in full upon EMGS/e-VAL approval.','All payments are non-refundable under any circumstances.','Extensions of studies are charged at regular fees.','ALFA UC reserves the right to change fees without prior notice.'],extra_pages=[3] if p!=3 else [])

# Asia e University: one programme-specific schedule per page.
institution('aeu',2,aliases=['AeU','Asia e University'])
for p in range(2,12):
    text=page(2,p);ls=[l for l in text.splitlines() if l.strip()];title=clean(ls[1]);duration=clean(re.search(r'Duration\s+([^\n]+)',text)[1]);mode=clean(re.search(r'Study Mode\s+([^\n]+)',text)[1])
    pr=add_program('aeu',title,mode=mode,duration=duration,intakes=['May 2026','September 2026'])
    rows=[]
    # Indented labels can wrap over subsequent lines; explicit fee labels remove ambiguity.
    labels=['EMGS visa processing (upon application)','Application & registration (before arrival)','First-year tuition (before arrival)','International student management & administration','Personal bond & security deposit','Second-year tuition','Third-year tuition']
    label_patterns=[r'Processing Fee\s+RM([\d,.]+)',r'& Registration Fee\s+RM([\d,.]+)',r'1st Year Tuition\s+RM([\d,.]+)',r'International\s+RM([\d,.]+)',r'Security Deposit\s+RM([\d,.]+)',r'2nd Year Tuition Fee\s+RM([\d,.]+)',r'3rd Year Tuition Fee\s+RM([\d,.]+)']
    for label,pattern in zip(labels,label_patterns):
        match=re.search(pattern,text)
        if match:rows.append([label,match[1]])
    for label,pattern in [('Total published fee',r'Total Published Fee\s+RM([\d,.]+)'),('Total programme fee after scholarship',r'Total Programme Fee\* \(After Scholarship\)\s+RM([\d,.]+)'),('English preparatory course & test (conditional)',r'Course & Test\*\*\s+RM([\d,.]+)'),('Immigration clearance & airport pickup (variable)',r'Clearance & Airport\s+RM([\d,.]+)'),('Visa renewal (three months before extension)',r'Visa Renewal\s+RM([\d,.]+)')]:
        match=re.search(pattern,text)
        if match:rows.append([label,match[1]])
    # Row values on the first line of wrapped labels.
    for label,pattern in [('EMGS visa processing (upon application)',r'EMGS Visa\s+RM([\d,.]+)'),('Application & registration (before arrival)',r'University Application\s+RM([\d,.]+)'),('Personal bond & security deposit',r'Personal Bond &\s+RM([\d,.]+)'),('English preparatory course & test (conditional)',r'English Preparatory\s+RM([\d,.]+)'),('Immigration clearance & airport pickup (variable)',r'Immigration\s+RM([\d,.]+)')]:
        match=re.search(pattern,text)
        if match and not any(r[0]==label for r in rows):rows.append([label,match[1]])
    terms=['Group 2: Central Asia, South Asia and Southeast Asia.','This fee structure applies to May 2026 and September 2026 intakes.','Fees exclude 6% SST. All fees are non-refundable.','English preparatory course: two semesters for applicants who do not meet minimum English requirements; each additional semester RM2,000.00.','Airport pickup/clearance varies by weekday or weekend; use Student Arrival Form guidelines.']
    if p==11:terms=[t for t in terms if not t.startswith('English preparatory')]
    add_schedule(pr,2,p,'2026 — May and September', [table('Published and conditional fees (MYR / RM)',['Fee / timing / basis','Printed amount'],rows)],terms,audience='Group 2 international students; scholarships subject to the printed programme and intake conditions')

# KPJ: single fixed-column international schedule.
institution('kpj',111)
text=page(111,1)
for line in text.splitlines():
    m=re.match(r'\s*\d+\s+(.+?)\s{2,}([\d.]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s*$',line)
    if not m:continue
    title,duration,*fees=m.groups();pr=add_program('kpj',title,duration=duration+' years')
    add_schedule(pr,111,1,'2025 — as of 1 July',[table('Fees (MYR / RM)',['Basis','Printed amount'],list(map(list,zip(['Visa application','Acceptance fee','Tuition fee','Total'],fees))))],['Annual visa renewal RM1,500 is excluded. Pay when submitting renewal three months before visa expiry.','6% tax is excluded from the printed fees.'])

# Limkokwing: preserve the printed base, discount, tax components and decimals.
institution('limkokwing',112)
lines=page(112,1).splitlines();starts=[i for i,l in enumerate(lines) if re.match(r'\s*\d+\s+',l)]
for j,i in enumerate(starts):
    begin=max(0,i-2) if j==0 else starts[j-1]+1
    # Wrapped programme names can precede row numbers; collect just the title column.
    previous=starts[j-1] if j else 0
    end=starts[j+1] if j+1<len(starts) else len(lines)
    titleparts=[]
    for l in lines[max(previous+1,0):end]:
        left=re.sub(r'^\s*\d+\s+','',l[:49]).strip()
        if left and not re.search(r'NO |Program|Actual|\(MYR\)',left):titleparts.append(left)
    vals=re.findall(r'[\d,]+\.\d{2}',lines[i])
    if len(vals)!=14:continue
    title=['Foundation in Science and Arts (International)','Bachelor of Business Administration','Bachelor of Arts in Interior Architecture','Bachelor of Science (Hons) in Software Engineering with Multimedia','Bachelor of Science (Hons) in Information Technology','Bachelor in Multimedia (Honours)','Bachelor of Arts (Honours) in Fashion Design','Master of Arts in Fashion and Brand Management','Master of E-Commerce','Master of Business Administration in General Management','Doctor of Philosophy (PHD) Information System'][j];pr=add_program('limkokwing',title)
    labels=['Registration actual','Registration SST 6%','Visa processing','International admin actual','International admin SST 6%','WOC','Resource actual','Resource SST 6%','Tuition base','Tuition after 50% discount','Tuition SST 6%','Total without SST','Total SST 6%','Total with SST']
    # Source has 14 amounts; fail-closed rather than shift associations.
    if len(vals)==len(labels):add_schedule(pr,112,1,'Undated',[table('Fees (MYR)',['Basis','Printed amount'],list(map(list,zip(labels,vals))))],['50% discount is a printed fee variant; confirm eligibility and validity before application.'])

# UNITAR: the printed January 2025 edition takes precedence over filenames.
institution('unitar',123,notes=['Printed January 2025; printing note 7 January 2025, published 17 February 2025.'])
for p in [1,2]:
    text=page(123,p)
    for line in text.splitlines():
        cells=[clean(c) for c in re.split(r'\s{2,}',line.strip())]
        if len(cells)<3 or not re.match(r'^(Foundation|Diploma|Bachelor|Master|Doctor|Post-Graduates)',cells[0]):continue
        if not re.fullmatch(r'[\d,]+',cells[-1]):continue
        title=cells[0];duration=cells[-2]
        pr=add_program('unitar',title,mode='Conventional' if p==1 else 'Online',duration=duration,intakes=['January','May','September'],lev='graduate_diploma' if 'Post-Graduates' in title else None)
        fees=[['Total programme fees',cells[-1]]]
        fees+= [['Upon application — application & EMGS (first year)','3,000'],['Upon VAL — initial advance fees','16,300'],['Total initial payment','19,300']] if p==1 else [['Application & EMGS','N/A'],['Upon registration — initial advance fees','13,000']]
        add_schedule(pr,123,p,'January 2025',[table('Fees (MYR / RM)',['Basis / timing','Printed amount'],fees)],['Conventional total includes application & EMGS, tuition, semester fees, registration, graduation and deposit.' if p==1 else 'Online total includes tuition, semester fees, registration, graduation and deposit.','Fees correct at printing 7 January 2025; subject to amendment without prior notice.'])

# Sunway: ordered programme and amount columns, including wrapped merged rows.
institution('sunway',144,kind='group',notes=['This grid does not specify a fee year. Confirm the current fee and awarding provider.'])
for p in [1,2,3]:
    text=page(144,p);names=[];amounts=[];current=''
    for line in text.splitlines():
        amount=re.search(r'(?<![A-Z])\b(\d{1,3},\d{3})\s*$',line)
        if amount:amounts.append(amount[1])
        left=line[:60].strip()
        if amount:left=line[:min(amount.start(),60)].strip()
        if re.match(r'^(CAMBRIDGE|AUSTRALIAN|CANADIAN|FOUNDATION|MONASH|CERTIFICATE|DIPLOMA IN|BACHELOR|BSC |BA \(|MASTER|DOCTOR|AMERICAN)',left):
            if current:names.append(current)
            current=left
        elif current and left and not re.match(r'^(ITEM|SUNWAY|PROGRAM|GRAND|FEES|Arts Program|ADTP)',left):current+=' '+left
    if current:names.append(current)
    assert len(names)==len(amounts),(p,len(names),len(amounts))
    for title,amount in zip(names,amounts):
        pr=add_program('sunway',title,mode='Full-time' if 'FULL TIME' in title else None)
        add_schedule(pr,144,p,'Undated fee grid',[table('Grand total fees (RM)',['Basis','Printed amount'],[['Grand total fees',amount]])],['No fee year or intake is confirmed in this grid. Request the current itemised schedule.'])
for p in [4,5,6]:audit[sid(144)]['pages'][p-1]['disposition']='non-offer stray marks; no programme rows'

# References with no quotable programme fee.
d=docs[sid(141)]
links=[]
def find_urls(value):
    if isinstance(value,dict):
        for v in value.values():find_urls(v)
    elif isinstance(value,list):
        for v in value:find_urls(v)
    elif isinstance(value,str):
        links.extend(re.findall(r'https?://[^\s<>\"]+',value))
find_urls(d)
links=sorted(set(u for u in links if 'monash.edu' in u))
institution('monash',141,kind='reference',notes=['The supplied document contains an official undergraduate fee reference, with no quoted fee amount.'],links=[dict(label='Monash Malaysia undergraduate fees',url=u) for u in links])
audit[sid(141)]['disposition']='official link reference; no quoted amount'
audit[sid(149)]['disposition']='blank health declaration form; private application reference; site has no public official form library'
audit[sid(149)]['pages'][0]['disposition']='blank application form; no programme rows'

# GMIS: visually checked brochures; transport uses literal workbook cells.
institution('gmis',130,kind='school',name='Global Modern International School (GMIS)',aliases=['GMIS'],notes=['School and Australian matriculation offers. Fee schedules have their own scope; transport payment frequency is not specified.'])
ausmat=add_program('gmis','AUSMAT — Australian Matriculation Programme',campus='Bandar Baru Bangi, Kajang',duration='Less than 1 year',lev='ausmat',notes=['Entry: minimum five Cs including English at SPM, IGCSE or equivalent.','Certification: School Curriculum & Standards Authority (SCSA), Western Australia, under WACE. Assessment: 50% school-based and 50% external examination.','Students typically study five subjects. Group A: English as an Additional Language, Mathematics Application, Chemistry, Physics, Human Biology. Group B: English as an Additional Language, Mathematics Application, Business Management & Enterprise, Economics, Psychology.','Support: academic feedback, examination preparation, university application guidance, study skills, wellbeing, leadership and co-curricular activities.'])
a=add_schedule(ausmat,130,1,'Undated AUSMAT brochure',[table('Annual fees (MYR / RM)',['Basis','Amount'],[['Registration','1,500'],['Technology & learning','1,500'],['Tuition','22,000'],['Total yearly','25,000'],['Examination fees — subject to change','4,000']])],['Examination fees are shown separately from the annual total.'],extra_pages=[2])
a['refs'].append(ref(132,1,'Undated school brochure'))
for grade,tuition,total in [('Kindergarten','11,500','12,500'),('Primary 1–3','16,000','17,000'),('Primary 4–6','17,000','18,000'),('Lower Secondary 7–9','18,500','19,500'),('IGCSE 10–11','19,500','20,500')]:
    pr=add_program('gmis',grade,campus='Bandar Baru Bangi, Kajang',lev='school',notes=['English is the main language of instruction. Students select two foreign languages: Mandarin, Malay, French or Arabic.','Facilities: science laboratories, ICT labs, library, art room, sports arena, indoor game room, auditorium, cafeteria and multipurpose hall.','Grades 6 and 9 sit Cambridge Checkpoint examinations. IGCSE students prepare for Years 10–11 examinations.'])
    add_schedule(pr,132,1,'Undated school brochure',[table('Annual school fees (MYR / RM)',['Basis','Amount'],[['Technology & resources per year','1,000'],['Tuition per year',tuition],['Total per year',total],['One-time registration','1,000'],['KG1–G3 CCA additional fee','250'],['G4–G11 CCA additional fee','350'],['Checkpoint G6','800'],['Checkpoint G9','1,000']])],['CCA is compulsory for KG1–G11.','Fees exclude books, external exams, trips, visa, meal plan, transportation and uniform.','School hours: Monday–Thursday 8:15–2:40; Wednesday 8:15–3:50; Friday 8:15–12:30.','Confirm which grade-specific additional fees apply.'],extra_pages=[2])
pr=add_program('gmis','I-LEARN — Intensive Learn',duration='1 academic term (approximately 12–15 weeks)',lev='school',notes=['For primary and lower secondary students with little or no English. Focus: reading, writing, speaking and listening. Students rejoin their regular year-level cohort after a readiness assessment, with continuing support as needed.'])
add_schedule(pr,132,2,'Undated school brochure',[table('Programme fee',['Basis','Amount'],[['I-LEARN fee','Not specified']])],['Confirm the I-LEARN fee with the school.'])
pr=add_program('gmis','After School Program',lev='school')
add_schedule(pr,132,2,'Undated school brochure',[table('After-school fee (MYR / RM)',['Basis','Amount'],[['Per month','480']])],['Monday, Tuesday and Thursday 3–5 PM; Friday 1–4 PM.','Grades 1–6: homework guidance plus one enrichment topic (maths, English reading/writing or sports). Grades 7–12: extra classes in selected subjects and sports club; one subject plus one sport or two subjects or two sports.'],extra_pages=[1])
pr=add_program('gmis','School transport — bus and van / MPV',lev='school')
sheet=docs[sid(131)]['sheets'][0];cells={c['cell']:c['value'] for c in sheet['cells']}
transport=[]
for row in range(14,28):transport.append([clean(str(cells[f'C{row}'])),str(cells.get(f'D{row}','Not specified')),str(cells.get(f'E{row}','Not specified'))])
a=add_schedule(pr,131,1,'2025/2026 transport price list',[table('Sri Juta Mutiara transport for GMIS (MYR / RM; frequency unspecified)',['Location','Bus','Van / MPV'],transport)],['No bus discount. Van discount: 15% for more than three children in one family.','Check the price with the transport provider where a location may be outside the area.','Blank workbook cells mean no quoted option; they are not zero.','The workbook does not specify monthly or annual billing. Confirm frequency and service coverage.'])
a['refs'][0]['page']='Basic Invoice!B13:E31'
audit[sid(131)]['disposition']='mapped workbook Basic Invoice!B13:E31'
audit[sid(128)]['disposition']='held: Swadesh Global visa-process image; school issuer and discount validity unconfirmed; not attributed to Cranbridge'
audit[sid(129)]['disposition']='held: unnamed school fee image; school identity unconfirmed; Reception RM13,014 yearly and sibling discounts retained privately'

# Lincoln: all 184 student-facing rows. Internal commission copy is audit-only.
institution('lincoln',113,aliases=['Lincoln University College'])
lincoln=json.loads((PACK/'audit/lincoln-candidates.json').read_text())
public={r['number']:r for r in lincoln['113']};internal={r['number']:r for r in lincoln['114']}
lincoln_conflicts=[]
for number,row in public.items():
    cells=row['cells'];title=row['title'];notes=[]
    if level(title) in ['diploma','certificate'] and cells[0] not in ['Diploma','Certificate']:notes.append('The source level column differs from the programme title. Confirm the qualification level before applying.')
    professional_bachelor=cells[0]=='Bachelor' and re.match(r'Doctor of (Medicine|Dental Surgery)',title)
    if professional_bachelor:notes.append('Professional medical / dental qualification; the source classifies this row at Bachelor level.')
    pr=add_program('lincoln',title,mode=cells[1],duration=cells[2]+' years',notes=notes,lev='bachelor' if professional_bachelor else None)
    matrix=row['payments']
    tables=[table('Programme totals (MYR / RM; SST inclusive)',['Basis','Amount'],[['Total tuition',cells[4]],['Programme total',cells[10]]]),table('Year-by-year payments (MYR / RM)',['Year','Tuition','EMGS / renewal','Registration','Security bond','Total yearly payment'],matrix),table('Conditional miscellaneous fees (MYR / RM)',['Basis','Amount'],[['Lab fee per year, if applicable','1,100'],['Intensive English per level, if applicable','1,750'],['Prerequisite course, if applicable','2,000']])]
    add_schedule(pr,113,row['page'],'2026 Bangladesh fee structure',tables,['All charges are inclusive of 6% SST as printed.','A source dash is preserved; it does not establish a zero charge.','The year-by-year payments and the printed programme total are separate source figures; rounding may differ.'],audience='Bangladesh students',variant_key='printed-row-'+number,label='2026 Bangladesh — printed row '+number,extra_pages=[1])
    if number in ['134','135']:
        pr['notes']=list(dict.fromkeys(pr['notes']+['The source prints Research mode for both rows 134 and 135, but programme totals differ (RM54,200 / RM47,000). Confirm which schedule applies; no ODL mode has been inferred.']))
    other=internal.get(number)
    if not other or cells!=other['cells'][:-1]:lincoln_conflicts.append(dict(number=number,student=row,internal=other))
(PACK/'audit/lincoln-fee-conflicts.json').write_text(json.dumps(lincoln_conflicts,indent=2))
audit[sid(114)]['disposition']='private internal commission copy; 184 rows compared with student-facing source; no public commission fields'
for pg in audit[sid(114)]['pages']:pg['disposition']='internal commission audit; student-facing fees use MY-113'

# Geometric candidates keep source merged cells available in the private audit.
original_tables=json.loads((PACK/'audit/table-candidates.json').read_text())
def cell(value):
    if value is None:return ''
    v=clean(str(value))
    if re.fullmatch(r'[\d,.\s-]+',v):v=re.sub(r'\s+','',v)
    return v

# MSU: undergraduate MYR editions and postgraduate USD schedules stay distinct.
institution('msu',118,aliases=['MSU','Management and Science University'])
calendar=original_tables[sid(120)][0]['tables'][0]['rows']
for n in [116,118,119]:
    first=page(n,1);period=clean(re.search(r'AY[^\n]+',first)[0])
    currency='USD' if n==119 else 'MYR / RM'
    for pg in original_tables[sid(n)]:
        p=pg['page']
        for tab in pg['tables']:
            for row in tab['rows']:
                if len(row)!=(10 if n==119 else 11) or not re.fullmatch(r'\d+',cell(row[0])):continue
                row=[cell(c) for c in row];title=row[1];lev={'DEGREE':'bachelor','DIPLOMA':'diploma','FOUNDATION':'foundation','FOUNDTION':'foundation','CERTIFICATE':'certificate','MASTER':'master','PhD':'phd'}.get(row[2],level(title))
                canonical=re.sub(r'\bHONS\b','HONOURS',title)
                mode='Research' if 'RESEARCH' in title else 'Coursework' if 'COURSEWORK' in title else None
                pr=add_program('msu',canonical,mode=mode,duration=row[3]+' years',lev=lev)
                labels=['First payable fee (application, visa, registration & deposit bond)','Visa renewal' if n==119 else 'Annual & visa renewal fee','Tuition','Thesis / exam' if n==119 else 'PEC / soft skills']
                labels+=['Grand total for entire programme','Estimated yearly instalment (excludes first payable fee)'] if n==119 else ['Exam fee','Grand total for entire programme','Estimated yearly instalment (excludes first payable fee)']
                fees=list(map(list,zip(labels,row[4:])))
                terms=['First payable fee includes application, visa, registration and deposit bond.','Estimated yearly instalment excludes first payable fee.','Applicants bear additional bank charges where applicable.','Fees may change without notice.']
                if n in [118,119]:terms.append('Printed fees exclude government tax: 6% SST.')
                if n==119:terms+=['Annual maintenance fee USD2,050–USD8,100 per year is excluded, if applicable and subject to programme.','Maintenance fees apply if study extends beyond the stated duration (for example PhD 3 years / Master 2 years).']
                category=None
                if lev=='foundation':category=1
                elif lev=='diploma':category=3 if any(t in title for t in ['NURSING','MEDICAL ASSISTANT']) else 2
                elif lev=='bachelor':
                    category=5 if 'MBBS' in title or 'MEDICINE AND' in title else 6 if 'PHARMACY' in title else 7 if 'NURSING' in title else 8 if 'DENTAL' in title else 9 if 'VETERINARY' in title else 4
                elif lev=='master':category=11 if mode=='Research' else 10
                elif lev=='phd':category=12
                dates=[cell(r[category]) for r in calendar[3:] if category is not None and r[category]]
                if dates:
                    dates=list(dict.fromkeys(dates));terms.append('Programme-category intake dates from AY2025/2026 calendar (historical / dated): '+', '.join(dates))
                    for date in dates:
                        if date not in pr['intakes']:pr['intakes'].append(date)
                schedule=add_schedule(pr,n,p,period,[table('Published programme schedule ('+currency+')',['Fee / basis','Printed amount'],fees)],terms,extra_pages=[len(docs[sid(n)]['pages'])])
                if dates:schedule['refs'].append(ref(120,1,'AY2025/2026 programme-category intake calendar'))
audit[sid(120)]['disposition']='programme-category intake calendar linked to qualifying MSU levels and named categories'
audit[sid(120)]['pages'][0]['disposition']='linked dated calendar; not current open-intake evidence'

# A None cell is inherited only when an actual source rectangle spans the row.
def expanded_table(tab):
    rows=tab['rows'];rects=tab['cells'];result=[]
    cols=len(rows[0]);centers=[]
    for col in range(cols):
        boxes=[r[col] for r in rects if r[col] and sum(c is not None for c in r)>1]
        centers.append((min(b[0] for b in boxes)+min(b[2] for b in boxes))/2 if boxes else 0)
    for row,boxes in zip(rows,rects):
        anchor=next((b for b in boxes if b),None)
        y=(anchor[1]+anchor[3])/2 if anchor else 0
        values=[]
        for col,value in enumerate(row):
            if value is None:
                candidates=[(r[c],bs[c]) for r,bs in zip(rows,rects) for c in range(cols) if bs[c] and bs[c][0]<=centers[col]<=bs[c][2] and bs[c][1]<=y<=bs[c][3]]
                value=candidates[0][0] if candidates else None
            values.append(cell(value))
        result.append(values)
    return result

# INTI campuses remain distinct. Approximate figures and merged cells are retained.
institution('inti',136,kind='group',aliases=['INTI International University','INTI International College Penang','INTI International College Subang'])
for n,campus in [(136,'Penang'),(137,'Subang'),(138,'Nilai')]:
    finalp=len(docs[sid(n)]['pages']);last=page(n,finalp)
    misc=[]
    for line in last.split('Note:')[0].splitlines():
        m=re.match(r'(.+?)\s{3,}([\d,.]+)\s*$',line)
        if m and not re.search(r'^\s*(2026|INTERNATIONAL)',line):misc.append([clean(m[1]),m[2]])
    if n==138:misc.append(['Annual malpractice insurance (Traditional Chinese Medicine / Physiotherapy; bachelor begins Year 2)','553.50'])
    terms=['Approximate tuition only. Refer to the full fee schedule for an itemised breakdown.','2026 schedule, updated September 2025.','All tuition and miscellaneous fees except EMGS fees and general deposit are subject to 6% SST.','Applicable fees are due upon enrolment. Fees are neither refundable nor transferable once the semester starts.','Payments in Ringgit Malaysia; cash and postdated cheques are not accepted. Official bank draft, crossed cheque, transfer, online or Visa/Mastercard payment is supported.','Repeat subjects incur separate per-subject or credit-hour charges. Fees and programme/campus conditions may change.','EMGS fees may vary by nationality. Indonesian students on programmes of at least two years need a two-year pass and visa fee.']
    terms.append('Upon VAL, advance registration, administration, general deposit and first-semester payment: '+('RM12,050–RM25,000.' if n==136 else 'RM11,000–RM25,000.'))
    if n==137:terms.append('American Degree Transfer Programme (AUP): advance payment upon VAL RM19,000.')
    if n==138:terms+=['Online diploma advance payment RM11,100; online degree RM12,000; other levels RM11,000–RM25,000.','International applicants pursuing online programmes are not required to apply for student visa, as stated in this schedule.']
    for pg in original_tables[sid(n)]:
        if pg['page']==finalp:continue
        for tab in pg['tables']:
            if len(tab['rows'][0])!=4:continue
            expanded=expanded_table(tab)
            for row in expanded[1:]:
                title,intake,duration,fee=row
                if not title or not re.match(r'^(Foundation|Diploma|Bachelor|[34](?:\.5)?\+0|Cambridge|Certificate|Master|Doctor|PhD|Intensive|American|Australian|BSc)',title):continue
                if not re.fullmatch(r'[\d,]+',fee):continue
                pr=add_program('inti',title,campus=campus,mode='Online learning' if 'Online Learning' in title else None,duration=duration or None,intakes=[clean(i) for i in intake.split(',') if clean(i)],lev='language' if title.startswith('Intensive English') else None)
                add_schedule(pr,n,pg['page'],'2026 — September 2025 edition',[table('Approximate tuition (MYR / RM)',['Basis','Printed amount'],[['Approximate tuition'+(' per level' if 'per level' in title else ''),fee]]),table('Campus miscellaneous fees, subject to the printed level / mode scope (MYR / RM)',['Fee / timing / eligible group','Amount'],misc)],terms,extra_pages=[finalp])

# University of Cyberjaya: the fee tables state exact bases and semesters.
institution('cyberjaya',147,aliases=['UoC','University of Cyberjaya'])
for pg in original_tables[sid(147)]:
    if not 2<=pg['page']<=6:continue
    for ti,tab in enumerate(pg['tables']):
        expanded=expanded_table(tab)
        for row in expanded:
            if not re.match(r'^(Foundation|Diploma|Bachelor|Master|Doctor|PhD)',row[0]):continue
            if len(row) not in [5,6]:continue
            title,duration,semesters,*values=row
            if not re.search(r'\d',values[-1]):continue
            pr=add_program('cyberjaya',title,mode='Research' if pg['page']==6 else 'ODL' if pg['page']==5 and ti==1 else 'Full-time' if title.endswith(' FT') else 'Taught' if pg['page']==5 else None,duration=duration+' months',notes=['Printed number of semesters: '+semesters])
            labels=['Resource fee','Total payable fees'] if len(values)==2 else ['Resource fee','Tuition fee','Total payable fees']
            terms=['Fees are from the 2025/2026 international schedule. Confirm current availability.']
            # Preserve the student-facing numbered conditions below the tables.
            text=page(147,pg['page'])
            foot=re.split(r'(?m)^1\.\s',text)
            if len(foot)>1:terms+=paragraphs(foot[-1])
            add_schedule(pr,147,pg['page'],'2025/2026',[table('Programme fees (MYR / RM)',['Basis','Printed amount'],list(map(list,zip(labels,values))))],terms)

# MAHSA: scholarship amounts are dated, with base and net columns side by side.
institution('mahsa',115)
mahsa_notes=['Valid until 31 December 2025. The 2025 intake scholarship is deducted by year.','Programmes marked * are offered at MAHSA University City Campus, MAHSA Avenue. ** indicates a dual-award programme.','Fees may be revised without prior notice; the Student Application Form and Student Handbook contain full conditions.']
for pg in original_tables[sid(115)]:
    for tab in pg['tables']:
        for raw in tab['rows']:
            row=[cell(c) for c in raw if cell(c)]
            if len(row)!=11 or not re.fullmatch(r'\d+\.',row[0]) or row[2] not in ['Full-time','Online']:continue
            title=row[1];pr=add_program('mahsa',title,mode=row[2],duration=row[3]+' years',campus='City Campus, MAHSA Avenue' if '*' in title and '**' not in title else None)
            labels=['Application fee','Registration fee','Tuition fee','Total yearly fees','Total programme fee','2025 intake scholarship','2025 intake fee after scholarship']
            add_schedule(pr,115,pg['page'],'2025 international intake',[table('Base, scholarship and payment components (MYR / RM)',['Basis','Printed amount'],list(map(list,zip(labels,row[4:]))))],mahsa_notes,extra_pages=[5] if pg['page']!=5 else [])
# APEL.Q has its own admission route and fee scope.
pr=add_program('mahsa','Master of Business Administration — APEL.Q',provider='APEL.Q')
add_schedule(pr,115,5,'2025 international intake',[table('APEL.Q fees (MYR / RM)',['Basis','Amount'],[['Application','5,000'],['Registration','3,500'],['Tuition','34,500'],['Total','43,000']])],mahsa_notes)

# Geomatika: Bangladesh/Libya scholarship schedules are not general international fees.
institution('geomatika',125,aliases=['UGM','University of Geomatika Malaysia'])
for p in [1,2]:
    for line in page(125,p).splitlines():
        m=re.match(r'\s*(.+?)\s{2,}([\d.]+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s*$',line)
        if not m or not re.search(r'Diploma|Bachelor|Bsc|BBA|MBA|Master|PhD',m[1],re.I):continue
        title,duration,*fees=m.groups()
        if not all(re.fullmatch(r'[\d,]+|X',v) for v in fees):continue
        pr=add_program('geomatika',title,mode='ODL' if 'ODL' in title else 'On-campus',duration=duration+' years')
        label=['Year 1','Year 2','Year 3','Year 4 (X = no scheduled year)','Total published fees','Scholarship fees (conditional offer)']
        initial=[['Application fee','1,500','1,500'],['EMGS fee','3,250','1,000'],['International administration','4,000','4,000'],['Total initial fee','8,750','6,500']]
        add_schedule(pr,125,p,'2025/2026 Bangladesh & Libya',[table('Tuition and scholarship schedule (MYR / RM)',['Basis','Printed amount'],list(map(list,zip(label,fees)))),table('Initial fees upon registration (MYR / RM)',['Fee','On-campus','ODL'],initial)],['Bangladesh and Libya applicants only.','After VAL approval, first-year tuition must be paid in full before arrival.','Required: complete application form, EMGS and application payment RM4,750 (non-refundable, including EMGS i-Kad registration), certified academic results, English proficiency evidence (IELTS/TOEFL if any), white-background photograph 3.5 × 5 cm, full passport including blank pages.','Change of programme processing fee RM3,250; subsequent EMGS renewal RM1,200 (processing, insurance, health screening and student pass); visa fee payable to EMGS.','X is retained as a source non-payment-period marker, not a zero charge.'],audience='Bangladesh and Libya only',extra_pages=[1] if p==2 else [])
for title,base,offer,lev in [('Foundation in Business','15,000','11,000','foundation'),('Foundation in Science','16,000','12,000','foundation'),('English Preparation — One Month Course','1,800','1,800','language'),('English Preparation — Two Months Course','3,600','3,600','language'),('IELTS test registration with IDP / British Council Malaysia (2 months)','2,500','2,500','language')]:
    pr=add_program('geomatika',title,lev=lev)
    add_schedule(pr,125,1,'2025/2026 Bangladesh & Libya',[table('Published and scholarship fees (MYR / RM)',['Basis','Amount'],[['Total tuition / course fee',base],['Scholarship fee',offer]])],['Bangladesh and Libya only. Foundation programmes last 12 months. Confirm applicable initial fees and visa scope.'],audience='Bangladesh and Libya only')

# Goon: the programme total includes the separately itemised miscellaneous bundle.
institution('goon',133,aliases=['Goon International College'])
for ti,tab in enumerate(original_tables[sid(133)][0]['tables']):
    if len(tab['rows'][0])!=9:continue
    for raw in tab['rows']:
        row=[cell(c) for c in raw]
        if not re.fullmatch(r'\d+',row[0]):continue
        title=row[1]
        if ti==2 and row[0]=='5':title='Certificate in Law Enforcement Management'
        if ti==2 and row[0]=='6':title='Foundation in Science'
        pr=add_program('goon',title,duration=row[2])
        labels=['Registration','Resource per semester','Tuition Year 1','Tuition Year 2','Tuition Year 3','Total (registration, resource, tuition & miscellaneous)'] if ti==0 else ['Registration','Resource & facilities','International admin','Security deposit','Education fee','Grand total']
        tables=[table('Programme fee schedule (MYR / RM)',['Basis','Amount'],list(map(list,zip(labels,row[3:]))))]
        if ti==0:tables.append(table('Degree / diploma miscellaneous fees (MYR / RM)',['Fee','Amount'],[[cell(c) for c in r] for r in original_tables[sid(133)][0]['tables'][1]['rows'][1:]]))
        tables.append(table('Optional services (MYR / RM)',['Basis','Amount'],[['Airport transfer','200'],['Accommodation per month','300']]))
        terms=['Intakes 1 March 2026–31 December 2026.','All fees except security deposit are subject to 6% SST, effective 1 August 2025.','Once the course starts, fees are non-refundable except the security deposit after outstanding fees, damages or property losses are deducted.','Degree students are liable for partner-university fees on enrolment, even on withdrawal or termination.','Compulsory subjects must be completed unless credit-transfer exemptions apply.','Instalments are due before or at programme commencement and/or by the 7th of each month. Late penalty RM1 per day.','5% discount on net tuition only if paid in full before programme commencement.','Refund applications: within 60 days of exit stamp or parchment release (whichever is later) for graduates; within 60 days of official withdrawal/termination letter for others.','Semester tuition is indicative and depends on credits registered.','Printed GBP conversion basis is 6.5; exchange movements do not trigger further charges or refunds.','Bank commission for outstation cheques: 0.03% or RM0.50 minimum, whichever is higher.','Official payment methods include cheque, e-wallet, Visa/Mastercard, ATM card, transfer, Flywire or direct banking. Confirm instructions through the official application process.','Fees may be revised without notice. Awards and discounts have conditions and apply on a bottom-up basis.']
        add_schedule(pr,133,1,'2026 — March to December',tables,terms)

# Binary: original three scanned pages visually inspected; OCR amounts corrected by layout.
institution('binary',124,notes=['The doctorate table header says MYBIG 50% while its banner says RM10K and its printed prices are RM60,000 / RM50,000. The printed amounts are retained; confirm the award terms.'])
for p in [1,2]:
    text=docs[sid(124)]['pages'][p-1]['ocr']['layout_text']
    for line in text.splitlines():
        m=re.match(r'\s*(.+?)\s+(\d(?:\.\d)?\s*YEAR)\s+RM\s+([\d,]+)\s+RM\s+([\d,]+)(.*)$',line)
        if not m:continue
        title,duration,base,offer,tail=m.groups();title=re.sub(r'\bAl\b','AI',title)
        years=re.findall(r'RM\s*([\d,]+)',tail)
        pr=add_program('binary',title,duration=duration,lev='foundation' if p==1 and title.startswith('FOUNDATION') else 'bachelor' if p==1 else 'master')
        rows=[['Base tuition fee',base],['After MYBIG 50% scholarship — printed conditional amount',offer],*[[f'Year {j+1}',v] for j,v in enumerate(years)]]
        add_schedule(pr,124,p,'2025/2026',[table('Tuition and conditional scholarship fees (MYR / RM)',['Basis','Printed amount'],rows),table('Additional fees (MYR / RM)',['Basis','Amount'],[['Visa + application (EMGS), non-refundable','3,900'],['International administration','1,980'],['Personal bond — refundable on completion','750'],['Registration per year','600'],['Student ID card','20'],['Library','200'],['Printed total other fees','3,550']])],['Printed note: 6% SST included.','Other fees are due after student visa approval along with first-year tuition.','Retain the printed scholarship amount; the label does not justify applying a mathematical 50% reduction to every programme.','For the MBA, the two printed yearly amounts do not add to the printed scholarship total; confirm the payment schedule.'] if p==2 else ['Printed note: 6% SST included.','Other fees are due after student visa approval along with first-year tuition.','Bachelor of Accounting + CPA has RM58,500 in both base and scholarship columns; no discount has been inferred.'])
phd_titles=['Doctor of Business Administration (DBA)']+['Doctor of Philosophy (PhD) — '+t for t in ['Business Management','Management','Finance','Education','Marketing','Human Resource Management','Tourism','Environment','Leadership','Accounting','Information Technology (Cybersecurity)','Information Technology (IoT)','Information Technology (AI)','Information Technology (Cloud Computing ET)','Entrepreneurship (Business Entrepreneurship ISE)','Entrepreneurship (Social Entrepreneurship ETC)','Entrepreneurship (SME)','Gender Issues and Women Leadership']]
for title in phd_titles:
    pr=add_program('binary',title,duration='3 years',lev='phd')
    add_schedule(pr,124,3,'2025/2026',[table('Doctoral tuition and RM10K scholarship variant (MYR / RM)',['Basis','Printed amount'],[['Base fees','60,000'],['Conditional scholarship fees','50,000'],['Year 1','20,000'],['Year 2','18,000'],['Year 3','12,000']]),table('Additional fees (MYR / RM)',['Basis','Amount'],[['Visa + application (EMGS), non-refundable','4,850'],['International administration','1,980'],['Personal bond — refundable on completion','750'],['Registration per year','600'],['Student ID card','20'],['Library','200'],['Printed total other fees','3,550']])],['The table header says “After MYBIG 50% Scholarship”, while the banner says RM10K. The printed RM50,000 fee is retained; confirm scholarship terms.','Printed note: 6% SST included. Other fees are due after visa approval with first-year tuition.'])

# UOW Selangor: transcribed against both original rendered pages (not OCR totals).
institution('uow',148,name='University of Wollongong Malaysia (UOW Malaysia)',aliases=['UOW','UOW Malaysia'])
uow_pages={1:"""Foundation Studies|1 year|31730|14840
Foundation in Arts|1 year|31730|14840
Foundation in Engineering|1 year|32910|15800
Diploma in Business Administration|2 years|54780|17660
Diploma in Business Management — ODL Mode|2 years|31980|6420
Bachelor of Accounting (Hons)|3 years|97380|19620
Bachelor in Accounting & Finance (Hons)|3 years|99400|18570
Bachelor of Business (Hons)|3 years|92340|18570
Bachelor of Business (Hons) — Dual Award with University of Wollongong Australia|3 years|106140|20870
Diploma in Communication & Media|2 years|58570|17230
Diploma in Entertainment Arts|2 years|58640|18190
Bachelor of Communication (Hons)|3 years|91710|19230
Bachelor of Communication (Hons) in Media Production|3 years|93120|19230
Bachelor of Communication (Honours) (Public Relations)|3 years|93120|19230
Bachelor of Creative Industry Management (Hons)|3 years|94380|19980
Diploma in Computer Studies|2 years|55660|20230
Diploma in Graphic Design Technology|2 years|53380|15440
Bachelor of Software Engineering (Hons)|3 years|90750|19920
Bachelor of Information Systems (Honours) (Enterprise Information Systems)|3 years|92625|16920
Bachelor of Game Development (Honours)|3 years|96740|19470
Bachelor of Arts (Honours) Digital Media Production|3 years|89330|18090
Bachelor of Computer Science (Hons)|3 years|92970|16920
Bachelor of Computer Science (Hons) — Dual Award with University of Wollongong Australia|3 years|106770|19220
Bachelor of Electrical and Electronics Engineering with Honours|4 years|117360|17990
Bachelor of Mechanical Engineering with Honours|4 years|116990|17620
Bachelor of Mechatronics Engineering with Honours|4 years|116990|17620
Certificate in Hotel Operations|17 months|26240|13920
Diploma in International Hotel Management — Dual Award with IMI, Switzerland|2 years|59770|21370
Diploma in Culinary Arts|2 years|62920|24480
Bachelor of Culinary Management (Hons)|3 years|107930|25700
Bachelor of Hospitality Management (Hons)|3 years|107280|25560
Bachelor of Laws 3+0 External with University of London, UK|3 years|60400 **|25240 **""",2:"""Certificate in Business Communication|1.5 years|24570|11770
Diploma in Early Childhood Education|2–3 years|41590|13840
Diploma in Nursing|3 years|59955|17175
Diploma in Physiotherapy|3 years|57580|15780
Diploma in Healthcare Service|3 years|52100|15660
Foundation in Accountancy (ACCA — FIA)|1 year|16150 **|10850 **
Association of Chartered Certified Accountants (ACCA)|2.5 years|32950 **|11100 **
Postgraduate Certificate in Business Administration|1 year|26850|18175
Postgraduate Diploma in Enterprise Risk Management|1 year|38150|18175
Master of Business Administration (MBA)|16 months|46960|18175
Master of Business Administration (MBA) — ODL Mode|16 months|28160|7700
Master of Arts (Communication Management)|16 months|46000|15080
Master of Design (Innovation)|16 months|48760|15080
Master of Arts (Social Science)|2–4 years|43360 ***|14360
Master of Arts|2–4 years|43360 ***|14360
Master of Science|2–4 years|49360 ***|15360
Doctor of Philosophy (Engineering)|3–6 years|71160 ***|15360
Doctor of Philosophy (Business)|3–6 years|62160 ***|14360
Doctor of Philosophy (Social Science)|3–6 years|62160 ***|14360
Doctor of Philosophy (Computing & Innovation)|3–6 years|62160 ***|14360
Doctor of Philosophy (Creative Arts & Media)|3–6 years|62160 ***|14360"""}
for p,content in uow_pages.items():
    for line in content.splitlines():
        title,duration,total,first=line.split('|')
        intakes=['July','October'] if title in ['Diploma in Nursing','Diploma in Physiotherapy','Diploma in Healthcare Service'] else ['January','July'] if 'ACCA' in title else ['June','September'] if 'Bachelor of Laws' in title else ['February','June','September']
        pr=add_program('uow',title,campus='Selangor',provider='University of London, UK' if 'University of London' in title else 'Dual award: UOW Australia' if 'Dual Award with University of Wollongong' in title else 'Dual award: IMI Switzerland' if 'Dual Award with IMI' in title else None,mode='ODL' if 'ODL' in title else None,duration=duration,intakes=intakes)
        add_schedule(pr,148,p,'2025 intakes — December 2024 publication',[table('Programme and first-semester fees (MYR / RM)',['Basis','Printed amount'],[['Total programme fee',total],['First semester',first],['EMGS for other nationalities — yearly','2,350'],['EMGS for Indonesian students — two-year visa','3,120'],['Performance assurance fee, first semester','3,000']])],['** Examination fee excluded. *** Fee for minimum period only. Markers apply where shown beside the amount.','Programme fees exclude EMGS and performance assurance fees.','Performance assurance fee is refundable only on completing the entire programme at UOW Malaysia; forfeited otherwise.','Semester tuition is indicative and depends on subjects taken.','Late payment charge RM10 per day. Registration and exam fees, if applicable, are non-refundable.','Caution fee refunded on completion/withdrawal if no outstanding fees; withdrawal/termination refund is 50%, subject to Bursary Policy.','Payment: official admission/bursary department, cash, credit card or cheque. Resit/repeat subjects charged separately.','Applicable to new 2025 intake students. Figures printed December 2024 may change; confirm updated details before application.'],extra_pages=[2] if p==1 else [])

# APU / APIIT: preserve source subject groups and stage / payment options.
institution('apu',134,kind='group',name='Asia Pacific University (APU) / APIIT',aliases=['APU','APIIT','Asia Pacific University of Technology & Innovation'])
apu_terms=['All USD amounts are indicative reference equivalents and non-binding. Official invoices are payable in RM; exchange-rate claims are not entertained.','Fees exclude 6% SST throughout study. Figures are subject to change without prior notice.','Application, processing, registration and administration fees are non-refundable once the offer is accepted. Course fees are non-refundable except if EMGS / Immigration refuses the visa; all fees become non-refundable once the visa is approved or study starts, including if English competency is not met.','Annual visa renewal RM1,100–RM1,450 (approx. USD290–USD380), due three months before expiry, includes EMGS processing, i-Kad, medical insurance and university administration.','Changing programmes after a visa application requires a new student-pass application and Immigration approval.','Use the official application/payment workflow to obtain payment instructions.']
def apu_extras(online=False):
    rows=[['Online ODL enrolment — one-off upon acceptance','RM2,580 (approx. USD680)']] if online else [['Stage 1 — upon offer acceptance, non-refundable','RM3,400 (approx. USD895)'],['Stage 2 — upon student-pass approval, non-refundable','RM2,000 (approx. USD525)'],['International registration & administration (includes student ID)','RM5,000 (approx. USD1,315)'],['Library deposit — refundable on completion','RM500 (approx. USD130)'],['Engineering laboratory deposit — engineering only, refundable','RM500 (approx. USD130)'],['Personal bond — refundable on completion subject to visa compliance and intervention deductions','RM1,000 (approx. USD265)']]
    return table('Other fees — apply only to the stated mode and student group',['Fee / timing / eligibility','Printed amount'],rows)
def apu_add(title,n,p,headers,values,lev=None,mode=None,notes=None,terms=None):
    pr=add_program('apu',title,provider='APIIT' if title.startswith('Certificate') else 'APU',lev=lev,mode=mode,notes=notes)
    online='ODL' in (mode or '')
    return add_schedule(pr,n,p,'2026 international fee guide',[table('Payment options — MYR with source indicative USD equivalents',headers,values),apu_extras(online)],apu_terms+(terms or []),extra_pages=([3,4] if p!=4 else [3]) if n==134 else ([2,4] if p!=4 else [2]))
# Foundation pathways are genuine printed fee groups, not invented degree titles.
for title,full,first,later in [('APU Foundation Programme — Computing & Technology / Business, Finance & Social Sciences / Architecture & Design pathways','RM28,400 (USD7,475)','RM15,500 (USD4,080)','RM7,100 (USD1,870) × 2 semesters'),('APU Foundation Programme — Engineering pathway','RM29,200 (USD7,685)','RM15,500 (USD4,080)','RM7,500 (USD1,975) × 2 semesters'),('APU Foundation in Computing (ODL)','RM21,200 (USD5,580)','RM12,500 (USD3,290)','RM4,800 (USD1,265) × 2 semesters')]:
    apu_add(title,134,1,['Basis','Full payment','Semester 1','Semesters 2 & 3'],[['Foundation programme',full,first,later]],lev='foundation',mode='ODL' if 'ODL' in title else 'Full-time',notes=['Entry group: O-Levels / IGCSE or equivalent.'])
diplomas=['Information & Communication Technology','Information & Communication Technology — Software Engineering / Data Informatics / Interactive Technology specialisms','Business Administration','Accounting','Psychology','Business Information Technology','International Studies','Design and Media','Mechatronic Engineering','Hotel Management','Events Management']
for name in diplomas:
    hospitality=name in ['Hotel Management','Events Management']
    apu_add('Diploma in '+name,134,1,['Full payment','Yearly payment','Semester 1','Remaining semester payments'],[['RM54,200 (USD14,265)','RM27,900 (USD7,340) × 2 years','RM15,500 (USD4,080)','RM10,400 (USD2,735) × 4 semesters' if hospitality else 'RM8,330 (USD2,190) × 5 semesters']],lev='diploma',mode='Full-time',terms=(['HTMi Switzerland dual award is included in course fees.'] if hospitality else [])+(['Hospitality resource fee RM4,200 (approx. USD1,105): uniforms, knives, typhoid injections, tags, food-handler training and practical/lab fees.'] if name=='Hotel Management' else ['Events resource fee RM2,600 (approx. USD685): uniform, name tag and practical/lab fees.'] if name=='Events Management' else []))
for name in ['Business Administration','Information & Communication Technology']:
    apu_add('Certificate in '+name,134,1,['Full payment','Semester 1','Semesters 2 & 3'],[['RM22,400 (USD5,895)','RM12,400 (USD3,265)','RM5,500 (USD1,445) × 2 payments']],lev='certificate')
for n in [134,135]:apu_add('APU Intensive English Language Programmes',n,1 if n==134 else 4,['Basis','Full payment'],[['Each level — 4 weeks','RM2,750 (USD725)']],lev='language',notes=['Seven levels; English preparation book included.'])
groups=[('Information Technology / Computer Science / Software Engineering / Data Science / Artificial Intelligence / Cyber Security / Digital Forensics / Business Management / Digital Marketing / Human Resource Management / Hospitality and Tourism / Accounting & Finance / ACCTECH / Forensic Accounting / Actuarial Studies / Banking & Finance / FinTech / Investment Analytics / International Relations / Psychology',[(34900,9185,18200,4790),(36100,9500,18900,4975),(37500,9870,19600,5160)]),('Industrial Design / Visual Effects / Animation / Digital Advertising / Media & Communication / Interactive Media and Immersive Technology / VR/AR / Computer Games Development',[(34900,9185,18200,4790),(36100,9500,18900,4975),(37500,9870,19600,5160)]),('Architecture',[(35800,9420,18700,4920),(36800,9685,19200,5050),(37800,9950,19760,5200)]),('Mechatronic Engineering / Mechanical Engineering / Computer Engineering / Electrical & Electronic Engineering / Petroleum Engineering',[(32600,8580,17000,4475),(33600,8840,17600,4630),(34800,9160,18200,4790),(36200,9525,18900,4975)])]
for names,fees in groups:
    values=[[f'Degree Level {i+1}',f'RM{a:,} (USD{b:,})',f'RM{c:,} (USD{d:,})',f'RM{c:,} (USD{d:,})'] for i,(a,b,c,d) in enumerate(fees)]
    apu_add('Degree subject group — '+names,134,2,['Level / basis','Full payment','Semester 1','Semester 2'],values,lev='bachelor',mode='Full-time',notes=['The source quotes a subject group. Confirm the exact degree title, duration and entry requirements; each payment row refers to the printed degree level, not a whole-programme total.'],terms=['Optional APU–DMU dual degree: GBP450 per level upon study commencement; excludes BSc (Honours) Hospitality and Tourism. Hospitality and Tourism has the included HTMi Switzerland dual award.','Hospitality and Tourism optional two-week HTMi trip in Year 2 depends on visa eligibility; APU covers accommodation, meals, airport transfer and programme costs; student pays airfare, travel insurance and personal expenses.','Optional actuarial-related professional fee is printed separately as EURO220, paid once upon intake commencement; confirm its programme applicability.'])
for p in [1,2,3]:
    for tab in original_tables[sid(135)][p-1]['tables']:
        if not tab['rows'] or len(tab['rows'][0])<3:continue
        rows=tab['rows']
        # Masters fee groups only. Doctorates use the explicit mode matrices below.
        if 'MASTERS PROGRAMMES' not in str(rows[0]):continue
        for ri,raw in enumerate(rows[1:],1):
            if not raw[0] or not re.match(r'^(Master|MSc|Postgraduate)',raw[0]):continue
            title_lines=raw[0].splitlines();titles=[];current=''
            for line in title_lines:
                if re.match(r'^(Master|MSc|Postgraduate)',line):
                    if current:titles.append(current)
                    current=line
                else:current+=' '+line
            if current:titles.append(current)
            payments=[cell(c) for c in raw[1:]]
            if p==3 and len(payments)==4 and 'INSTALLMENT' in payments[2]:
                nxt=rows[ri+1];payments[2]=cell(nxt[3]);payments[3]=cell(nxt[4])
            heads=['Full payment','Semester 1','Semester 2','Semester 3'] if p==1 else ['Full payment','Instalments'] if p==2 else ['Full payment','Yearly payments','First modular instalment','Remaining modular instalments']
            if len(payments)!=len(heads):continue
            for title in titles:
                apu_add(clean(title),135,p,heads,[payments],mode='ODL' if p==3 else 'Full-time',terms=['Optional APU–DMU dual degree for the applicable on-campus masters: GBP525 upon commencement; non-registration follows non-payment. Confirm which programmes qualify.'] if p==1 else ['MPhil full-time fee covers up to two years; each additional year RM8,200 (approx. USD2,155).'] if p==2 else ['ODL enrolment RM2,580 (approx. USD680) upon acceptance; compulsory EMGS Approval Letter is included. A Social Visit Pass is required for visits during online study.'])
for subject in ['Computing','Technology','Management','Finance','Engineering']:
    apu_add('Doctor of Philosophy — '+subject,135,2,['Full payment','Yearly option A','Yearly option B','Additional year'],[['RM50,800 (USD13,370)','RM26,520 (USD6,980) × 2 years','RM17,850 (USD4,695) × 3 years','RM8,200 (USD2,155) from Year 4']],lev='phd',mode='Full-time',notes=['Duration 3–5 years. Fee covers up to three years.'])
apu_add('Doctor of Business Administration (DBA)',135,2,['Full payment','Yearly payments','Instalment payments'],[['RM56,800 (USD14,945)','RM19,960 (USD5,250) × 3 years','RM12,100 (USD3,185) × 5 payments']],lev='phd',mode='Full-time',terms=['Fee covers three years; additional full-time year RM8,200 (approx. USD2,155).'])
for subject in ['Computing','Technology','Management']:
    for mode,years,annual,annualusd,extra,extrausd,start in [('Full-time ODL','3–5','15,040','3,955','6,500','1,710','4'),('Part-time ODL','4–6','11,390','2,995','5,500','1,445','5')]:
        a=apu_add('Doctor of Philosophy (ODL) — '+subject,135,3,['Full payment','Yearly payment','Additional-year fee'],[['RM42,800 (USD11,265)',f'RM{annual} (USD{annualusd}) × '+('3 years' if mode.startswith('Full') else '4 years'),f'RM{extra} (USD{extrausd}) from Year {start}']],lev='phd',mode=mode,notes=[mode+'; duration '+years+' years.'])
        a['label']+=' — '+mode

# Kings: preserve title/code, semester or yearly columns and printed totals.
institution('kings',126)
for pg in original_tables[sid(126)]:
    if pg['page']==1:continue
    for tab in pg['tables']:
        if len(tab['rows'][0])!=10:continue
        groups=[];current=None;category=''
        for raw in tab['rows']:
            if raw[0] and re.search(r'(MASTER|BACHELOR|DIPLOMA|FOUNDATION) PROGRAMMES',raw[0]):category=raw[0].split()[0]
            if raw[0] and re.match(r'^(Master|Double Degree|Bachelor|Diploma|Foundation)',raw[0]):
                current=[raw[0],category,[[] for _ in range(9)]];groups.append(current)
            if current:
                for i,v in enumerate(raw[1:]):
                    v=cell(v)
                    if v and v not in current[2][i]:current[2][i].append(v)
        for title,category,columns in groups:
            vals=[' / '.join(c) for c in columns]
            if not vals[0] or not vals[6]:continue
            title=clean(title);code=re.search(r'(?:KPT|MQA|\(N[-/ ]|\(R[/-]).*',title)
            name=title[:code.start()].rstrip(' -') if code else title
            if category=='MASTER':labels=['Registration','First semester','Second semester','Third semester','Fourth semester','Printed total','EMGS','Yearly']
            else:labels=['Registration','Year 1','Year 2 semester breakdown','Year 3 semester breakdown','Year 4','Printed total','EMGS','Yearly']
            pr=add_program('kings',name,code=code[0] if code else None,mode='ODL' if 'ODL' in name else None,duration=vals[0]+' years')
            add_schedule(pr,126,pg['page'],'2026',[table('Published fee schedule (MYR / RM)',['Basis','Printed value'],list(map(list,zip(labels,vals[1:]))))],['All first-year fees must be settled in full before arrival in Malaysia and are non-refundable after arrival.','All fees are subject to 6% SST for international students as stated. Fees may be revised.','Semester fees are due in full within 15 days of invoice. All outstanding fees must be cleared before each academic session; enrolment may be terminated for failure to pay.','Students below the English requirement must take the university test and pay its examination fees. A failed initial test requires intensive English: first month free; subsequent three months or longer charged as required.','The printed MBA ODL semester amounts differ from the printed total. Preserve both and confirm the applicable payment plan.'],extra_pages=[1,4] if pg['page'] not in [1,4] else [1])

# HELP: original header says international students; filename's JAPAN scope is unresolved.
# Market-sensitive discounts are held. Base fees and published international charges remain.
institution('help',5,kind='group',aliases=['HELP University','HELP Academy'],notes=['Two 2026 diploma discount rows require confirmation of Bangladesh market eligibility. Only their printed original fee is quoted here.'])
help_rows=[('Certificate in Business Management','HELP Academy','DH','1.5 years',['14700','4400','-','19100','1146','20246 (approx. USD5062)']),('Foundation in Arts','HELP University','SB & DH','1 year',['31250','-','-','31250','1875','33125 (approx. USD8281)']),('Foundation in Science','HELP University','SB','1 year',['31250','-','-','31250','1875','33125 (approx. USD8281)']),('Diploma in Business','HELP University','SB','2 years',['24500','23000','-','47500','2850','50350 (approx. USD12588)']),('Diploma in Information Technology','HELP University','SB','2 years',['25500','24000','-','49500','2970','52470 (approx. USD13118)']),('Diploma in Communication','HELP University','SB','2 years',['24500','23000','-','47500','2850','50350 (approx. USD12588)'])]
for title in ['Bachelor in Accounting (Honours)','Bachelor in Information Technology (Honours)','Bachelor in Information Technology (Data Analytics) (Honours)']:help_rows.append((title,'HELP University','SB','3 years',['31000','29500','29500','90000','5400','95400 (approx. USD23850)']))
for title in ['Bachelor in Marketing (Honours)','Bachelor in International Business (Honours)','Bachelor of Business (Finance) (Honours)','Bachelor of Business (Entrepreneurship) (Honours)','Bachelor of Business (Human Resource Management) (Honours)','Bachelor of Business Analytics (Honours)','Bachelor of Economics (Honours)','Bachelor of Management (Honours)']:help_rows.append((title,'HELP University','SB','3 years',['30200','28700','28700','87600','5256','92856 (approx. USD23214)']))
for title,campus,fees in [('Bachelor of Business Psychology (Hons)','SB',['32000','30500','30500','93000','5580','98580 (approx. USD24645)']),('Bachelor in Hospitality Management (Honours)','DH',['32500','31000','31000','94500','5670','100170 (approx. USD25043)']),('Bachelor of Tourism Management (Honours)','DH',['32500','31000','31000','94500','5670','100170 (approx. USD25043)']),('Bachelor of Early Childhood Education (Honours)','SB',['29000','27500','27500','84000','5040','89040 (approx. USD22260)']),('Bachelor of Computer Science (Honours)','SB',['31500','30000','30000','91500','5490','96990 (approx. USD24248)']),('Bachelor of Psychology (Honours)','SB',['36500','35000','35000','106500','6390','112890 (approx. USD28223)']),('Bachelor of Communication (Hons) — Marketing Communication / Media Studies / Public Relations','SB',['29000','27500','27500','84000','5040','89040 (approx. USD22260)']),('Bachelor of Laws (Honours)','DH',['28000','26500','26500','81000','4860','85860 (approx. USD21465)']),('UK Degree Transfer Programme (Law)','DH',['36500','35000','-','71500','4290','75790 (approx. USD18948)'])]:help_rows.append((title,'HELP University',campus,'2 years' if title.startswith('UK') else '3 years',fees))
help_general=table('International general fees (MYR with source approximate USD equivalents)',['Fee / eligible audience','Printed amount'],[['Application','RM3,000 (USD750) + SST RM180 (USD45)'],['Administration','RM6,000 (USD1,500) + SST RM360 (USD90)'],['Visa processing — all countries except Indonesia','RM1,728 (USD432)'],['Medical screening','RM250 (USD63)'],['Medical insurance','RM475 (USD119)'],['eVAL','RM162 (USD41)'],['iCard — all except Indonesia','RM53 (USD13)'],['Immigration — all except Indonesia','RM117 (USD29)'],['Indonesian two-year visa processing','RM1,998 (USD500)'],['Indonesian iCard','RM106 (USD27)'],['Indonesian immigration','RM159 (USD40)'],['Second-year renewal: student pass','RM100 (USD25)'],['Second-year renewal: EMGS processing','RM270 (USD68)'],['Second-year renewal: medical insurance','RM475 (USD119)'],['Second-year renewal: iCard','RM53 (USD13)'],['Second-year renewal: immigration (country-dependent)','RM64–RM117 (USD16–USD29)'],['Progressing student / change of course administration','RM477 (USD120)'],['Progressing / change of course EMGS processing','RM1,728 (USD432)']])
help_terms=['SB = Subang Bestari; DH = Damansara Heights.','Indicative fees for new 2026 students, subject to revision and normal progression. Longer study or progression to another level may attract new rates.','Total programme figures exclude application, administration and student visa fees. USD figures are only indicative at the printed RM4 to USD1 basis. Payments are in RM.','Application and administration fees are non-refundable. Visa, screening, insurance, eVAL, iCard and immigration charges are due upon application; administration and first-semester course fees before arrival. EMGS charges can vary and shortfalls must be paid.','Withdrawal before the offer-letter commencement date refunds only the course fee, if paid.','The schedule states listed tuition/general fees include 6% SST unless otherwise stated; application and administration show separate SST amounts.','For progressing/change-of-course students, medical insurance RM475 (USD119), screening RM250 (USD63), eVAL RM162 (USD41), iCard RM53 (USD13), and immigration RM64–RM117 (USD16–USD29) also apply.','Official payment methods: internet banking, ATM, credit card or Flywire; obtain payment routing through the consultation/application flow.']
for title,provider,campus,duration,fees in help_rows:
    lev=level(title)
    intake=['5 Jan','11 May','2 Sep'] if provider=='HELP Academy' else ['5 Jan','4 May','23 Jul','1 Sep'] if lev=='foundation' else ['7 Jan','3 June','21 Aug'] if 'Bachelor of Laws' in title else ['5 Jan','6 July','7 Sept'] if title.startswith('UK') else ['7 Jan','23 Feb','3 June','21 Aug','5 Oct']
    pr=add_program('help',title,provider=provider,campus=campus,duration=duration,intakes=[i+' (2026 schedule)' for i in intake])
    extra=['Science lab fee RM350 × 4 subjects.'] if title=='Foundation in Science' else ['Science lab fee RM250 × 1 subject in Year 2.'] if title=='Bachelor of Psychology (Honours)' else []
    add_schedule(pr,5,1,'2026 — 14 February edition',[table('Indicative programme fees (MYR / RM)',['Basis','Printed amount'],list(map(list,zip(['Year 1','Year 2','Year 3','Total before SST','6% SST','Grand total including SST'],fees)))),help_general],help_terms+extra,extra_pages=[2])
for title,base in [('Diploma in Early Childhood Education','46,800'),('Diploma in Education','47,200')]:
    pr=add_program('help',title,provider='HELP University',campus='SB',duration='2.5 years')
    add_schedule(pr,5,1,'2026 — 14 February edition',[table('Original fee before the market-sensitive discount (MYR / RM)',['Basis','Amount'],[['Original fee, as printed',base]]),help_general],help_terms+['The discounted 2026 price is held pending confirmation that the JAPAN-named document applies to Bangladesh; do not infer a discounted grand total.'],extra_pages=[2])
pr=add_program('help','Pre-Sessional English / MUET Preparatory Course',provider='HELP University',campus='Subang Bestari',duration='1 month',lev='language',intakes=['5–9 Jan','16–20 Feb','30 Mar–3 Apr','11–15 May','29 Jun–3 July','10–14 Aug','21–25 Sep','2–6 Nov'])
add_schedule(pr,5,1,'2026 — 14 February edition',[table('Course fee (MYR / RM)',['Basis','Amount'],[['One month','2,200']])],help_terms,extra_pages=[2])

# BAC group: programme ownership is the printed member institution, not just BAC.
institution('bac',3,kind='group',aliases=['Brickfields Asia College','IACT College','Veritas University College','UNIMY','Reliance College'])
def bbox_text(words,x0,y0,x1,y1):
    selected=[w for w in words if x0<=(w[0]+w[2])/2<x1 and y0<=(w[1]+w[3])/2<y1]
    selected.sort(key=lambda w:(round(w[1]/3),w[0]))
    return clean(' '.join(w[4] for w in selected))
def bac_add(title,provider,p,duration,fees):
    title=clean(title);pr=add_program('bac',title,provider=provider,mode='Conventional' if provider=='Veritas University College' else None,duration=duration+' years')
    terms=['Effective 1 January 2025; fees may be adjusted.','First-year EMGS & application RM4,800, non-refundable. Following years: visa renewal RM1,200 and resource fee RM1,000 per year, non-refundable.','Literal zero cells are retained as printed. Partner fees are additional wherever stated.','Application: passport all pages in one PDF; white-background digital photograph 45 × 35 mm, no glasses or visible teeth; latest academic qualifications in original and English translation; health declaration; English proficiency evidence as required; application processing payment.','First-year fees are paid after the student visa process; confirm exact admission requirements with the institution.']
    if provider=='Brickfields Asia College':terms+=['Personal bond RM750, refundable.','Foundation Law: Jan, Mar, Jun, Sep; Foundation Business: Feb, Apr, Aug. A-Level Science: Jan, Apr, Aug; Arts: Aug. Undergraduate Law and Business: Jan, May, Sep; LLB: Sep.']
    elif provider=='IACT College':terms+=['Personal bond RM750, refundable.','Foundation and diploma: Feb, Apr, Aug. Bachelor: Feb, Apr, Sep.']
    elif provider=='Veritas University College':terms+=['Conventional pre-university, general undergraduate and MBA: Jan, May, Sep. Branding & Digital Marketing: Jan, Jun, Aug. ODL intake calendars also appear in the source but do not establish an ODL fee schedule for these conventional rows.']
    elif provider=='UNIMY':terms+=['Pre-university and general undergraduate: Feb, May, Sep. Computer Engineering: May, Sep. Postgraduate coursework: Feb, May, Sep; research open throughout the year in the dated source.']
    else:terms+=['Pre-university: Feb, Apr, Aug.']
    if 'Transfer' in title or 'LLB' in title:terms.append('UK partner fees are additional to the printed local fee amounts, including where local years show zero.')
    add_schedule(pr,3,p,'2025',[table('Year-by-year fees (MYR / RM)',['Basis','Printed amount'],list(map(list,zip(['Year 1','Year 2','Year 3','Year 4','Total local fee'],fees))))],terms,extra_pages=[2 if provider=='Brickfields Asia College' else 4 if provider=='IACT College' else 6 if provider=='Veritas University College' else 9 if provider=='UNIMY' else 11])
for p in [1,2,3,4,5,7,8,10]:
    provider='Brickfields Asia College' if p<=2 else 'IACT College' if p<=4 else 'Veritas University College' if p==5 else 'UNIMY' if p<=8 else 'Reliance College'
    pg=docs[sid(3)]['pages'][p-1];words=pg['words_bbox']
    markers=sorted([w for w in words if 80<w[0]<100 and re.fullmatch(r'\d+',w[4])],key=lambda w:w[1])
    for j,w in enumerate(markers):
        y0=max(w[1]-20,(markers[j-1][1]+w[1])/2 if j else w[1]-20);y1=min(w[3]+20,(markers[j+1][1]+w[1])/2 if j+1<len(markers) else w[3]+20)
        title=bbox_text(words,102,y0,358,y1)
        if not title:continue
        duration=bbox_text(words,360,w[1]-3,420,w[3]+3)
        fees=[bbox_text(words,a,w[1]-3,b,w[3]+3) for a,b in [(420,485),(485,555),(555,625),(625,695),(695,800)]]
        if not duration or not all(re.fullmatch(r'[\d,.]+',v) for v in fees):continue
        bac_add(title,provider,p,duration,fees)
bac_add('Bachelor in Business Administration (Hons)','Veritas University College',6,'3',['15,000','15,000','15,000','0','45,000'])
bac_add('Masters of Business Administration','Veritas University College',6,'1.5',['15,000','9,000','0','0','24,000'])
for title,duration,fees in [('Master of Business Administration (MBA) (By coursework)','1.5',['15,000','9,000','0','0','24,000']),('Master of Education','1.5',['15,000','9,000','0','0','24,000']),('Master in Computing (By research)','2',['15,000','9,000','0','0','24,000']),('Master of Science in Engineering (By research)','2',['15,000','9,000','0','0','24,000'])]+[(t,'3',['15,000','9,000','9,000','0','33,000']) for t in ['Doctor of Philosophy in Education','Doctor of Philosophy (Computing)','Doctor of Philosophy in Engineering','Doctor of Philosophy in Business Management']]:bac_add(title,'UNIMY',9,duration,fees)

# BAC rows whose grids use image-backed or merged fee cells.
for title,duration,fees in [('University of London International Programmes LLB (3+0)','3',['20,000','20,000','20,000','0','60,000']),('UK Transfer Degree Programme Law (2+1 or 1+2)','3',['35,000','35,000','0','0','70,000']),('UK Transfer Degree Programme Business (2+1 or 1+2)','3',['26,000','26,000','0','0','52,000'])]:bac_add(title,'Brickfields Asia College',2,duration,fees)
bac_add('UK Degree Transfer Programme (Mass Communication) (2+1)','IACT College',4,'3',['27,000','27,000','0','0','54,000'])
pr=add_program('bac','Cambridge International Examinations (A-Level) Standard — Science or Arts (2/3/4 subjects)',provider='Brickfields Asia College',duration='1.5 years',lev='foundation')
add_schedule(pr,3,1,'2025',[table('Course fee (MYR / RM), external fees excluded',['Subject load','Course fee'],[['2 subjects','23,900'],['3 subjects','31,900'],['4 subjects','36,900']])],['External fees are not included. Confirm subject selection and the printed intake calendar with the institution.'],extra_pages=[2])

def split_names(text):
    result=[];current=''
    for line in text.splitlines():
        if re.match(r'^(?:BACHELOR|DIPLOMA|CERTIFICATE|FOUNDATION|MASTER|DOCTOR|BSc|BA |BEng|Cambridge|Australian|American|Intensive|Postgraduate)',line.strip(),re.I):
            if current:result.append(clean(current))
            current=line.strip()
        elif current:current+=' '+line.strip()
    if current:result.append(clean(current))
    return result

# SEGi has different providers/campuses and named partner pathways.
institution('segi',142,kind='group',aliases=['SEGi University','SEGi College Kota Damansara','SEGi College Subang Jaya'])
for n in [142,143]:
    campus='Kota Damansara' if n==142 else 'Subang Jaya'
    pathway='SEGi Kota Damansara schedule' if n==142 else 'SEGi College Subang Jaya'
    for pg in original_tables[sid(n)]:
        if n==142:pathway='SEGi College Kota Damansara' if pg['page']==1 else 'SEGi University'
        for tab in pg['tables']:
            expected=17 if n==142 else 15
            if len(tab['rows'][0])!=expected:continue
            groups=[];current=None
            for raw in tab['rows']:
                joined=' '.join(str(v) for v in raw if v)
                if n==143 and 'PARTNER DEGREE 2+0' in joined:pathway='University of Greenwich partner degree 2+0 — SEGi College Subang Jaya'
                if n==143 and 'PARTNER DEGREE 3+0' in joined:pathway='University of Greenwich partner degree 3+0 — SEGi College Subang Jaya'
                if 'FRANCHISE DEGREE 2+0' in joined:pathway='SEGi University franchise degree 2+0 — SEGi College Subang Jaya'
                if 'FRANCHISE DEGREE 3+0' in joined:pathway='SEGi University franchise degree 3+0 — SEGi College Subang Jaya'
                if 'FRANCHISE POSTGRADUATE' in joined:pathway='SEGi University franchise postgraduate — SEGi College Subang Jaya'
                if raw[0] and split_names(raw[0]) and len(raw[0])>15:
                    if re.match(r'^(DIPLOMA|CERTIFICATE|FOUNDATION|BACHELOR|MASTER|DOCTOR|BSc|BA |BEng|INTENSIVE)',raw[0],re.I):
                        current=dict(title=raw[0],provider=pathway,rows=[]);groups.append(current)
                if current:current['rows'].append(raw)
            for group in groups:
                raw=group['rows'][0];r=[cell(c) for c in raw]
                summary=[];components=[]
                if n==142:
                    labels={4:'Tuition & exam fees',5:'Tuition & exam SST 6%',6:'Third-party visa fee',7:'Partner university fee — printed exchange basis MYR6.5'}
                    # Page 1 alone has a partner-SST column. Later pages use
                    # that position for totals and add Year 4 / Year 5 instead.
                    if pg['page']==1:labels.update({8:'Partner fee SST 6%',9:'Total fees before SST',10:'Total SST 6%',11:'Grand total fees',12:'Upon registration',13:'Year 1',14:'Year 2',15:'Year 3'})
                    else:labels.update({8:'Total fees before SST',9:'Total SST 6%',10:'Grand total fees',11:'Upon registration',12:'Year 1',13:'Year 2',14:'Year 3',15:'Year 4',16:'Year 5'})
                    for col,label in labels.items():
                        vals=list(dict.fromkeys(cell(rr[col]) for rr in group['rows'] if cell(rr[col])))
                        if vals:summary.append([label,' / '.join(vals)])
                    for rr in group['rows']:
                        if rr[1] and rr[2]:components.append([cell(rr[1]),cell(rr[2]),cell(rr[3]) or 'Not specified'])
                    if pg['page']==5 and 'MASTER OF SOCIAL SCIENCE IN PSYCHOLOGY' in group['title']:
                        components.extend([['Facilities','3,000','180.00'],['Security Deposit','300','0']])
                else:
                    labels={1:'International admin fee',4:'Tuition & exam fees',5:'Third-party visa fee',6:'Partner university fee',7:'Visa renewal',8:'Total programme fees before SST',9:'Total SST 6%',10:'Grand total fees',11:'Upon registration',12:'SOC Year 1',13:'SOC Year 2',14:'SOC Year 3'}
                    for col,label in labels.items():
                        vals=list(dict.fromkeys(cell(rr[col]) for rr in group['rows'] if cell(rr[col])))
                        if vals:summary.append([label,' / '.join(vals)])
                    for rr in group['rows']:
                        if rr[2] and rr[3]:components.append([cell(rr[2]),cell(rr[3]),'Included in printed total SST where applicable'])
                if not any(label=='Grand total fees' for label,_ in summary):continue
                terms=['The payment columns use the printed registration/year basis; totals are not annual tuition estimates.','Fees are transacted in MYR unless explicitly stated otherwise.','Paid fees are non-refundable and non-transferable except security deposit less damage/loss deductions.','Refund form deadline: graduates/completers within 60 days of exit stamp given to the International Office or parchment release, whichever is later; withdrawals/terminations within 60 days of the official letter.','Use official card, transfer or banking instructions obtained through the application process.']
                if n==142:terms+=['6% service tax applies from 1 September 2025, subject to official changes.','Instalment scheme is on a six-month basis; payment before/at commencement and/or before the 7th of the month. Late penalty RM1 per day.','The source page is branded '+group['provider']+'. Partner awards are described in the individual programme name where supplied.']
                else:terms+=['Discounts, rebates and scholarships have conditions and apply bottom-up; Health / Allied Health students are excluded from the source discounts.','Third-party and partner-university charges remain separate; confirm applicable currency and partner scope before payment.']
                for title in split_names(group['title']):
                    pr=add_program('segi',title,provider=group['provider'],campus=campus)
                    schedule=add_schedule(pr,n,pg['page'],'2026',[table('Fee totals and staged payments (MYR / RM)',['Basis','Printed value'],summary),table('Registration / enrolment / facilities / deposit components (MYR / RM)',['Fee','Amount','SST'],components)],terms,extra_pages=([6,7] if pg['page']==5 and 'MASTER OF SOCIAL SCIENCE IN PSYCHOLOGY' in group['title'] else [7]) if n==142 else [2])

# Spectrum: all seven original scan pages inspected; visually legible fees override OCR gaps.
institution('spectrum',127,aliases=['SIUC'])
spectrum_misc=table('International resource, accommodation and add-on fees (MYR / RM)',['Basis','Amount'],[['International resource Year 1','3,200'],['International resource Year 2','1,200'],['International resource Year 3','1,200'],['ODL international resource','600'],['Airport pickup','300'],['Two sharing accommodation per month + refundable deposit','400 + 400'],['Four sharing accommodation per month + refundable deposit','200 + 200'],['First special pass','200.00'],['Second special pass','250.00'],['Checkout memo','200.00'],['Transfer endorsement','150.00'],['EMGS new application','3,200.00'],['EMGS renewal application','1,200.00']])
spectrum_terms=['Resource fee note: includes visa processing, medical insurance, i-Kad and e-VAL. Confirm applicable resource/add-on scope; do not automatically add all categories.','Airport pickup must be arranged at least seven working days before flight; late notice incurs RM50 extra. Public holidays, outside working hours or weekends incur RM50 extra.','Accommodation includes electricity and water capped at RM100/month. Each unit has fan, bed, mattress, cupboard, study table and chair.','Instalment payment proof must include name, passport, programme, intake, transaction slip and student name in payment reference. Official banking, transfer and Flywire payment methods are supported.','2025 brochure; version history prints May 2024 version 1 and July 2025 version 2, noting increased EMGS fees. Figures are subject to modification or withdrawal.']
entries=[('Foundation in Arts','1',['10,000','-','-','10,000'],'NO'),('Diploma in Management','2.5',['10,000','7,000','6,000','23,000'],'NO'),('Diploma in Electronics Engineering','2.5',['10,000','7,000','6,000','23,000'],'NO'),('Diploma in Renewable Energy Management','2.5',['10,000','7,000','6,000','23,000'],'NO'),('Diploma in Hotel Management','2.5',['10,000','7,000','6,000','23,000'],'NO'),('Bachelor of Business Administration (Hons)','3',['20,000','20,000','20,000','60,000'],'33%'),('Master of Management','1',['40,000','-','-','40,000'],'25%'),('Doctor of Philosophy in Management','3',['20,000','20,000','20,000','60,000'],'25%')]
for title,duration,fees,award in entries:
    pr=add_program('spectrum',title,mode='Conventional — fully in Malaysia',duration=duration+' years')
    add_schedule(pr,127,2,'2025',[table('Tuition and published scholarship (MYR / RM)',['Basis','Printed value'],list(map(list,zip(['Year 1','Year 2','Year 3','Total tuition'],fees)))+[['Scholarship',award]]),spectrum_misc],spectrum_terms+['Scholarship percentage is retained as printed; eligibility and net payment must be confirmed. No calculated discounted total is quoted.'],extra_pages=[4,6,7])
for title,duration,fees in [('Diploma in Management','2.5',['7,000','6,000','5,000','18,000']),('Bachelor of Business Administration (Hons)','3',['13,000','13,000','13,000','39,000']),('Bachelor in Business (Technology Management) (Hons)','3',['13,000','13,000','13,000','39,000']),('Bachelor of Electrical and Electronics Technology (Hons)','3',['13,000','13,000','13,000','39,000']),('Master of Business Administration','1',['20,000','-','-','20,000'])]:
    pr=add_program('spectrum',title,mode='ODL — fully online',duration=duration+' years')
    add_schedule(pr,127,3,'2025',[table('ODL tuition (MYR / RM)',['Basis','Amount'],list(map(list,zip(['Year 1','Year 2','Year 3','Total tuition'],fees)))),spectrum_misc],spectrum_terms,extra_pages=[4,6,7])
pr=add_program('spectrum','Intensive English Programme',duration='6 months',lev='language',notes=['For students who have not fulfilled English entry requirements for any programme.'])
add_schedule(pr,127,4,'2025',[table('English programme (MYR / RM)',['Basis','Amount'],[['Six-month programme','5,000']]),spectrum_misc],spectrum_terms)
for title,age,amount in [('APEL A — T4 (Diploma)','20','240'),('APEL A — T6 (Bachelor)','21','370')]:
    pr=add_program('spectrum',title,provider='APEL A entry assessment',duration='Approximately 2 months',lev='other',notes=['For students who do not meet main-programme entry requirements: minimum age '+age+' and relevant work experience related to the programme.'])
    add_schedule(pr,127,5,'2025',[table('APEL entry assessment (USD)',['Basis','Amount'],[['Assessment fee',amount]])],spectrum_terms)
audit[sid(127)]['pages'][0]['disposition']='2025 cover; no programme rows'

# City: all fee grids were transcribed against original scans; inconsistent printed totals remain.
institution('city',4,aliases=['City University Malaysia'],notes=['Several promotional tuition, yearly-payment and printed-total figures do not reconcile. Each printed amount is retained; confirm the payable schedule before applying.'])
city_terms=['Special promotion validity: 1 January 2025–31 December 2026. Eligibility region: Bangladesh, India, Sri Lanka and Pakistan.','The source advertises up to 50% tuition discount; no discount percentage is recomputed for a row.','All fees subject to 6% SST from 1 September 2025.','First payment: visa (EMGS) RM2,750 + application RM1,000 = RM3,750. Second payment on eVAL: first-year tuition + completion processing RM1,000 + international student fee RM8,000.','Assessment fee RM25 per subject, payable before each semester examination; resource fees are per semester.','Additional examination, retake, course charges and penalties may be imposed. Campus location may change within Malaysia.','Printed totals and yearly payments can conflict with promotional tuition and miscellaneous components. Confirm the itemised amount payable; no replacement sum is asserted.']
city_misc=table('Miscellaneous fees (MYR / RM)',['Basis','Printed amount'],[['EMGS visa','2,750'],['Application processing','1,000'],['International student fee','8,000'],['Completion processing','1,000'],['Printed total miscellaneous','12,750']])
def city_add(title,campus,p,duration,promo,resource,total,years=None):
    pr=add_program('city',title,campus=campus,duration=duration)
    rows=[['Tuition — special promo',promo],['Resource fee per semester',resource],*[[f'Year {i+1}',v] for i,v in enumerate(years or [])],['Printed total — see source scope and reconciliation note',total]]
    add_schedule(pr,4,p,'1 January 2025–31 December 2026',[table('Promotional programme schedule (MYR / RM)',['Basis','Printed amount'],rows),city_misc],city_terms,audience='Bangladesh, India, Sri Lanka and Pakistan promotion')
for title in ['Diploma in Business','Diploma in Early Childhood Education']:city_add(title,'Johor Bahru',3,'3 years (8 semesters)','26,600','300','43,150',['20,750','10,000','10,000','Not scheduled (shaded)'])
for title in ['Bachelor of Business Administration (Honours)','Bachelor of Education (Early Childhood Education) Honours','Bachelor of Fashion Design Technology (Honours) BFDT-JB','Bachelor of Information Technology (Honours) BIT-JB']:city_add(title,'Johor Bahru',3,'3 years (9 semesters)','44,580','500','54,850',['20,750','14,800','14,800','Not scheduled (shaded)'])
for title in ['Master of Business Administration (MBA)','Master of Education (MED)']:city_add(title,'Johor Bahru',3,'1 year (3 semesters)','16,740','500','36,885',['32,385','Not scheduled (shaded)','Not scheduled (shaded)','Not scheduled (shaded)'])
for title in ['Doctor of Philosophy in Business Administration (PhDBA)','Doctor of Philosophy in Education (PhD Edu)']:city_add(title,'Johor Bahru',3,'3 years (9 semesters)','35,820','Not specified','51,550',['20,750','15,400','15,400','Not scheduled (shaded)'])
for title,promo in [('Foundation in Business','12,000'),('Foundation in Arts (Communication)','11,800'),('Foundation in Arts (English)','11,800'),('Foundation in Arts (Graphic Design & Multimedia)','11,800'),('Foundation in Arts (Build Environment)','11,800'),('Foundation in Arts (Fashion Design)','11,800'),('Foundation in Science','11,800'),('Foundation in Information Technology','11,400')]:city_add(title,'Petaling Jaya & Cyberjaya',4,'1 year (3 semesters)',promo,'300','24,985')
diplomas="""Fashion Design|26600|8|43150
Graphic Design|29040|8|43150
Mass Communication|26600|8|43150
Corporate Communication|26600|8|43150
Accounting|26010|7|42850
Business Management|25740|8|43150
Human Resource Management|25740|8|43150
Office Management|25830|8|43150
Islamic Banking|29960|8|43150
Management|25740|7|42850
Information Technology|26010|7|42850
Medical Lab Technology|45440|9|43450
Nursing|46160|6|42550
Occupational Safety & Health|45440|9|43450
Environmental Health|45440|9|43450
Culinary Arts|28440|8|43150
Hotel Management|29040|8|43150
Early Childhood Education|29960|8|43150
Civil Engineering|25830|8|43150
Mechanical Engineering|27360|8|43150
Architectural Technology|26550|8|43150
Interior Design|29040|8|43150"""
for line in diplomas.splitlines():
    title,promo,sem,total=line.split('|');city_add('Diploma in '+title,'Petaling Jaya & Cyberjaya',4,f'3 years ({sem} semesters)',promo,'300',total,['20,750','10,000','10,000'])
bachelors="""Bachelor of Graphic Design (Hons)|44640|3 years (9 semesters)|54850
Bachelor of Fashion Design (Hons)|54600|3 years (9 semesters)|54850
Bachelor of Multimedia (Hons)|44580|3 years (9 semesters)|54850
Bachelor of Communication (Hons) Corporate Communication|39840|3 years (9 semesters)|54850
Bachelor of Communication (Hons) Mass Communication|41600|3 years (9 semesters)|54850
Bachelor of Communication (Hons) Journalism|41580|3 years (9 semesters)|54850
Bachelor of Business Administration (Hons) ***|37560|3 years (9 semesters)|54850
Bachelor of Engineering Management (Hons)|38920|3 years (9 semesters)|54850
Bachelor of Accounting (Hons)|43680|3 years 6 months (10 semesters)|65750
Bachelor of Science (Hons) Accounting & Finance|36350|3 years (9 semesters)|54850
Bachelor of Information Technology (Hons)|42900|3 years (9 semesters)|54850
Bachelor of Computer Science (Hons) Software Engineering|42900|3 years (9 semesters)|54850
Bachelor of Occupational Safety & Health (Hons)|56420|4 years (11 semesters)|66250
Bachelor of Biomedical Sciences (Hons)|56420|4 years (11 semesters)|66250
Bachelor of Environmental Health (Hons)|56420|4 years (11 semesters)|66250
Bachelor of Nursing|42600|4 years (8 semesters)|64750
Bachelor of Hospitality Management (Hons) (Single Award)|43650|3 years (9 semesters)|54850
Bachelor of Education (Early Childhood Education) Honours|36400|3 years (9 semesters)|54850
Bachelor of Applied Psychology (Hons)|44640|3 years (9 semesters)|54850
Bachelor of Education (Hons) in Teaching English as a Second Language (TESL)|40460|3 years (9 semesters)|54850
Bachelor of Civil Engineering with Honours|53280|4 years (8 semesters)|64750
Bachelor of Mechanical Engineering with Honours|50580|4 years (8 semesters)|64750
Bachelor of Science (Hons) Architectural Design|43050|3 years (9 semesters)|54850
Bachelor of Interior Design (Hons)|42350|3.5 years (11 semesters)|55850"""
for line in bachelors.splitlines():
    title,promo,duration,total=line.split('|');four=duration.startswith('4 years') or 'Accounting (Hons)' in title
    city_add(title,'Petaling Jaya & Cyberjaya',5,duration,promo,'500',total,['20,750','15,000' if four else '14,800','15,000' if four else '14,800','10,000' if four else 'Not scheduled (shaded)'])
for title,duration,total,years in [('Master of Business Administration (MBA) ***','1 year (3 semesters)','33,885',['32,385','Not scheduled (shaded)']),('Master of Science in Business Administration (By Research) (MSCBBA)','2 years (6 semesters)','35,385',['20,750','11,635']),('Master of Information Technology (MIT)','1 year (3 semesters)','33,885',['32,385','Not scheduled (shaded)']),('Master of Accounting (MACC)','1 year (3 semesters)','33,885',['32,385','Not scheduled (shaded)']),('Master of Education (MED)','1 year (3 semesters)','33,885',['32,385','Not scheduled (shaded)']),('Master of Architecture (M.ARC)','2 years (4 semesters)','34,385',['20,750','11,635']),('Master of Mechanical Engineering (MME)','1 year (3 semesters)','33,885',['32,385','Not scheduled (shaded)']),('Master of Sport Studies (MSS) By Research','2 years (6 semesters)','35,385',['20,750','11,635']),('Master of Creative Industries and Communication (MCIC)','1 year (3 semesters)','33,885',['32,385','Not scheduled (shaded)']),('Master of Architecture Project Management (MAPM)','1 year (3 semesters)','33,885',['20,750','11,635'])]:city_add(title,'Petaling Jaya & Cyberjaya',5,duration,'32,385','500',total,years)
for title in ['Doctor of Business Administration (DBA)','Doctor of Education (DDE)','Doctor of Philosophy in Business Administration (PhDBA)','Doctor of Philosophy in Design (PhD Design)','Doctor of Philosophy in Education (PhD Edu)','Doctor of Philosophy in Information Technology (PhD IT)','Doctor of Philosophy in Sport Studies (PhD SS)','Doctor of Philosophy in Performing Art (PhD PA)','Doctor of Philosophy in Built Environment (PhD BE)']:city_add(title,'Petaling Jaya & Cyberjaya',6,'3 years (9 semesters)','51,550','Not quoted in PhD table','51,550',['20,750','15,400','15,400'])
audit[sid(4)]['pages'][0]['disposition']='cover; no offer rows'
audit[sid(4)]['pages'][1]['disposition']='institution profile; no programme fee rows'

# MILA: shared tables retain each semester/block and school-specific programme code.
institution('mila',117)
for pg in original_tables[sid(117)]:
    p=pg['page']
    if p not in [1,2,3,5,6,8]:continue
    for tab in pg['tables']:
        if len(tab['rows'])<4 or len(tab['rows'][0])<8:continue
        rows=[list(r) for r in tab['rows']];groups=[];current=None
        # The rounded final programme cells are open paths in the PDF. Their
        # text and last-row amounts fall outside pdfplumber's detected grid.
        # These boundaries/values were checked on all nine original pages.
        missing={2:(11,'Doctor of Philosophy in Engineering (By Research)-FT (N/0710/8/0009) (09/28) (MQA/PA14818)','46000','3-5'),3:(29,'Doctorate of Business Administration (DBA)-ODL (N-DL/0414/8/0075) (10/31) (MQA/PA17618)','42,000','3'),5:(4,'Bachelor of Science (Biotechnology) (Hons) (R3/0512/6/0099) (06/33) (MQA/FA0802)','89,400','3.5'),6:(27,'Bachelor of Computer Science (Hons) (R2/0613/6/0078) (04/30) (MQA/FA2303)','79,550','3.5'),8:(45,'Bachelor of Mass Communication (Honours) (R2/0323/6/0043) (11/32) (MQA/FA5050)','72,500','3.5')}
        if p in missing:
            ri,title,total,duration=missing[p];rows[ri][:3]=[title,total,duration]
        if p==1:rows[-1][-1]='10000'
        if p==2:
            for ri,value in enumerate(['16000','9000','10500','9000','9500','8000'],11):rows[ri][-1]=value
        if p==3:
            for ri in [30,31,32,33,35]:rows[ri][-1]='6250'
            rows[34][-1]='7750'
            for ri in range(38,44):rows[ri][-1]='-'
        if p==5:rows.append([None,None,None,'7','1,800','750','600','3,150'])
        if p==6:rows.append([None,None,None,'7','1,200','750','600','2,550'])
        if p==8:rows[-1][-1]='2,250'
        if p==1:
            current=['Master of Science in Biotechnology (By Research)-FT',rows[1:]];groups=[current]
        else:
            for raw in rows:
                if raw[0] and re.search(r'^(Master|Doctor|Foundation|Diploma|Bachelor)',raw[0],re.I):
                    current=[raw[0],[]];groups.append(current)
                if current:current[1].append(raw[1:])
        for fulltitle,matrix in groups:
            fulltitle=clean(fulltitle);m=re.search(r'\((?:R|N)[^)]*\)',fulltitle)
            title=fulltitle[:m.start()].strip() if m else fulltitle;code=fulltitle[m.start():] if m else None
            first=[cell(v) for v in matrix[0]]
            headers=['Total tuition based on programme structure (RM)','Duration (years)','Semester','Block','Tuition by semester (RM)','International admin (RM)','Resources by semester (RM)','Total semester fee (RM)'] if p<4 else ['Total tuition (RM)','Duration (years)','Semester','Tuition by semester (RM)','International admin (RM)','Resources by semester (RM)','Total semester fee (RM)']
            if len(first)!=len(headers):continue
            mode='ODL' if 'ODL' in title else 'Full-time' if 'FT' in title else None
            pr=add_program('mila',title,code=code,provider='School of Biotechnology' if p in [1,5] else 'School of Engineering & Computing' if p in [2,6] else 'School of Management & Business',mode=mode,duration=first[1]+' years')
            admission=[['Application','200'],['EMGS processing','450' if mode=='ODL' and p<4 else '2,500'],['Registration','3,000' if p<4 else '2,500'],['Refundable deposit','1,500'],['Total admission','5,150' if mode=='ODL' and p<4 else '7,200' if p<4 else '6,700'],['EMGS visa renewal (excluded)','1,700']]
            terms=['2025 international fee structure. Fees are subject to change without prior notice.','Minimum pre-arrival initial payment: RM20,000 for postgraduate (registration RM3,000, refundable deposit RM1,500, international admin RM7,000, tuition RM8,500); RM18,000 for undergraduate (registration RM2,500, refundable deposit RM1,500, international admin RM6,000, tuition RM8,000). Confirm applicability to the selected mode.','Personal bond required by Immigration is additional; amount specified in the offer letter.','Undergraduate semester estimates assume 18–21 credits. Blank source cells are unknown and are not treated as zero.','Use the institution’s official payment workflow for banking instructions.']
            add_schedule(pr,117,p,'2025',[table('Semester / block schedule (MYR / RM)',headers,[[cell(v) for v in r] for r in matrix]),table('Admission and visa charges (MYR / RM)',['Basis','Amount'],admission)],terms,extra_pages=[4 if p<4 else 7 if p in [5,6] else 9])

# UNIRAZAK: eight separate monetary columns; the scholarship column is not silently subtracted.
institution('unirazak',121,aliases=['Universiti Tun Abdul Razak','UNIRAZAK'])
for p in range(2,7):
    words=docs[sid(121)]['pages'][p-1]['words_bbox'];lines=[]
    for w in sorted(words,key=lambda w:w[1]):
        if w[0]>250 and re.fullmatch(r'[\d,]+',w[4]):
            # A tolerance cluster avoids splitting a row at a rounding boundary
            # (the Foundation row's baselines differ by only 0.1 pt).
            if lines and abs(lines[-1][0][1]-w[1])<1.5:lines[-1].append(w)
            else:lines.append([w])
    anchors=sorted([sorted(ws,key=lambda w:w[0]) for ws in lines if len(ws)==8],key=lambda ws:ws[0][1])
    assert len(anchors)=={2:6,3:6,4:7,5:11,6:6}[p],('UNIRAZAK row coverage',p,len(anchors))
    for j,amounts in enumerate(anchors):
        y=(amounts[0][1]+amounts[0][3])/2;prev=(anchors[j-1][0][1]+anchors[j-1][0][3])/2 if j else y-60;nxt=(anchors[j+1][0][1]+anchors[j+1][0][3])/2 if j+1<len(anchors) else y+70;y0=max(y-30,(prev+y)/2);y1=min(y+36,(nxt+y)/2)
        title=bbox_text(words,15,y0,amounts[0][0]-3,y1)
        match=re.search(r'(Foundation|Diploma|Bachelor|Master|Doctor|Post Graduate)',title)
        if not match:continue
        title=title[match.start():];notes=[]
        if 'accreditated by CPA Australia' in title:
            title=title.split('accreditated by CPA Australia')[0].strip()
            notes=['The 2025 source states accreditation by CPA Australia; current validity requires confirmation.']
        pr=add_program('unirazak',title,mode='ODL' if 'ODL' in title else 'Online' if 'Online' in title else None,lev='master_phd' if 'Master' in title and 'Doctor' in title else None,notes=notes)
        labels=['Service fee','Visa fee','Registration fee','Semester fee','Graduation fee','Tuition fee (printed)','Scholarship (printed column)','Total fee (printed)']
        add_schedule(pr,121,p,'2025',[table('Programme fee columns (MYR / RM)',['Source basis','Printed amount'],list(map(list,zip(labels,[w[4] for w in amounts]))))],['The printed scholarship and total columns are retained separately. Their arithmetic does not establish a net offer fee or eligibility; confirm the amount payable before applying.','Literal zero charges remain zero, including ODL rows. Current intake availability and scholarship eligibility require confirmation.'])
audit[sid(121)]['pages'][0]['disposition']='2025 cover'
audit[sid(121)]['pages'][6]['disposition']='institution contact / application reference'

# UniKL: annual tuition, campus codes, and printed interview / scholarship markers.
institution('unikl',146,aliases=['Universiti Kuala Lumpur','UniKL'])
for p in [3,4,5,6]:
    parsed=[];current=None;pending=''
    for line in page(146,p).splitlines():
        parts=re.split(r'\s{2,}',line.strip())
        if len(parts)>=5 and re.fullmatch(r'[\d,*]+',parts[-1]) and re.search(r'\d',parts[-2]):
            title=clean(' '.join(parts[:-4]));campus,intake,duration,fee=parts[-4:]
            title=clean(pending+' '+title);pending=''
            current=dict(title=title,campus=campus,intake=intake,duration=duration,fee=fee);parsed.append(current)
        elif parts and parts[0]:
            text=parts[0]
            if re.match(r'^(Foundation|Diploma|Bachelor|Master|Doctor|EASA)',text):pending=clean(pending+' '+text)
            elif current and re.match(r'^(with|and|Honours|Construction|Manufacturing|Control|Management|System|Systems|Design|Automotive|Science|\(|Refrigeration)',text) and len(parts)==1 and not text.startswith('CAMPUS'):
                current['title']=clean(current['title']+' '+text)
    for row in parsed:
        title=row['title'];interview='IV' in title;title=title.replace('IV','').strip()
        if not re.match(r'^(Foundation|Diploma|Bachelor|Master|Doctor|EASA)',title):continue
        mode='ODL' if 'Distance Learning' in title else 'Research' if p==6 and ('Jan &' in row['intake']) else None
        pr=add_program('unikl',title,campus=row['campus'],mode=mode,duration=row['duration']+' years',intakes=[clean(i) for i in re.split(r'[, &]+',row['intake']) if clean(i)])
        terms=['April 2026 international programme guide. Annual tuition is distinct from full-programme fees.','Fees include 6% SST; tax rates and taxable items may change throughout the programme.','Printed * = bursary scholarship for eligible students; ** = 50% scholarship for eligible students, subject to conditions. No net discount amount is inferred.','Interview required where the programme has the printed IV marker.' if interview else 'Check programme-specific entry requirements through the official application process.','Postgraduate payment charges may differ from undergraduate figures; the source gives indicative postgraduate fees approximately RM3,139–RM6,018 without a universal programme allocation. Confirm the offer-letter payment schedule.','Documents: application, transcripts and scroll, English proficiency proof and passport copy. Accept the offer and upload acceptance forms and required documents.','Semester fees settled before arrival; source pre-arrival guidance says enter Malaysia 10 days before registration. Credit-transfer applicants submit diploma, transcripts and supporting documents for approval.','Arrival support at KLIA terminals 1/2. Panel-clinic check-up within seven days; registration induction compulsory and medical screening finalised.']
        add_schedule(pr,146,p,'2026 — April guide',[table('Published annual tuition (MYR / RM)',['Basis','Printed amount'],[['Tuition for 1 year — scholarship marker retained',row['fee']]]),table('Payment stages (MYR / RM)',['Stage / fee','Amount / source basis'],[['First payment — student visa, all nationalities / Indonesian','3,300 / 3,600'],['After visa approval — tuition','Based on programme'],['Immigration security bond','Based on nationality'],['Student deposit','1,000'],['Accommodation per semester','Based on campus'],['Admission payment including SST','3,370.80']])],terms,extra_pages=[7])
for p in [1,2,8]:audit[sid(146)]['pages'][p-1]['disposition']='cover / campus profile / official entry-requirement and application reference'

# UNISEL: read parallel currencies from their physical columns, not an FX calculation.
institution('unisel',122,aliases=['Universiti Selangor','UNISEL'])
words=docs[sid(122)]['pages'][1]['words_bbox']
for tab in original_tables[sid(122)][1]['tables']:
    if len(tab['rows'][0])!=4:continue
    rects=tab['cells'];rows=tab['rows'];box=tab['bbox']
    myrboxes=[r[1] for r in rects if r[1] and r[1][2]-r[1][0]<70];usdboxes=[r[2] for r in rects if r[2]]
    if not myrboxes or not usdboxes:continue
    x0,x1=myrboxes[0][0],myrboxes[0][2];u0,u1=usdboxes[0][0],usdboxes[0][2]
    anchors=sorted([w for w in words if x0<(w[0]+w[2])/2<x1 and box[1]<(w[1]+w[3])/2<box[3] and re.fullmatch(r'[\d,]+\.\d{2}',w[4])],key=lambda w:w[1])
    for j,w in enumerate(anchors):
        y=(w[1]+w[3])/2;y0=(anchors[j-1][1]+w[1])/2 if j else box[1];y1=(anchors[j+1][1]+w[1])/2 if j+1<len(anchors) else box[3]
        title=bbox_text(words,box[0],y0,x0,y1)
        m=re.search(r'(Foundation|Diploma|Bachelor|Master|Doctor)',title)
        if not m:continue
        title=title[m.start():];code=re.search(r'K\s*P\s*T[ /].*',title)
        name=title[:code.start()].strip() if code else title
        usd=bbox_text(words,u0,w[1]-2,u1,w[3]+2)
        duration=''
        for raw,bs in zip(rows,rects):
            r=bs[3]
            if r and r[1]<=y<=r[3]:duration=cell(raw[3]);break
        if 'YEARS' not in duration and 'YEAR' not in duration:duration=''
        pr=add_program('unisel',name,code=code[0] if code else None,duration=duration or None)
        fees=[['Tuition — MYR',w[4]],['Tuition — source parallel USD',usd or 'Not specified']]
        add_schedule(pr,122,2,'November 2024 brochure',[table('Published tuition — source parallel currencies',['Basis / currency','Printed amount'],fees)],['November 2024 international programme brochure. Currency columns are retained as published; no exchange conversion is applied.','Current fees, programme codes, accreditation validity, entry requirements and intake availability need confirmation.'])
audit[sid(122)]['pages'][0]['disposition']='November 2024 institution / application reference'

# Taylor's: original parallel-currency quotes; intake-specific durations remain explicit.
institution('taylors',145,kind='group',name='Taylor’s University / Taylor’s College',aliases=["Taylor's University","Taylor's College"])
taylor_terms=['2026 fee schedule, subject to annual review (printed review note December 2025).','Payments use the quoted RM rates. USD figures are reference only at the printed RM4 = USD1 basis and may fluctuate.','Durations and total fees vary by intake; use the matching row. Recurring intake months in the 2026 source do not establish currently open admission.','Partner pathways have their own award and overseas-study conditions. University of the West of England 3+0 can be completed in Malaysia; UWE / Queensland University of Technology final-year pathways require UK / Australian study; Canterbury pathways require final-year study in New Zealand where marked.','No tax inclusion, entry requirement or scholarship amount is inferred where not specified.']
from taylors_reviewed import records as reviewed_taylor_records
reviewed_quotes={}
for r in reviewed_taylor_records():
    key=(r['page'],r['title'],r['provider'],r['mode'])
    entry=reviewed_quotes.setdefault(key,dict(notes=[],rows=[]))
    entry['notes']=list(dict.fromkeys(entry['notes']+r['notes']))
    entry['rows']+=r['rows']
for (p,title,provider,mode),entry in reviewed_quotes.items():
    pr=add_program('taylors',title,provider=provider,mode=mode,notes=entry['notes'],intakes=list(dict.fromkeys(r[0] for r in entry['rows'])))
    add_schedule(pr,145,p,'2026 — December 2025 review',[table('Total fees by programme and intake (source parallel currencies)',['Intake','Printed duration','Total fee RM','Source reference USD'],entry['rows'])],taylor_terms,extra_pages=[17])
# The research-doctorate grids list subjects as rows rather than repeating the degree title.
subjects=['Education','Engineering','Science','Social Sciences','Food Studies','Computer Science','Hospitality & Tourism','Business','Medical Science','Design Management','Media and Communication Studies','Architecture','Pharmaceutical Sciences','Law']
for subject in subjects:
    pr=add_program('taylors','Doctor of Philosophy — '+subject,provider='Taylor’s University',mode='Research — full-time',lev='phd',intakes=['February','April','September','June','October'])
    law=subject=='Law'
    add_schedule(pr,145,16,'2026 — December 2025 review',[table('Research doctorate total fee by intake (source parallel currencies)',['Intake','Printed duration','Total fee RM','Source reference USD'],[['February','2 years 10 months','74,073' if law else '76,734','18,518' if law else '19,183'],['April','2 years 8 months','74,073' if law else '76,734','18,518' if law else '19,183'],['September','2 years 11 months','74,073' if law else '76,734','18,518' if law else '19,183'],['June','3 years 1 month','75,292' if law else '77,953','18,823' if law else '19,489'],['October','3 years 2 months','75,292' if law else '77,953','18,823' if law else '19,489']])],taylor_terms)
    pr=add_program('taylors','Doctor of Philosophy — '+subject,provider='Taylor’s University',mode='Research — prior publication',lev='phd',intakes=['February','April','September','June','October'])
    add_schedule(pr,145,17,'2026 — December 2025 review',[table('Prior-publication doctorate total fee by intake (source parallel currencies)',['Intake','Printed duration','Total fee RM','Source reference USD'],[['February','1 year 10 months','56,040','14,010'],['April','1 year 8 months','56,040','14,010'],['September','1 year 11 months','56,040','14,010'],['June','2 years 1 month','57,259','14,315'],['October','2 years 2 months','57,259','14,315']])],taylor_terms)
for title,duration,rm,usd in [('ACCA Foundation in Accountancy (AFIA)','11 months','32,782','8,196'),('ACCA Accelerate','1 year 11 months','23,096','5,774'),('Association of Chartered Certified Accountants (ACCA)','2 years 11 months','55,364','13,841')]:
    pr=add_program('taylors',title,provider='Taylor’s College',duration=duration,intakes=['January','July'],lev='other')
    add_schedule(pr,145,12,'2026 — December 2025 review',[table('Professional programme total fee (source parallel currencies)',['Total fee RM','Source reference USD'],[[rm,usd]])],taylor_terms)
audit[sid(145)]['pages'][17]['disposition']='institution contact / official application reference'

# MMU: original graphics contain programme titles omitted by plain extraction.
institution('mmu',140,aliases=['Multimedia University','MMU'])
mmu_terms=['June 2025 publication. The reduced “Now” figures are dated source quotes; confirm eligibility and current availability.','All fees, including one-time payments, programme fees and related charges, are before 6% SST.','Programme totals, minimum-period research totals and estimated annual amounts are distinct bases; no annualisation is calculated here.','Fees may be amended without prior notice; confirm current offer-letter terms.']
def mmu_add(title,p,duration,rows,mode=None,campus=None,n=140):
    pr=add_program('mmu',title,mode=mode,campus=campus,duration=duration)
    research=mode=='Research';online=mode=='ODL'
    extras=[['Registration upon acceptance','2,000'],['International processing (student visa)','500' if online else '3,500'],['Deposit','500' if research else '1,500'],['Printed total one-time payment','4,000' if online else '6,000' if research else '7,000']]
    if n==140:extras+=[['Long trimester fee','160'],['Short trimester fee','80'],['Printed trimester fees per year','400'],['ODL other payment after enrolment','50']]
    else:extras.append(['Student development per year','50' if online else '200'])
    return add_schedule(pr,n,p,'June 2025',[table('Programme fees (MYR / RM)',['Basis','Printed amount'],rows),table('Other payments — source mode scope (MYR / RM)',['Fee / timing','Amount'],extras)],mmu_terms,extra_pages=[1])
for title,base in [('Foundation in Management','20,750'),('Foundation in Business','20,750'),('Foundation in Engineering','22,750'),('Foundation in Computing','21,750'),('Foundation in Science and Technology','21,750'),('Foundation in Creative Multimedia','19,500'),('Foundation in Communication','18,750')]:mmu_add(title,1 if title in ['Foundation in Management','Foundation in Business','Foundation in Engineering'] else 2,'1 year',[['Base total programme fee',base],['Published reduced total programme fee — confirm availability','12,000']])
for title,duration,total,annual,p in [('Diploma in Management','2 years','26,500','13,250',1),('Diploma in Business Administration','2 years','26,500','13,250',1),('Diploma in Finance','2 years','26,500','13,250',1),('Diploma in Accounting','2 years','31,500','15,750',1),('Diploma in Digital Business','2 years','26,500','13,250',1),('Diploma in Electronic Engineering','2 years 9 months','30,850','11,218',1),('Diploma in Mechanical Engineering','2 years 9 months','30,850','11,218',1),('Diploma in Information Technology','2 years','28,000','14,000',2),('Diploma in 3D Modelling and Animation','2 years 3 months','30,550','13,578',2),('Diploma in Creative Multimedia','2 years','30,250','15,125',2),('Diploma in Creative Audio','2 years','30,250','15,125',2),('Diploma in Cinematography','2 years','30,250','15,125',2),('Diploma in Applied Communication','2 years','26,500','13,250',2)]:mmu_add(title,p,duration,[['Total programme fee',total],['Estimated yearly programme fee',annual]])
for title in ['Bachelor of Finance (Hons.)','Bachelor of Marketing (Hons.)','Bachelor of Analytical Economics (Hons.)','Bachelor of Business Management (Hons.)','Bachelor of Business Administration (Hons.) (Banking and Finance)','Bachelor of Business Administration (Hons.) (Human Resource Management)','Bachelor of Business Administration (Hons.) (International Business)','Bachelor of Business Administration (Hons.) (Marketing Management)','Bachelor of Business Administration (Hons.) Digital Business Management','Bachelor of Digital Enterprise Management (Hons.)']:mmu_add(title,1,'3 years',[['Total programme fee','67,250'],['Estimated yearly programme fee','22,417']])
mmu_add('Bachelor of Accounting (Hons.)',1,'3 years',[['Total programme fee','78,600'],['Estimated yearly programme fee','26,200']])
for title in ['Bachelor of Engineering (Hons.) Electrical','Bachelor of Engineering (Hons.) Electronics','Bachelor of Engineering (Hons.) Electronics Majoring in Telecommunications','Bachelor of Engineering (Hons.) Electronics Majoring in Computer','Bachelor of Electronics Engineering (Robotics & Automation) with Honours','Bachelor of Mechanical Engineering with Honours']:mmu_add(title,1,'4 years',[['Total programme fee','94,500'],['Estimated yearly programme fee','23,625']])
for title in ['Bachelor of Science (Hons.) Intelligent Robotics','Bachelor of Science (Honours) in Applied Artificial Intelligence']:mmu_add(title,1,'3 years',[['Total programme fee','77,250'],['Estimated yearly programme fee','25,750']])
for title in ['Bachelor of Computer Science (Hons.) in Software Engineering','Bachelor of Computer Science (Hons.) in Game Development','Bachelor of Computer Science (Hons.) in Data Science','Bachelor of Computer Science (Hons.) Cybersecurity','Bachelor of Information Technology (Hons.) Information Systems','Bachelor of Information Technology (Hons.) Data Communication and Networking','Bachelor of Information Technology (Hons.) Business Intelligence and Analytics','Bachelor of Computer Science (Hons.) Artificial Intelligence','Bachelor of Information Technology (Hons.) Security Technology','Bachelor of Multimedia (Hons.) (Advertising Design)','Bachelor of Multimedia (Hons.) (Animation)','Bachelor of Multimedia (Hons.) (Visual Effects)','Bachelor of Cinematic Arts (Hons.)','Bachelor of Immersive Media Design (Hons.)']:mmu_add(title,2,'3 years',[['Total programme fee','77,250'],['Estimated yearly programme fee','25,750']])
mmu_add('Bachelor of Communication (Strategic Communication) (Hons.)',2,'3 years',[['Total programme fee','64,750'],['Estimated yearly programme fee','21,583']])
mmu_add('Bachelor of Management (Hons.) — ODL',2,'5 years',[['Total programme fee','37,750'],['Estimated yearly programme fee','7,550']],mode='ODL')
pr=add_program('mmu','English Proficiency Programme (EPP)',duration='1 trimester per level',lev='language')
add_schedule(pr,140,2,'June 2025',[table('EPP level fees (MYR / RM)',['Level / scope','Programme fee','Estimated yearly fee'],[['Level 1 — Beginner to Elementary','3,900','-'],['Level 2 — Lower Intermediate to Intermediate','3,900','-'],['Level 3 — Upper Intermediate to Advance','3,900','-']])],mmu_terms)
for title,campus,base,offer in [('Master of Engineering (Telecommunications)','Cyberjaya','37,750','25,875'),('Master of Science in Engineering Business Management','Cyberjaya','35,250','25,250'),('Master of Creative Multimedia','Cyberjaya','29,000','24,650'),('Master of Business Administration','Cyberjaya','27,750','23,600'),('Master of Business Administration','Melaka','27,750','23,600'),('Master of Computer Science',None,'18,400',None),('Executive Master of Business Administration',None,'22,500','16,500'),('Master of Information Technology',None,'18,400',None)]:
    rows=[['Base total programme fee',base]]+([['Published reduced total programme fee — confirm availability',offer]] if offer else [])
    mmu_add(title,1,None,rows,mode='Coursework' if campus else 'ODL',campus=campus,n=139)
for title,campus,annual,exam,total,duration in [('Master of Philosophy (Management)','Cyberjaya & Melaka','4,500','3,600','8,100','Minimum 1 year'),('Master of Engineering Science','Cyberjaya & Melaka','4,500','1,650','6,150','Minimum 1 year'),('Master of Computing by Research','Cyberjaya & Melaka','4,500','1,650','6,150','Minimum 1 year'),('Doctor of Philosophy (Engineering)','Cyberjaya & Melaka','4,500','3,750','12,750','Minimum 2 years'),('Doctor of Philosophy in Computing by Research','Cyberjaya & Melaka','4,500','3,750','12,750','Minimum 2 years'),('Doctor of Philosophy (Management)','Cyberjaya & Melaka','4,500','5,700','14,700','Minimum 2 years'),('Master of Science (Creative Multimedia)','Cyberjaya','4,500','1,650','6,150','Minimum 1 year'),('Master of Philosophy (Communication)','Cyberjaya','4,500','1,650','10,650','Minimum 2 years'),('Doctor of Philosophy (Creative Multimedia)','Cyberjaya','4,500','3,750','12,750','Minimum 2 years'),('Doctor of Philosophy (Communication)','Cyberjaya','4,500','3,750','17,250','Minimum 3 years'),('Master of Laws','Melaka','4,500','3,600','12,600','Minimum 2 years'),('Doctor of Philosophy (Laws)','Melaka','4,500','5,700','19,200','Minimum 3 years')]:mmu_add(title,1,duration,[['Yearly programme fee',annual],['Modules & exam fee',exam],['Printed total for stated minimum duration',total]],mode='Research',campus=campus,n=139)
mmu_add('Doctor of Business Administration',1,None,[['Total programme fee','55,200']],mode='Mixed mode',campus='Cyberjaya',n=139)

# KLUST's July 2025 summaries are historical references, attached by programme code.
def core_code(code):
    m=re.search(r'(\d{3,4})/([34678])/(\d{4})',code or '')
    return m[0] if m else None
for n in [109,110]:
    for pg in original_tables[sid(n)]:
        p=pg['page']
        for tab in pg['tables']:
            if len(tab['rows'][0])!=4:continue
            for row in tab['rows']:
                if not row[0] or 'KP' not in row[0]:continue
                rawtitle=clean(row[0]);m=re.search(r'KP(?:T|/)',rawtitle)
                if not m:continue
                name=rawtitle[:m.start()].strip();code=rawtitle[m.start():];core=core_code(code)
                candidates=[pr for pr in programmes.values() if pr['institutionId']=='klust' and ((core and core_code(pr['code'])==core) or ('Intensive English' in name and pr['level']=='language' and (('Postgraduate' in (pr['provider'] or ''))==(n==110))))]
                if len(candidates)==1:pr=candidates[0]
                else:
                    lev='language' if 'Intensive English' in name else 'phd' if core and '/8/' in core else 'master' if n==110 else 'foundation' if core and '/3/' in core else 'diploma' if core and '/4/' in core else 'bachelor'
                    prefix={'phd':'Doctor of Philosophy in ','master':'Master of ','foundation':'Foundation in ','diploma':'Diploma in ','bachelor':'Bachelor of ','language':''}[lev]
                    pr=add_program('klust',prefix+name.replace(' **','').replace(' ***',''),code=code,lev=lev,notes=['Historical July 2025 programme-code reference. A successor identity is not established for this exact code; confirm before applying.'])
                fees=[['Printed tuition basis and amount',cell(row[2])],['Approximate total programme fee / printed payment terms',cell(row[3])]]
                general=[['Processing — non-refundable, first-year visa package','3,850'],['iKad per year','50'],['Visa processing per year','480'],['Medical insurance per year','630'],['Medical examination per year','250'],['International student administration — one-time','12,000' if n==110 else '8,000'],['Refundable caution fee','1,500']]
                if n==109:general+=[['Bachelor / diploma library: semester / short semester','160 / 80'],['Bachelor / diploma student club: semester / short semester','80 / 40'],['Foundation library / semester','160'],['Foundation student club / semester','80'],['Intensive English library per level','160']]
                terms=['Historical reference: effective 1 July 2025; printed 15 July 2025. Later programme-specific 2026 schedules have their own fees and terms and must not be combined with this edition.','Approximate totals exclude processing fee and include 6% SST as printed.','Initial advance is offset against fees on registration and subsequent semesters; any remaining balance is returned on completion or leaving.','Undergraduate initial payment before arrival: RM15,000 for IEP/foundation/diploma, RM18,000 for bachelor; postgraduate initial RM18,000 after admission confirmation. Apply the correct student group only.','Semester fees due on registration and non-refundable unless otherwise stated. Tuition refund: 60% with an approved withdrawal form within 14 days after registration begins; 80% before registration begins.','UG Easy Payment Scheme: minimum RM2,000 on semester registration with CGPA at least 2.000; remaining semester / short-semester balance in at most three / two monthly instalments; fully settle two weeks before final exams.'] if n==109 else ['Historical reference: effective 1 July 2025; printed 15 July 2025. Use the correct edition and student group; do not combine with 2026 amounts.','Approximate totals exclude processing fee and include 6% SST as printed.','Initial RM18,000 after admission confirmation, offset against registration and subsequent semesters; unused balance returned on completion or departure. MBA ODL follows acceptance-confirmation timing.','Tuition refund: 60% with an approved withdrawal form within 14 days after registration begins; 80% before registration begins.','Research programmes extending beyond the stated period incur RM2,000 per semester, up to 12 semesters for PhD, 9 for MSc Built Environment, and 8 for Master of Civil / Electronics Engineering.']
                terms+=['Processing includes i-Kad, medical insurance, visa processing and medical exam for one year, non-refundable. Self-EMGS processing approx. RM1,580; progression students RM2,500. Renewal charged when due.','Student-pass cancellation on completion or withdrawal RM100; replacement iKad charged at EMGS rate.','Caution refund requires application within three months after completion/withdrawal. Refund within 60 days after claim/withdrawal forms, after deduction of outstanding amounts.','All settlement is in RM. Official receipt issued on payment; additional copies not entertained. Use official university payment instructions.','** marks a source accreditation claim for that edition; no current accreditation validity is inferred.']
                add_schedule(pr,n,p,'July 2025 — printed 15 July',[table('Historical fee reference (MYR / RM; approximate total)',['Basis','Printed amount / terms'],fees),table('Historical shared charges (MYR / RM)',['Basis','Amount'],general)],terms,extra_pages=[1,4 if n==109 else 3])

# Taylor's American Degree Transfer groups are separate from complete degrees.
for title,majors,rm,usd in [('Business','Actuarial Science; Economics; Finance; International Business; Management; Marketing','92,058','23,014'),('Engineering','Aerospace / Aeronautical Engineering; Applied Science; Chemical / Petroleum Engineering; Civil Engineering; Electrical / Electronic Engineering; Mechanical Engineering','92,115','23,029'),('Computer Science','Artificial Intelligence; Computer Graphics; Computer Gaming; Computer Network; Software Development','92,174','23,043'),('Liberal Arts','Anthropology / Archeology; History; Mass Communication; Political Science; Psychology; Sociology','80,806','20,201')]:
    pr=add_program('taylors','American Degree Transfer Program — '+title,provider='Taylor’s University',lev='degree_transfer',intakes=['February','June','September'],notes=['Listed pathways: '+majors,'Confirm the receiving university and which transfer / overseas fees are outside this quoted schedule.'])
    add_schedule(pr,145,8,'2026 — December 2025 review',[table('Degree transfer fee and intake durations (source parallel currencies)',['Intake','Duration','Published total fee RM','Reference USD'],[['February','1 year 10 months',rm,usd],['June','1 year 11 months',rm,usd],['September','2 years',rm,usd]])],taylor_terms)

# File coverage and original-page review are separate audit dimensions.
def finish():
    # Exact student-facing duplicates reuse a schedule and retain both source references.
    dedup={};redirects={}
    for key,item in list(schedules.items()):
        pr=next(p for p in programmes.values() if item['id'] in p['scheduleIds'])
        signature=json.dumps([pr['id'],item['period'],item['audience'],item['tables'],item['terms']],sort_keys=True)
        if signature in dedup:
            canonical=dedup[signature];canonical['refs']+=item['refs'];redirects[item['id']]=canonical['id'];del schedules[key]
        else:dedup[signature]=item
    for pr in programmes.values():pr['scheduleIds']=list(dict.fromkeys(redirects.get(i,i) for i in pr['scheduleIds']))
    for a in audit.values():
        for pg in a['pages']:pg['scheduleIds']=[redirects.get(i,i) for i in pg['scheduleIds']]
    audit[sid(2)]['pages'][0]['disposition']='2026 Group 2 regional audience cover'
    audit[sid(134)]['pages'][2]['disposition']='shared international fee / partner / payment terms linked to APU schedules'
    audit[sid(142)]['pages'][5]['disposition']='continuation of psychology fee components from page 5'
    audit[sid(145)]['pages'][7]['disposition']='imported American Degree Transfer programme groups'
    for n in [147]:
        for p in [1,7,8]:audit[sid(n)]['pages'][p-1]['disposition']='cover / official payment and application reference; bank routing retained privately'
    for record in index:
        for p in record['blank_render_pages'].split(';'):
            if p.strip():audit[record['source_id']]['pages'][int(p)-1]['disposition']='blank or non-offer stray marks, as confirmed by source review'
    catalogue['programmes']=sorted(programmes.values(),key=lambda p:(p['institutionId'],p['title'],p['id']))
    catalogue['schedules']=list(schedules.values())
    catalogue['institutions']=[i for i in catalogue['institutions'] if any(p['institutionId']==i['id'] for p in programmes.values()) or i['kind']=='reference']
    serialized=json.dumps(catalogue,ensure_ascii=False,indent=2)+'\n'
    output_hash=hashlib.sha256(serialized.encode()).hexdigest()
    if '--check' in sys.argv:assert OUT.read_text()==serialized,'Catalogue is stale; rebuild with --apply after review'
    if '--apply' in sys.argv:
        temp=OUT.with_suffix('.json.tmp');temp.write_text(serialized);os.replace(temp,OUT)
    overview=dict(institutions=catalogue['institutions'],programmes=[{k:p[k] for k in ['id','title','institutionId']} for p in catalogue['programmes']])
    overview_text=json.dumps(overview,ensure_ascii=False,indent=2)+'\n'
    overview_path=OUT.parent/'overview.json'
    if '--check' in sys.argv:assert overview_path.read_text()==overview_text,'Overview is stale'
    if '--apply' in sys.argv:
        temp=overview_path.with_suffix('.json.tmp');temp.write_text(overview_text);os.replace(temp,overview_path)
    for entry in audit.values():
        for pg in entry['pages']:
            pg['programmeIds']=sorted(set(pg['programmeIds']));pg['scheduleIds']=sorted(set(pg['scheduleIds']))
    (PACK/'audit/coverage.json').write_text(json.dumps(list(audit.values()),ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(dict(institutions=len(catalogue['institutions']),programmes=len(programmes),schedules=len(schedules),mappedSources=sum(a['disposition']=='mapped' for a in audit.values()),totalSources=len(audit),mode='apply' if '--apply' in sys.argv else 'check' if '--check' in sys.argv else 'dry-run',outputHash=output_hash)))

if __name__=='__main__':finish()
