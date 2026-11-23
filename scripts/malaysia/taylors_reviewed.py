"""MY-145: explicit mappings checked against original rendered pages 1–17.

Merged graphic cells cross programme and intake boundaries. Do not infer their
meaning by forward-filling text-table rows. Amounts below are printed totals,
with the source's parallel reference USD, never exchange conversions.
"""

def records():
    out=[]
    def add(page,titles,rm,usd,durations,months='February|April|September',notes=(),mode=None):
        months=months.split('|')
        ds=durations.split('|')
        if len(ds)==1:ds*=len(months)
        assert len(ds)==len(months),(page,titles,ds,months)
        rms=rm.split('|');usds=usd.split('|')
        if len(rms)==1:rms*=len(months)
        if len(usds)==1:usds*=len(months)
        assert len(rms)==len(usds)==len(months)
        for title in titles.split(';'):
            out.append(dict(page=page,title=title,provider='Taylor’s College' if page in [11,12] else 'Taylor’s University',mode=mode or ('Coursework' if page in [13,14] else None),notes=list(notes),rows=[list(r) for r in zip(months,ds,rms,usds)]))
    A='2 years 11 months|2 years 9 months|2 years 10 months'
    B='2 years 11 months|2 years 11 months|2 years 10 months'
    C='3 years 1 month|2 years 11 months|2 years 10 months'
    france=['Dual award: Taylor’s University, University of Toulouse Jean Jaurès (UT2J) and Académie de Toulouse (ADT), France; entire undergraduate course completed in Malaysia as stated on page 7.']
    uwe=['Dual award with University of the West of England (3+0 or 2+1) or Queensland University of Technology (2+1), as marked. Confirm selected pathway; overseas final-year fees are not established by this quote.']
    add(1,'Bachelor of Business (Hons);Bachelor of Business (Hons) in International Business & Marketing', '159,859','39,965',A,notes=uwe+['Business specialisations: Digital Marketing & Analytics; Finance; Global Business & Sustainability; Management; Marketing; Digital Business & Transformation; Supply Chain Management.'])
    add(1,'Bachelor of Entrepreneurship (Hons) in Team Entrepreneurship','139,596','34,899',B,notes=['Dual award with University of the West of England (3+0).'])
    add(1,'Bachelor of Accounting (Finance) (Honours)','149,744|148,525|148,525','37,436|37,131|37,131',C,notes=['Dual award: University of the West of England (3+0 or 2+1) or University of Canterbury (2+1). Canterbury final year in New Zealand.'])
    add(2,'Bachelor of Finance and Economics (Hons);Bachelor of Banking and Finance (Hons)','148,526','37,132',A,notes=uwe)
    add(2,'Bachelor of Accounting with Fintech (Honours)','149,872|148,653|148,653','37,468|37,163|37,163',C,notes=['Dual award with University of Canterbury (2+1); final year in New Zealand.'])
    add(2,'Bachelor of Actuarial Studies (Honours)','143,603','35,901','3 years',notes=['Dual award with University of Essex, UK (2+1). The same title also has a separate printed four-year fee variant.'])
    add(2,'Bachelor of Actuarial Studies (Honours)','157,643','39,411','4 years',months='April|February|September',notes=['Four-year variant as printed; confirm pathway applicability.'])
    add(2,'Bachelor of Laws (Hons)','162,148','40,537',B)
    add(2,'Bachelor in Philosophy, Politics, and Economics (Hons)','150,317|149,098|149,098','37,579|37,274|37,274',C)
    add(3,'Bachelor of Software Engineering (Hons);Bachelor of Computer Science (Hons);Bachelor of Information Technology (Honours) — WBL/Technopreneurship','151,273','37,818',B)
    add(3,'Bachelor of Software Engineering (Honours) — WBL;Bachelor of Computer Science (Honours) — WBL/Technopreneurship;Bachelor of Information Technology (Hons)','151,273','37,818',A,notes=['Dual award with University of the West of England (2+1), where marked. Computer Science specialisations: Data Science; Cyber Security; Mobile Computing; Artificial Intelligence. IT specialisations: Internet Technologies; Business Intelligence and Analytics; Game Design; Digital Transformation.'])
    add(4,'Bachelor of Design (Hons) in Creative Media','151,273','37,818',B,notes=['Specialisations: Graphic Design; UI/UX; Digital Animation; Immersive Design; Entertainment Design.'])
    add(4,'Bachelor of Fashion Design Technology (Hons)','144,508','36,127',A)
    add(4,'Bachelor of Interactive Spatial Design (Honours);Bachelor of Interactive Spatial Design (Honours) — WBL','144,976','36,244',A)
    add(4,'Bachelor of Electrical & Electronic Engineering with Honours;Bachelor of Chemical Engineering with Honours;Bachelor of Mechanical Engineering with Honours;Bachelor of Mechatronics Engineering with Honours','203,808','50,952','3 years 11 months|3 years 9 months|3 years 10 months')
    add(5,'Bachelor of Science (Hons) in Sustainable Digital Construction Management;Bachelor of Science (Hons) in Sustainable Digital Construction Management — WBL','132,842','33,210',A,notes=['Specialisations: Green Construction; Smart Construction.'])
    add(5,'Bachelor of Science (Hons) in Architecture','165,697','41,424',A)
    add(5,'Bachelor of Arts (Hons) in Interior Architecture','161,627','40,407','3 years 5 months|3 years 3 months|3 years 4 months')
    add(5,'Bachelor of Quantity Surveying (Hons)','133,143','33,286',A)
    add(5,'Bachelor of Education (Hons)','133,414','33,354',B,notes=['Specialisations: Primary Education; Teaching of English Language; Early Childhood Education; Special Educational Needs.'])
    add(5,'Bachelor of Mass Communication (Hons) in Advertising and Brand Management','150,128','37,532',A)
    add(6,'Bachelor of Mass Communication (Hons);Bachelor of Mass Communication (Hons) (Digital Media Production);Bachelor of Mass Communication (Hons) Public Relations and Marketing;Bachelor of Mass Communication (Hons) Public Relations and Event Management','150,128','37,532',A,notes=['Mass Communication specialisations: Digital Media Production; Advertising & Brand Management; Journalism & Media Practice; Public Relations.'])
    add(6,'Diploma in Hotel Management','78,900','19,725','1 year 11 months',months='April|August',notes=france)
    add(6,'Diploma in Culinary Arts','86,723','21,681','1 year 11 months',months='April|August',notes=france)
    add(6,'Advanced Diploma in Patisserie & Gastronomic Cuisine','54,851','13,713','11 months',months='April|August',notes=france)
    add(7,'Bachelor of International Hospitality Management (Hons);Bachelor of International Tourism Management (Hons);Bachelor of International Events Management (Hons);Bachelor of Culinary Management (Hons)','149,859|148,640|148,640','37,465|37,160|37,160',C,notes=france+['Work-Based Learning option is marked for Hospitality and Events Management.'])
    add(7,'Bachelor of Science (Hons) in Culinology','157,300|156,081|156,081','39,325|39,020|39,020',C,notes=['Dual Track option available, as printed.'])
    add(7,'Bachelor of Patisserie Arts (Hons)','143,104|141,885|141,885','35,776|35,471|35,471',C,notes=france)
    # Page 8 transfer pathways are mapped separately by the main importer.
    add(9,'Intensive English','25,041','6,260','2 months',months='January|May|September')
    add(9,'Bachelor of Psychology (Hons)','139,252','34,813',A)
    add(9,'Bachelor of Social Science with Honours (International Relations)','133,210','33,303',A,notes=['Work-Based Learning option available.'])
    add(9,'Bachelor of Performing Arts (Hons)','133,300','33,325',B,notes=['Majors: Performance; Music; Dance.'])
    add(10,'Bachelor of Medicine, Bachelor of Surgery (MBBS)','511,422','127,856','4 years 10 months|4 years 11 months',months='April|September')
    add(10,'Bachelor of Food Science (Hons);Bachelor of Biotechnology (Hons)','151,273','37,818',A)
    add(10,'Bachelor of Biomedical Science (Hons)','170,650','42,663','3 years 5 months|3 years 3 months|3 years 4 months')
    add(10,'Bachelor of Applied Health Sciences (Hons)','163,179','40,795',A)
    add(10,'Bachelor of Pharmacy with Honours','233,556','58,390','3 years 9 months|3 years 10 months',months='April|September')
    add(10,'Bachelor of Pharmaceutical Sciences (Honours)','145,434','36,359','2 years 11 months|2 years 10 months',months='April|September',notes=['Tracks: Conventional and WBL.'])
    for title,rm,usd in [('3 humanities subjects','55,849','13,962'),('1 humanities, 2 science subjects','58,075','14,519'),('4 humanities subjects','69,208','17,302'),('1 humanities, 3 science subjects','71,230','17,808')]:
        add(11,'Cambridge A Level — '+title,rm,usd,'1 year 6 months|1 year 3 months|1 year 6 months',months='February|April|August')
    add(11,'Australian Matriculation — 5 humanities subjects','59,140|59,140|65,285','14,785|14,785|16,321','10 months|1 year|1 year 3 months',months='February|April|August')
    add(11,'Australian Matriculation — 2 humanities, 3 science subjects','61,366|61,366|68,624','15,342|15,342|17,156','10 months|1 year|1 year 3 months',months='February|April|August')
    add(11,'Foundation in Arts;Foundation in Business;Foundation in Design;Foundation in Natural and Built Environments;Foundation in Computing','47,039','11,760','10 months',months='February|April|August')
    add(11,'Foundation in Engineering;Foundation in Science','50,219','12,555','10 months',months='February|April|August')
    add(12,'Diploma in Accounting;Diploma in Business;Diploma in Communication;Diploma in Fashion Design Technology;Diploma in Digital Design;Diploma in Information Technology','80,037','20,009','1 year 11 months',months='April|August')
    add(12,'Diploma in Early Childhood Education','64,279','16,070','2 years 3 months|2 years 4 months',months='April|August')
    add(12,'Diploma in Interior Design','81,576','20,394','2 years 3 months|2 years 4 months',months='April|August')
    add(13,'Master of Architecture','80,908','20,227','1 year 9 months|1 year 11 months',months='April|September')
    bridge=['Students without experience in Computing must complete and pass a Bridging module, as printed.']
    add(13,'Master of Applied Computing','67,949|67,949|67,949|69,168|69,168','16,987|16,987|16,987|17,292|17,292','11 months|11 months|1 Months (printed; requires confirmation)|1 year 2 months|1 year 2 months',months='February|April|September|June|November',notes=['Majors: Artificial Intelligence; Data Science; Cybersecurity. September duration is printed “1 Months”; no correction is inferred.'])
    add(13,'Master of Applied Computing with Bridging Module','71,788|71,788|71,788|72,108|72,108','17,947|17,947|17,947|18,027|18,027','1 year 1 month|1 year 2 months|1 year 2 months|1 year 4 months|1 year 4 months',months='February|June|November|April|September',notes=bridge)
    add(13,'Master of Applied Computing (Double Specialisations)','79,649|79,649|79,649|79,969|79,969','19,912|19,912|19,912|19,992|19,992','1 year 1 month|1 year 2 months|1 year 2 months|1 year 4 months|1 year 4 months',months='February|June|November|April|September')
    add(13,'Master of Applied Computing (Double Specialisations) with Bridging Module','82,590|82,590|82,590|82,590|83,808','20,648|20,648|20,648|20,648|20,952','1 year 6 months|1 year 4 months|1 year 4 months|1 year 4 months|1 year 7 months',months='February|April|September|November|June',notes=bridge)
    add(13,'Master of Communication','66,397|66,397|67,616|67,616|67,616','16,599|16,599|16,904|16,904|16,904','1 year 6 months|1 year 6 months|1 year 9 months|1 year 7 months|1 year 9 months',months='February|September|April|June|November')
    add(13,'Master of Business Administration;Master of Management','74,567|74,567|75,786|75,786|74,567','18,642|18,642|18,947|18,947|18,642','11 months|11 months|1 year 2 months|1 year 2 months|11 months',months='February|April|June|November|September')
    add(13,'Master of International Hospitality Management','78,500|80,039|78,820|78,820|78,820','19,625|20,010|19,705|19,705|19,705','1 year 1 month|1 year 7 months|1 year 4 months|1 year 4 months|1 year 4 months',months='February|June|April|September|November',notes=['Dual award with University of Toulouse Jean Jaurès (UT2J), France.'])
    add(14,'Master of Food Studies and Gastronomy','77,972|77,972|77,972|79,191','19,493|19,493|19,493|19,798','1 year 4 months|1 year 4 months|1 year 4 months|1 year 7 months',months='April|September|November|June')
    add(14,'Master of Laws;Master of Laws in Healthcare and Medical Law','76,912|76,912|76,912|76,912|78,131','19,228|19,228|19,228|19,228|19,533','1 year 6 months|1 year 4 months|1 year 4 months|1 year 4 months|1 year 7 months',months='February|April|September|November|June')
    add(14,'Master of Laws in Healthcare and Medical Law with Bridging Module','83,026|83,026|84,245|84,245|84,245','20,757|20,757|21,061|21,061|21,061','1 year 6 months|1 year 6 months|1 year 9 months|1 year 9 months|1 year 9 months',months='February|September|April|June|November')
    add(14,'Master of Counselling','72,496','18,124','1 year 11 months',months='April|September')
    add(14,'Master of Clinical Psychology','86,085','21,521','1 year 11 months',months='April|September')
    add(14,'Master of Teaching and Learning','62,581|62,581|62,581|63,800','15,645|15,645|15,645|15,950','1 year 4 months|1 year 4 months|1 year 4 months|1 year 7 months',months='April|September|November|June',notes=['Majors: English Language; Early Childhood; Mathematics; Science; Social Studies; Chinese as a Second Language; Higher Education.'])
    add(14,'Master of Science in Virtual Digital Design and Construction','65,833|65,833|65,833|67,052|67,052','16,458|16,458|16,458|16,763|16,763','11 months|11 months|11 months|1 year 2 months|1 year 2 months',months='February|April|September|June|November')
    add(14,'Doctor of Business Administration','98,103','24,526','2 years 11 months',months='April|September')
    online='January|April|June|September|November'
    add(15,'Master in Applied Computing','34,557','8,639','1 year 11 months|1 year 11 months|2 years|2 years 2 months|2 years 2 months',months=online,mode='100% online')
    add(15,'Master in Applied Computing with Bridging Module','36,170','9,043','2 years 2 months|2 years 2 months|2 years 4 months|2 years 5 months|2 years 4 months',months=online,mode='100% online')
    add(15,'Master of Business Administration;Master of Teaching & Learning;Master of Management','45,156','11,289','2 years|1 year 11 months|2 years|2 years 2 months|2 years 2 months',months=online,mode='100% online')
    add(15,'Master of Global Hospitality Management','32,902','8,226','2 years|1 year 11 months|2 years|2 years 2 months|2 years 2 months',months=online,mode='100% online')
    add(15,'Postgraduate Certificate in Education','17,999','4,500','1 year|11 months|1 year|1 year|11 months',months='February|April|June|August|November',mode='100% online')
    for page,titles in [(15,'Master of Science in Tourism;Master of Science in Medical Science;Master of Computer Science;Master of Science in Engineering;Master of Philosophy in Pharmacy'),(16,'Master of Philosophy in Pharmaceutical Sciences;Master of Food Studies;Master of Education;Master of Design')]:
        add(page,titles,'56,316|56,316|56,316|57,535|57,535','14,079|14,079|14,079|14,384|14,384','1 year 10 months|1 year 8 months|1 year 11 months|2 years 1 month|2 years 2 months',months='February|April|September|June|October',mode='Research')
    return out
