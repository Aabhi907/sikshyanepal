-- Import the 50-college primary-source research pack into the public directory.
-- Static profile facts were reviewed on 2026-09-03. Dynamic fees, deadlines,
-- eligibility claims and scholarship amounts are intentionally not imported.

ALTER TABLE colleges ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS programs_offered TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS facilities TEXT[] NOT NULL DEFAULT '{}';

DO $$ BEGIN
  ALTER TABLE colleges ADD CONSTRAINT colleges_status_check
    CHECK (status IN ('active', 'pending_review', 'inactive'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO colleges AS current_college (
  name, slug, description, location, address, website, affiliation,
  province, district, education_levels, facilities, status,
  verification_status, source_name, source_url, last_verified_at,
  programs_offered, is_featured
) VALUES
  ('Kathmandu Model College (KMC Bagbazar)', 'kathmandu-model-college', 'Overview: QAA-accredited by UGC and promoted by KMC as Best Campus of the Year 2080; strong central-city location, career/placement support, clubs, EMIS/LMS, entrepreneurship and industry links.

Good fit for: Good for students wanting a busy central-Kathmandu campus, TU degrees, management/IT/social-science options and active clubs.

Study and career context: College highlights industry partners, job fairs, career counselling and placement-related support.', 'Bagbazar, Kathmandu', 'Bagbazar, Kathmandu', 'https://kmcen.edu.np/', 'Tribhuvan University (TU)', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Computer labs','library','seminar/auditorium spaces','cafeteria','basketball court','innovation/entrepreneurship support','counselling','placement services.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://kmcen.edu.np/', '2026-09-03T00:00:00+05:45', 'BBA; BBM (Entrepreneurship); BCA; BBS; BA / BSW / Psychology; MBS; MA English', FALSE),
  ('St. Xavier''s College, Maitighar', 'st-xaviers-college-maitighar', 'Overview: Highly selective, Jesuit-run institution known for academic discipline, science culture, service orientation, labs, clubs and strong brand recognition.

Good fit for: Best for students comfortable with competitive selection, structured academics, science/research exposure and service-oriented campus culture.

Study and career context: Strong alumni reputation and academic progression; degree-level career outcomes depend on program.', 'Maitighar, Kathmandu', 'Maitighar, Kathmandu', 'https://sxc.edu.np/', 'TU, Kathmandu University, NEB and Cambridge pathways depending on program', 'Bagmati', 'Kathmandu', ARRAY['plus_two','bachelor','master']::TEXT[], ARRAY['Science','computer labs','project/field-work activities','clubs','seminars','exhibitions','social-service activities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://sxc.edu.np/', '2026-09-03T00:00:00+05:45', '+2 Science (NEB); GCE A Level; TU bachelor/master science and management programs (program availability should be read from current SXC portal)', FALSE),
  ('Uniglobe College', 'uniglobe-college', 'Overview: Management/finance-focused institution; states it was the first in Nepal to introduce MBA (Finance); has finance/communication labs and entrepreneurship/incubation support.

Good fit for: Suitable for students focused on management, finance, business and a PU semester-system environment in Baneshwor.

Study and career context: Emphasis on management skills, entrepreneurship, networking and industry/research links.', 'New Baneshwor, Kathmandu', 'New Baneshwor, Kathmandu', 'https://uniglobe.edu.np/', 'Pokhara University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Modern classrooms','library','finance','communication labs','incubation centre.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://uniglobe.edu.np/', '2026-09-03T00:00:00+05:45', 'BCSIT; BBA; BBA Finance; MBA; MBA Finance', FALSE),
  ('Islington College', 'islington-college', 'Overview: Large range of international IT/business degrees, AI/cybersecurity options, international exposure and ING network.

Good fit for: Good for students prioritising international degree structure, modern IT specialisations and project-based private-college environment.

Study and career context: International degree positioning plus alumni/industry network; verify current internship/placement metrics before showing percentages.', 'Kamal Pokhari, Kathmandu', 'Kamal Pokhari, Kathmandu', 'https://islington.edu.np/', 'International/UK degree pathways via London Metropolitan University (verify current awarding arrangement on course page before display)', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Purpose-built IT/business learning environment','student areas','international exposure','scholarship support are highlighted.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://islington.edu.np/', '2026-09-03T00:00:00+05:45', 'BSc (Hons) Computing; BSc (Hons) Computing with AI; BSc (Hons) Computer Networking & IT Security; BSc (Hons) Multimedia Technologies; BA (Hons) Business Administration tracks; BA (Hons) Accounting & Finance; MSc IT specialisations; MBA specialisations', FALSE),
  ('Herald College Kathmandu', 'herald-college-kathmandu', 'Overview: UK university degrees, international/exchange exposure, IT/business focus and ING ecosystem.

Good fit for: Good for students wanting UK-style computing/business programs with international exposure.

Study and career context: Career value is tied to UK-awarded programs, practical projects and ING/industry network.', 'Naxal, Kathmandu', 'Naxal, Kathmandu', 'https://heraldcollege.edu.np/', 'University of Wolverhampton, UK', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['IT learning spaces','student community','events','international exposure activities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://heraldcollege.edu.np/', '2026-09-03T00:00:00+05:45', 'BSc (Hons) Computer Science; BSc (Hons) Cybersecurity; BSc (Hons) International Business Management; International MBA', FALSE),
  ('The British College', 'the-british-college', 'Overview: UK university awards, BAC accreditation claimed by the college, central Thapathali location and industry/employability links.

Good fit for: For students seeking a British-degree pathway in Nepal, especially computing, AI/cybersecurity and business.

Study and career context: College highlights internships, Industry Advisory Board links and employability development.', 'Thapathali, Kathmandu', 'Thapathali, Kathmandu', 'https://www.thebritishcollege.edu.np/', 'University of the West of England (UWE Bristol) and Leeds Beckett University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Urban business-centre campus with computing/business learning spaces','international mobility links.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.thebritishcollege.edu.np/', '2026-09-03T00:00:00+05:45', 'BBA (Hons) Business and Management; BSc (Hons) Computing; BSc (Hons) Cyber Security and Digital Forensics; BSc (Hons) Computer Science - AI; MBA; Executive/Weekend MBA; MSc IT', FALSE),
  ('King''s College Nepal', 'kings-college-nepal', 'Overview: Entrepreneurial mindset, “Community as Curriculum,” community-based learning and US-affiliated programs.

Good fit for: Strong fit for entrepreneurship-minded students wanting business/IT with project/community exposure.

Study and career context: Focus on entrepreneurial capability, applied projects and network-building.', 'Kathmandu (check current campus address on Contact page)', 'Kathmandu (check current campus address on Contact page)', 'https://www.kingscollege.edu.np/', 'Westcliff University, USA; programs stated as approved by Nepal Ministry of Education', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Collaborative learning','community projects','clubs','entrepreneurial ecosystem.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.kingscollege.edu.np/', '2026-09-03T00:00:00+05:45', 'BBA; BSIT; BSCS; MBA; MSAI', FALSE),
  ('Thames International College', 'thames-international-college', 'Overview: Multidisciplinary college combining business, social sciences and IT; offers additional future-ready/digital/entrepreneurship programs.

Good fit for: Useful for students who want flexible social-science + management + IT combinations and broader liberal campus life.

Study and career context: Career readiness through supplemental programs and applied learning.', 'Old Baneshwor / Kathmandu (verify current contact page)', 'Old Baneshwor / Kathmandu (verify current contact page)', 'https://thamescollege.edu.np/', 'Tribhuvan University programs', 'Bagmati', 'Kathmandu', '{}'::TEXT[], ARRAY['Academic advising','clubs','co-curricular learning','supplemental digital/entrepreneurship modules.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://thamescollege.edu.np/', '2026-09-03T00:00:00+05:45', 'Business Administration/Management pathways; Computer Application; Information Technology Management; Psychology; Social Work; Sociology and other TU humanities/management programs', FALSE),
  ('Prime College', 'prime-college', 'Overview: Strong IT-management mix, clear program/entrance information, scholarships and central Kathmandu access.

Good fit for: Good for TU-focused students comparing CSIT/BCA with management programs in one campus.

Study and career context: Practical IT/management orientation; validate placement claims before publishing metrics.', 'Khusibun, Nayabazar, Kathmandu', 'Khusibun, Nayabazar, Kathmandu', 'https://prime.edu.np/', 'Tribhuvan University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['IT labs','learning spaces','clubs','student activities','current site offers detailed program navigation.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://prime.edu.np/', '2026-09-03T00:00:00+05:45', 'BSc CSIT; BCA; BBA; BITM; BBM; BBS; MBS', FALSE),
  ('Softwarica College of IT & E-Commerce', 'softwarica-college', 'Overview: Tech-only positioning, AI/cybersecurity emphasis, industry partners and hands-on computing focus.

Good fit for: Strong fit for students who want an IT-specialist private college and modern computing specialisations.

Study and career context: College advertises strong placement and industry links; treat numerical placement rates as claims requiring periodic verification.', 'Kathmandu (verify exact current address from Contact page)', 'Kathmandu (verify exact current address from Contact page)', 'https://softwarica.edu.np/', 'International partner degree model (verify current awarding university on each course page)', 'Bagmati', 'Kathmandu', ARRAY['bachelor']::TEXT[], ARRAY['Computing labs','project environments','industry-linked activities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://softwarica.edu.np/', '2026-09-03T00:00:00+05:45', 'BSc (Hons) Computer Science with Artificial Intelligence; BSc (Hons) Ethical Hacking and Cybersecurity; Other current computing/IT programmes listed on official Courses page', FALSE),
  ('Deerwalk Institute of Technology (DWIT)', 'deerwalk-institute-of-technology', 'Overview: IT-focused environment, small-class positioning, paid internship opportunities at Deerwalk, workshops, incubation and IT community programs.

Good fit for: Best for students prioritising software/IT culture, internships and tech-community exposure over a broad multi-faculty campus.

Study and career context: Paid internships, job fair and close linkage to Deerwalk technology ecosystem are highlighted.', 'Sifal, Kathmandu', 'Sifal, Kathmandu', 'https://deerwalk.edu.np/dwit/', 'Tribhuvan University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','diploma']::TEXT[], ARRAY['IT labs','clubs','incubation centre','workshops','rural teaching program','student projects.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://deerwalk.edu.np/dwit/', '2026-09-03T00:00:00+05:45', 'BSc CSIT; BCA; Diploma in Data Analytics; DWIT credit courses', FALSE),
  ('Presidential Graduate School', 'presidential-graduate-school', 'Overview: Wide portfolio of US-affiliated business/technology degrees, including AI, software engineering and cybersecurity.

Good fit for: For students wanting an American-style degree pathway with many specialisations in business and technology.

Study and career context: Career/skill-development services and job-placement support are explicitly promoted.', 'Thapagaun, New Baneshwor, Kathmandu', 'Thapagaun, New Baneshwor, Kathmandu', 'https://presidential.edu.np/', 'Westcliff University, USA', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Skill lab','writing center','Toastmasters','guest speakers','workshops','job placement cell','international internship support.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://presidential.edu.np/', '2026-09-03T00:00:00+05:45', 'BSIT; BBA; MBA; MSIT; MBA in IT; MBA in Data Analytics; MBA in Finance & Economics; BS Cybersecurity; BS Software Engineering; BS Artificial Intelligence', FALSE),
  ('Apex College', 'apex-college', 'Overview: Management + BCSIT mix, practical/observation-based learning, student clubs and exchange opportunities; part of ING/Kantipur-linked ecosystem.

Good fit for: Good for students comparing PU management and BCSIT programs with an active student-life environment.

Study and career context: Hands-on learning and career opportunities through partner networks are emphasised.', 'Mid-Baneshwor, Kathmandu', 'Mid-Baneshwor, Kathmandu', 'https://apexcollege.edu.np/', 'Pokhara University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Student clubs','centres/labs','events','exchange activities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://apexcollege.edu.np/', '2026-09-03T00:00:00+05:45', 'BBA; BBA Finance; BCSIT; MBA; BBA Travel & Tourism (when offered)', FALSE),
  ('Ace Institute of Management', 'ace-institute-of-management', 'Overview: Long-running specialist management institution; historically known for MBA/Executive MBA and practice-oriented management education.

Good fit for: Best for management-focused students who value business-school identity and professional learning culture.

Study and career context: Strong management alumni ecosystem; surface verified employer/internship data only when sourced.', 'New Baneshwor, Kathmandu', 'New Baneshwor, Kathmandu', 'https://ace.edu.np/', 'Pokhara University', 'Bagmati', 'Kathmandu', ARRAY['bachelor']::TEXT[], ARRAY['Management learning environment','alumni network','professional activities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://ace.edu.np/', '2026-09-03T00:00:00+05:45', 'BBA and graduate management programs; verify exact 2026 portfolio on ace.edu.np before ingest', FALSE),
  ('KIST College', 'kist-college', 'Overview: Large alumni base, long operating history, broad +2-to-master ladder and both IT/management/science tracks.

Good fit for: Useful for students wanting one institution with +2, bachelor and master options and broad extracurricular life.

Study and career context: Academic counselling, career orientation and alumni network are emphasized.', 'Kathmandu (verify exact contact location)', 'Kathmandu (verify exact contact location)', 'https://kist.edu.np/', 'TU for bachelor/master programs; NEB for +2', 'Bagmati', 'Kathmandu', ARRAY['plus_two','bachelor','master']::TEXT[], ARRAY['Transportation','cafeteria','accommodation support','digital library','playground','e-learning resources.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://kist.edu.np/', '2026-09-03T00:00:00+05:45', '+2 Science; +2 Management; BBA; BITM; BIT; BBS; BSc Microbiology; MBS; MSc Microbiology; MIT', FALSE),
  ('National College of Computer Studies (NCCS)', 'nccs', 'Overview: Established IT/management college with broad TU tech-management portfolio and strong brand recognition in computer studies.

Good fit for: Good for students seeking TU IT/management programs in a college with long IT-focused history.

Study and career context: IT/management orientation and alumni outcomes; verify current placement/internship details.', 'Kathmandu', 'Kathmandu', 'https://www.nccs.edu.np/', 'Tribhuvan University', 'Bagmati', 'Kathmandu', ARRAY['bachelor']::TEXT[], ARRAY['Computer/academic facilities','student activities','practical learning environment.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.nccs.edu.np/', '2026-09-03T00:00:00+05:45', 'BITM; BHM; BSc CSIT; BBM; BCA', FALSE),
  ('Kathmandu College of Management (KCM)', 'kathmandu-college-of-management', 'Overview: International Siam University degree, long management-school history, new data science/IT portfolio, global partnerships and articulation/exchange pathways.

Good fit for: Good for students wanting international BBA/IT/data science in Lalitpur with a polished private-college environment.

Study and career context: Strong alumni network and practical, career-oriented curriculum; avoid ranking/placement claims without current evidence.', 'Gwarko, Lalitpur', 'Gwarko, Lalitpur', 'https://www.kcm.edu.np/', 'Siam University, Thailand', 'Bagmati', 'Lalitpur', ARRAY['bachelor']::TEXT[], ARRAY['Professional learning spaces','global partnership activities','real-world learning.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.kcm.edu.np/', '2026-09-03T00:00:00+05:45', 'BBA; BSc Information Technology; BSc Computer and Data Science', FALSE),
  ('Global College of Management (GCM)', 'global-college-of-management', 'Overview: Large management-focused community, strong extracurricular/student-led activities, transport coverage and purpose-built management environment.

Good fit for: Ideal mainly for students seeking +2 Management and a highly active management-focused campus culture.

Study and career context: Leadership and management skill-building begins early; higher-ed outcomes depend on next program.', 'Mid-Baneshwor, Kathmandu', 'Mid-Baneshwor, Kathmandu', 'https://www.globalcollege.edu.np/', 'Primarily NEB management + institutional pathways; verify current higher-level offerings separately', 'Bagmati', 'Kathmandu', ARRAY['plus_two']::TEXT[], ARRAY['Smart classrooms','computer lab','library/e-library','transport','cafeteria','research centre','digital resource point.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.globalcollege.edu.np/', '2026-09-03T00:00:00+05:45', 'Management-focused secondary/higher-secondary programs; website ecosystem also links management learning pathways', FALSE),
  ('Trinity International College', 'trinity-international-college', 'Overview: Well-known +2 and undergraduate brand with active clubs, competitions and broad campus life.

Good fit for: Good for students wanting a large, activity-rich college environment in Kathmandu.

Study and career context: Academic progression and soft-skill development through student activities.', 'Kathmandu', 'Kathmandu', 'https://www.trinity.edu.np/', 'NEB and TU-linked programs (verify by specific course)', 'Bagmati', 'Kathmandu', ARRAY['plus_two','bachelor']::TEXT[], ARRAY['Labs','library','clubs','competitions','events.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.trinity.edu.np/', '2026-09-03T00:00:00+05:45', '+2 and bachelor programs; exact current list should be fetched from Academic Programs section', FALSE),
  ('GoldenGate International College', 'goldengate-international-college', 'Overview: Very broad bachelor/master portfolio across management, science, humanities and hotel management.

Good fit for: Good for students who want many TU programs under one institutional group.

Study and career context: Program-dependent; strong breadth but users should compare department-specific faculty/labs before deciding.', 'Battisputali / Old Baneshwor, Kathmandu', 'Battisputali / Old Baneshwor, Kathmandu', 'https://college.goldengateintl.com/', 'Tribhuvan University; NEB for +2', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Academic blocks','labs','broad student activities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://college.goldengateintl.com/', '2026-09-03T00:00:00+05:45', 'BBS; BHM; BA/BSW; MBS; MA English; MA Economics; MSc Physics; MSc Microbiology; MSc Environmental Science and other TU programs', FALSE),
  ('Xavier International College', 'xavier-international-college', 'Overview: Science + management + social work + IT mix, long-running TU affiliation and Boudha location.

Good fit for: Good for students in east/northeast Kathmandu seeking TU programs across multiple streams.

Study and career context: Program-dependent; compare internship and department strength by course.', 'Boudha, Tushal, Kathmandu', 'Boudha, Tushal, Kathmandu', 'https://xaviercollege.edu.np/', 'Tribhuvan University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Labs','research activities','events','general campus infrastructure.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://xaviercollege.edu.np/', '2026-09-03T00:00:00+05:45', 'BCA; BBM; BSc Environmental Science; BSc Microbiology; BSW; BBS; MBS', FALSE),
  ('National College', 'national-college', 'Overview: Highly specialised social-science/development college; official site positions it as unique in Development Studies/Finance and pure Psychology.

Good fit for: Excellent for students interested in development, public policy, IR, psychology and social research rather than mainstream BBA/IT.

Study and career context: Pathways into development sector, NGOs/INGOs, policy, research, finance/development institutions and postgraduate study.', 'Kathmandu', 'Kathmandu', 'https://www.nationalcollege.edu.np/', 'Kathmandu University for current specialised programs (verify by program)', 'Bagmati', 'Kathmandu', '{}'::TEXT[], ARRAY['Research-oriented academic environment','exchange links','specialised faculty.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.nationalcollege.edu.np/', '2026-09-03T00:00:00+05:45', 'Development Studies; Development Finance; Social Sciences; International Relations; Psychology (KU)', FALSE),
  ('Kathmandu BernHardt College', 'kathmandu-bernhardt-college', 'Overview: QAA-accredited private college, broad TU portfolio, sizable campus infrastructure and western-Kathmandu location.

Good fit for: Good for students around Kalanki/Bafal side seeking TU CSIT/BCA/management/social science.

Study and career context: Career support and placements are promoted; verify exact placement metrics before display.', 'Bafal, Ring Road, Kathmandu', 'Bafal, Ring Road, Kathmandu', 'https://kbc.edu.np/', 'Tribhuvan University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Labs','classrooms','seminar hall','library','rooftop cafeteria','elevators','playground','parking.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://kbc.edu.np/', '2026-09-03T00:00:00+05:45', 'BSc CSIT; BCA; BBM; BBS; BA Psychology / Social Work; MBS', FALSE),
  ('Texas International College', 'texas-international-college', 'Overview: IT/management/social-science mix, AI & robotics lab positioning, career services, hostel/coaching and active hackathon/research events.

Good fit for: Good for students near Chabahil seeking TU CSIT/BCA plus management and social science in one college.

Study and career context: Dedicated placement/career cell is promoted.', 'Mitrapark, Chabahil, Kathmandu', 'Mitrapark, Chabahil, Kathmandu', 'https://texasintl.edu.np/', 'Tribhuvan University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['AI & Robotics lab','computer labs','e-library','Wi-Fi','smart classrooms','career services','hostel/coaching','cafeteria.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://texasintl.edu.np/', '2026-09-03T00:00:00+05:45', 'BSc CSIT; BCA; BBM; BBS; BASW; MBS', FALSE),
  ('NAMI (Naaya Aayam Multi-Disciplinary Institute)', 'nami-college', 'Overview: Multidisciplinary mix of computing, environment and business with international-style delivery.

Good fit for: Good for students wanting a smaller international/private environment and computer/environment combinations.

Study and career context: Program-specific; computing and environmental science offer distinct career tracks.', 'Kathmandu (verify current campus address)', 'Kathmandu (verify current campus address)', 'https://www.nami.edu.np/', 'International/partner model; verify current awarding body on course page', 'Bagmati', 'Kathmandu', ARRAY['plus_two','bachelor','master']::TEXT[], ARRAY['Labs','multidisciplinary academic resources.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.nami.edu.np/', '2026-09-03T00:00:00+05:45', 'BSc Computer Science; BSc Environmental Science; BBA; MSc Computing; GCE A Level', FALSE),
  ('IIMS College', 'iims-college', 'Overview: Combines computing, business and hospitality honours degrees with specialisations such as AI, data science, cybersecurity and digital business.

Good fit for: Good for students who want international honours programs and modern specialisations rather than TU/PU structure.

Study and career context: Industry-oriented curricula in computing/business/hospitality; verify current internship partners.', 'Kathmandu', 'Kathmandu', 'https://iimscollege.edu.np/', 'International partner university model; verify current awarding university on each course page', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Modern private-college learning environment','student-life programming.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://iimscollege.edu.np/', '2026-09-03T00:00:00+05:45', 'Bachelor of Computer Science (Honours); Bachelors of Business (Honours); Bachelor of International Hospitality Management (Honours); MBA', FALSE),
  ('Sunway College Kathmandu', 'sunway-college-kathmandu', 'Overview: Strong AI/data positioning, BCU partnership, lecture-tutorial-workshop delivery and industry training.

Good fit for: Especially strong for students who want an AI-specialist international degree in Kathmandu.

Study and career context: Placement cell and industry skill sessions are highlighted.', 'Maitidevi, Kathmandu', 'Maitidevi, Kathmandu', 'https://sunway.edu.np/', 'Birmingham City University, UK', 'Bagmati', 'Kathmandu', ARRAY['bachelor']::TEXT[], ARRAY['IT labs','workshop-based learning','industry training support.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://sunway.edu.np/', '2026-09-03T00:00:00+05:45', 'BSc (Hons) Computer Science with Artificial Intelligence; BSc (Hons) Business Information Technology', FALSE),
  ('Kantipur City College (KCC)', 'kantipur-city-college', 'Overview: Very broad tech/engineering/management/media portfolio in central Kathmandu; project-based learning and research emphasized.

Good fit for: Good for students wanting multiple tech/management options in Putalisadak and comparing emerging AI/IT tracks.

Study and career context: Project and industry/community partnerships are highlighted.', 'Putalisadak, Kathmandu', 'Putalisadak, Kathmandu', 'https://kcc.edu.np/', 'University programs; verify each program affiliation before display (KCC runs engineering, IT, management and media programs)', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master','diploma']::TEXT[], ARRAY['Labs','research resources','project-based learning environment.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://kcc.edu.np/', '2026-09-03T00:00:00+05:45', 'BCA-IT; BBA; BE Civil; BE Computer; BIT; BTech AI; MCA-IT; MAMCJ; PGDCA', FALSE),
  ('Kathmandu Engineering College (KEC Kathmandu)', 'kathmandu-engineering-college', 'Overview: One of Kathmandu’s best-known IOE-affiliated private engineering colleges; large campus footprint, specialised labs and many technical clubs.

Good fit for: Strong for engineering students who want IOE curriculum but a private-college campus in central Kathmandu.

Study and career context: Technical clubs, projects and industry exposure; compare department-specific placements.', 'Kalimati, Kathmandu', 'Kalimati, Kathmandu', 'https://www.kecktm.edu.np/', 'Tribhuvan University, Institute of Engineering (IOE)', 'Bagmati', 'Kathmandu', ARRAY['bachelor']::TEXT[], ARRAY['Engineering labs','library','makerspace/robotics/IT clubs','multipurpose spaces','transport/parking support.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.kecktm.edu.np/', '2026-09-03T00:00:00+05:45', 'BE Civil; BE Computer; BE Electrical; BE Electronics, Communication & Information; B.Arch', FALSE),
  ('Kantipur Engineering College (KEC Dhapakhel)', 'kantipur-engineering-college', 'Overview: Long-running IOE-affiliated engineering campus in a quieter Lalitpur setting with engineering-focused environment.

Good fit for: Good for students prioritising engineering-only focus, IOE curriculum and Lalitpur location.

Study and career context: Project/lab-heavy engineering training; verify employer partnerships by department.', 'Dhapakhel, Lalitpur', 'Dhapakhel, Lalitpur', 'https://kec.edu.np/', 'Tribhuvan University, Institute of Engineering (IOE)', 'Bagmati', 'Lalitpur', ARRAY['bachelor']::TEXT[], ARRAY['Engineering labs','library','extracurricular/sports','student bodies.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://kec.edu.np/', '2026-09-03T00:00:00+05:45', 'BE Civil; BE Computer; BE Electronics, Communication & Information', FALSE),
  ('Advanced College of Engineering & Management (ACEM)', 'advanced-college-engineering-management', 'Overview: Engineering-industry collaboration, research/innovation, AI research activity, fellowships and dedicated placement support.

Good fit for: Strong fit for engineering students who value research, innovation, industry exposure and Kalanki location.

Study and career context: Placement cell and industry fellowships are prominently advertised; treat percentages as claims to verify.', 'Kalanki, Kathmandu', 'Kalanki, Kathmandu', 'https://www.acem.edu.np/', 'Tribhuvan University / IOE (engineering) and TU FoHSS (BCA)', 'Bagmati', 'Kathmandu', ARRAY['bachelor']::TEXT[], ARRAY['Engineering labs','research/innovation spaces','library','sports/culture activities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.acem.edu.np/', '2026-09-03T00:00:00+05:45', 'BE Civil; BE Computer; BE Electrical; BE Electronics, Communication & Information; BCA', FALSE),
  ('Himalaya College of Engineering (HCOE)', 'himalaya-college-of-engineering', 'Overview: Long-running TU-affiliated engineering college in Lalitpur with engineering/computing/architecture focus.

Good fit for: Good for Lalitpur-based students seeking IOE engineering in a private college.

Study and career context: Engineering project exposure; compare department-specific industry linkages.', 'Chyasal, Lalitpur', 'Chyasal, Lalitpur', 'https://hcoe.edu.np/', 'Tribhuvan University / IOE', 'Bagmati', 'Lalitpur', ARRAY['bachelor']::TEXT[], ARRAY['Engineering labs','academic spaces','project facilities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://hcoe.edu.np/', '2026-09-03T00:00:00+05:45', 'BE Civil; BE Computer; BE Electronics, Communication & Information; B.Arch (current IOE list; verify campus offering each intake)', FALSE),
  ('Sagarmatha Engineering College', 'sagarmatha-engineering-college', 'Overview: Engineering-only focus, TU/IOE affiliation and Sanepa location; promotes innovation and research.

Good fit for: Good for students wanting focused engineering programs in central Lalitpur.

Study and career context: Engineering career pathway with technical projects and exposure.', 'Sanepa, Lalitpur', 'Sanepa, Lalitpur', 'https://sagarmatha.edu.np/', 'Tribhuvan University / IOE', 'Bagmati', 'Lalitpur', ARRAY['bachelor']::TEXT[], ARRAY['Engineering labs','project','research activities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://sagarmatha.edu.np/', '2026-09-03T00:00:00+05:45', 'BE Computer; BE Civil; BE Electronics, Communication & Information', FALSE),
  ('Nepal College of Information Technology (NCIT)', 'ncit', 'Overview: One of the widest engineering/IT portfolios under Pokhara University, with morning/day shifts and large annual intake.

Good fit for: Very good for students comparing Computer vs IT vs Software Engineering and wanting PU rather than IOE.

Study and career context: Broad tech/engineering ecosystem and alumni network; verify current placement data.', 'Balkumari / Lalitpur area (verify current contact page)', 'Balkumari / Lalitpur area (verify current contact page)', 'https://ncit.edu.np/', 'Pokhara University', 'Bagmati', 'Lalitpur', ARRAY['bachelor','master']::TEXT[], ARRAY['Engineering/IT labs','clubs','competitions','research/conference activities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://ncit.edu.np/', '2026-09-03T00:00:00+05:45', 'BE Computer; BE IT; BE Software; BE Civil; BE Information & Communication Engineering; B.Arch; BCA; BBA; ME Computer; MSc Computer; MCIS', FALSE),
  ('Pulchowk Campus, IOE', 'pulchowk-campus', 'Overview: Central campus of IOE and Nepal’s most prestigious public engineering campus, with strongest breadth of engineering and postgraduate research.

Good fit for: Best for high-performing engineering aspirants seeking low public tuition, rigorous academics and strong peer/research environment.

Study and career context: Strongest engineering alumni and employer recognition in Nepal; outcomes still vary by discipline and student.', 'Pulchowk, Lalitpur', 'Pulchowk, Lalitpur', 'https://pcampus.edu.np/', 'Tribhuvan University, Institute of Engineering', 'Bagmati', 'Lalitpur', ARRAY['master','phd']::TEXT[], ARRAY['Extensive departments','labs','research centres','library','large engineering campus.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://pcampus.edu.np/', '2026-09-03T00:00:00+05:45', 'Civil; Architecture; Electrical; Electronics, Communication & Information; Mechanical; Computer; Aerospace; Chemical Engineering plus many MSc/PhD programs', FALSE),
  ('Thapathali Campus, IOE', 'thapathali-campus', 'Overview: Historic public engineering campus in central Kathmandu with strong mechanical/automobile/industrial legacy and modern digital infrastructure.

Good fit for: Great for engineering students wanting public tuition and central-city accessibility.

Study and career context: Strong TU/IOE credential and practical engineering environment.', 'Thapathali, Kathmandu', 'Thapathali, Kathmandu', 'https://tcioe.edu.np/', 'Tribhuvan University, Institute of Engineering', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Engineering labs','smart classrooms','campus-wide digital/EMIS services','clubs.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://tcioe.edu.np/', '2026-09-03T00:00:00+05:45', 'Industrial; Civil; Electronics/Communication; Mechanical; Architecture; Automobile and other current IOE bachelor programs; MSc programs also offered', FALSE),
  ('Shanker Dev Campus', 'shanker-dev-campus', 'Overview: One of Nepal’s most recognised public management campuses with large alumni base and central location.

Good fit for: Excellent for cost-conscious management students comfortable with a large public-campus environment.

Study and career context: Strong alumni network across banking, accounting, management and public/private sectors.', 'Ram Shah Path / Putalisadak, Kathmandu', 'Ram Shah Path / Putalisadak, Kathmandu', 'https://sdc.tu.edu.np/', 'Tribhuvan University, Faculty of Management', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Management departments','library','public-campus services','experience is more self-directed than premium private colleges.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://sdc.tu.edu.np/', '2026-09-03T00:00:00+05:45', 'BBS; BBA; BIM; BBM; BBA Finance; MBS; MBM; MBA Finance', FALSE),
  ('Nepal Commerce Campus (NCC Minbhawan)', 'nepal-commerce-campus', 'Overview: Large public management campus with strong commerce/management identity, very large active student and alumni population.

Good fit for: Good for students seeking affordable TU management education with large peer network.

Study and career context: Strong alumni reach across business, banking, government and accounting.', 'Minbhawan, Kathmandu', 'Minbhawan, Kathmandu', 'https://fsuncc.edu.np/', 'Tribhuvan University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Computer labs','digital resources','research spaces','general public-campus facilities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://fsuncc.edu.np/', '2026-09-03T00:00:00+05:45', 'Management and IT-management bachelor/master programs; fetch exact current list from Academics before publishing', FALSE),
  ('Patan Multiple Campus', 'patan-multiple-campus', 'Overview: Large multidisciplinary public campus with humanities, science, management and IT in a historic Patan location.

Good fit for: Excellent value for students who want broad TU options and public fees in Lalitpur.

Study and career context: Strong alumni/community base; career services vary by program.', 'Patan Dhoka, Lalitpur', 'Patan Dhoka, Lalitpur', 'https://pmc.tu.edu.np/', 'Tribhuvan University', 'Bagmati', 'Lalitpur', ARRAY['bachelor','master']::TEXT[], ARRAY['Departmental labs','libraries','public-campus grounds','self-sustaining IT/management programs.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://pmc.tu.edu.np/', '2026-09-03T00:00:00+05:45', 'BCA; BIT; BSc CSIT; BBA; BBS; BA; BSc general; MBS; MIT; MCA; MSc Physics; MSc Environmental Science and humanities masters', FALSE),
  ('Amrit Science Campus (ASCOL)', 'amrit-science-campus', 'Overview: Historic science-focused public campus with strong reputation in science, CSIT and technical peer culture.

Good fit for: Great for science/CSIT students wanting public tuition, central location and academically strong peer environment.

Study and career context: Strong alumni in science, technology, government and research; self-driven internships are important.', 'Thamel, Kathmandu', 'Thamel, Kathmandu', 'https://ac.tu.edu.np/', 'Tribhuvan University, Institute of Science and Technology', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Science labs','computer department','research resources','large science faculty structure.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://ac.tu.edu.np/', '2026-09-03T00:00:00+05:45', 'BSc General Science; BSc CSIT; BIT; MIT; MSc Physics; MSc Chemistry; MSc Botany; MSc Zoology and other science programs', FALSE),
  ('Tri-Chandra Multiple Campus', 'tri-chandra-campus', 'Overview: Nepal’s first national higher-education institution; unmatched historical identity and broad science/humanities portfolio in the city centre.

Good fit for: Best for students prioritising affordability, history and subject breadth rather than premium private-campus infrastructure.

Study and career context: Strong academic heritage; career support is more program/self-driven.', 'Ghantaghar, Kathmandu', 'Ghantaghar, Kathmandu', 'https://trc.tu.edu.np/', 'Tribhuvan University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master','diploma']::TEXT[], ARRAY['Science labs','departments','library','historic campus infrastructure (some facilities/buildings may be under reconstruction/upgrade).']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://trc.tu.edu.np/', '2026-09-03T00:00:00+05:45', 'BSc streams (Botany, Chemistry, Environmental Science, Geology, Mathematics, Meteorology, Microbiology, Physics, Statistics, Zoology); BA across many humanities/social-science subjects; MSc Chemistry/Engineering Geology/Microbiology; MA programs; PG Diploma in Counseling Psychology', FALSE),
  ('Padma Kanya Multiple Campus', 'padma-kanya-campus', 'Overview: Nepal’s first women’s campus and a major women-focused public higher-education institution with wide program breadth.

Good fit for: Excellent for women wanting affordable TU education in central Kathmandu across IT, management, science and humanities.

Study and career context: Growing placement/research support plus large alumni base; outcomes vary by program.', 'Bagbazaar, Kathmandu', 'Bagbazaar, Kathmandu', 'https://pkmc.tu.edu.np/', 'Tribhuvan University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Departmental labs','library','placement cell','research management cell','public-campus services.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://pkmc.tu.edu.np/', '2026-09-03T00:00:00+05:45', 'BCA; BPA; BSc Microbiology; BSc CSIT; BIT; BBA; BBM; BBS; BHM; BA and many humanities/social-science masters; MBS', FALSE),
  ('Kathmandu Medical College (KMC Medical)', 'kathmandu-medical-college', 'Overview: Large private medical college with teaching hospital, broad UG/PG/superspecialty programs and Kathmandu Valley clinical exposure.

Good fit for: For students who want medical/dental/nursing training in Kathmandu and can handle highly competitive, intensive clinical education.

Study and career context: Direct professional pathway subject to council licensing; postgraduate/specialty options available.', 'Kathmandu (Duwakot/Sinamangal teaching sites; verify current campus-by-program)', 'Kathmandu (Duwakot/Sinamangal teaching sites; verify current campus-by-program)', 'https://kmc.edu.np/', 'Kathmandu University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Teaching hospital','clinical departments','labs','dental','nursing facilities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://kmc.edu.np/', '2026-09-03T00:00:00+05:45', 'MBBS; BDS; BSc Nursing; BNS; MSc Nursing; MD/MS; MDS; DM/MCh programs', FALSE),
  ('Nepal Medical College', 'nepal-medical-college', 'Overview: Established Kathmandu medical campus with teaching hospital, broad specialty services, labs, hostels and long clinical training history.

Good fit for: Strong for medicine/dentistry/nursing students who prefer a quieter northeast Kathmandu campus with on-site hospital exposure.

Study and career context: Professional healthcare pathway with undergraduate through superspecialty training.', 'Attarkhel, Gokarneshwor-8, Kathmandu', 'Attarkhel, Gokarneshwor-8, Kathmandu', 'https://www.nmcth.edu/', 'Kathmandu University', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Teaching hospital','medical/dental departments','labs','imaging','library','male/female hostels.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.nmcth.edu/', '2026-09-03T00:00:00+05:45', 'MBBS; BDS; BSc Nursing; Lab Medicine / Medical Imaging undergraduate programs; MD/MS; MDS; DM/MCh', FALSE),
  ('Maharajgunj Medical Campus (IOM)', 'maharajgunj-medical-campus', 'Overview: Flagship public medical campus of IOM, closely linked with Tribhuvan University Teaching Hospital and advanced specialty training.

Good fit for: Top choice for high-merit medical students seeking public tuition, major teaching-hospital exposure and strong research/specialty environment.

Study and career context: Exceptional clinical exposure and strong national professional reputation.', 'Maharajgunj, Kathmandu', 'Maharajgunj, Kathmandu', 'https://mmciom.edu.np/', 'Tribhuvan University, Institute of Medicine', 'Bagmati', 'Kathmandu', ARRAY['bachelor','master']::TEXT[], ARRAY['Major teaching hospital ecosystem','labs','departments','postgraduate/superspecialty facilities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://mmciom.edu.np/', '2026-09-03T00:00:00+05:45', 'MBBS; BDS; BASLP; B Optom; B Perfusion Technology and many MD/MS/MDS/allied health programs', FALSE),
  ('Chitwan Medical College (CMC)', 'chitwan-medical-college', 'Overview: Large integrated medical college and teaching hospital with 8 bachelor programs, broad postgraduate/superspecialty portfolio and strong clinical exposure in Chitwan.

Good fit for: Excellent for students open to studying outside Kathmandu who want a large hospital-based health sciences campus.

Study and career context: Broad medical/nursing/public-health/allied-health pathways with strong hospital exposure.', 'Bharatpur, Chitwan', 'Bharatpur, Chitwan', 'https://cmc.edu.np/', 'Tribhuvan University / IOM', 'Bagmati', 'Chitwan', ARRAY['bachelor','master']::TEXT[], ARRAY['Teaching hospital','specialty services','research budget','hostels','library','clinical','diagnostic facilities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://cmc.edu.np/', '2026-09-03T00:00:00+05:45', 'MBBS; BDS; BSc Nursing; BNS; BPH; BPharm; BSc MIT; BSc MLT; MD/MS; MDS; MPH; DM/MCh and other health programs', FALSE),
  ('Gandaki Medical College', 'gandaki-medical-college', 'Overview: Pokhara-based medical college with broad medical, dental, nursing and allied-health portfolio plus teaching hospital/research centre.

Good fit for: Good for students wanting health-sciences training in Pokhara and a hospital-linked campus.

Study and career context: Professional healthcare pathway with PG options.', 'Pokhara / Lekhnath, Kaski', 'Pokhara / Lekhnath, Kaski', 'https://gmcthrc.edu.np/', 'Tribhuvan University, Institute of Medicine', 'Gandaki', 'Kaski', ARRAY['bachelor','master']::TEXT[], ARRAY['Teaching hospital','city hospital','dental college','labs','clinical departments.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://gmcthrc.edu.np/', '2026-09-03T00:00:00+05:45', 'MBBS; BDS; BSc Nursing; BNS; BSc MIT; BSc MLT; BPH; BPharm; MD/MS; MDS; MN/MSc Nursing; MPH and other PG programs', FALSE),
  ('Nobel Medical College Teaching Hospital', 'nobel-medical-college', 'Overview: Large eastern-Nepal medical college/teaching hospital with broad UG/PG programs and substantial clinical infrastructure.

Good fit for: Good for students from eastern Nepal or those wanting a large medical campus outside Kathmandu.

Study and career context: Professional clinical pathways from undergraduate to specialty training.', 'Biratnagar, Morang', 'Biratnagar, Morang', 'https://www.nobelmedicalcollege.com.np/', 'Kathmandu University', 'Koshi', 'Morang', ARRAY['bachelor','master']::TEXT[], ARRAY['Teaching hospital','specialty/superspecialty services','labs','clinical departments.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://www.nobelmedicalcollege.com.np/', '2026-09-03T00:00:00+05:45', 'MBBS; BDS; BSc Nursing; BNS; BPT; BMLT; MD/MS; DM and other PG/superspecialty programs', FALSE),
  ('B.P. Koirala Institute of Health Sciences (BPKIHS)', 'bpkihs', 'Overview: Major national centre for health-sciences education, research and tertiary care with community-oriented approach and broad advanced training.

Good fit for: Top option for high-merit health-sciences students willing to study in Dharan and wanting strong clinical/research exposure.

Study and career context: Strong national reputation in medicine, dentistry, nursing, research and specialty training.', 'Dharan, Sunsari', 'Dharan, Sunsari', 'https://bpkihs.edu/', 'Self-governing health sciences institution', 'Koshi', 'Sunsari', ARRAY['bachelor','master','phd']::TEXT[], ARRAY['Large hospital','specialty clinics','research','postgraduate','advanced-care facilities.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://bpkihs.edu/', '2026-09-03T00:00:00+05:45', 'MBBS; BDS; BSc Nursing; MD/MS; MSc; MDS; DM/MCh; PhD; fellowships', FALSE),
  ('Patan Academy of Health Sciences (PAHS)', 'patan-academy-health-sciences', 'Overview: Community-oriented medical education linked to Patan Hospital, with strong public-service and rural/community health ethos.

Good fit for: Excellent for students attracted to patient-centred, community-based medical education and public health service.

Study and career context: Medical, nursing, midwifery and public-health professional pathways with strong community health orientation.', 'Lagankhel, Lalitpur', 'Lagankhel, Lalitpur', 'https://web.pahs.edu.np/', 'Autonomous public academy', 'Bagmati', 'Lalitpur', ARRAY['bachelor','master','phd']::TEXT[], ARRAY['Patan Hospital clinical environment','nursing/midwifery/public-health schools','research committees','training.']::TEXT[], 'active', 'source_verified', 'Nepal College Research Pack (primary-source review)', 'https://web.pahs.edu.np/', '2026-09-03T00:00:00+05:45', 'MBBS; MD/MS; Fellowship; BSc Nursing; BNS; BMS; MN; MPH; PhD/training programs', FALSE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = COALESCE(current_college.description, EXCLUDED.description),
  location = EXCLUDED.location,
  address = COALESCE(current_college.address, EXCLUDED.address),
  website = COALESCE(current_college.website, EXCLUDED.website),
  affiliation = COALESCE(current_college.affiliation, EXCLUDED.affiliation),
  province = COALESCE(current_college.province, EXCLUDED.province),
  district = COALESCE(current_college.district, EXCLUDED.district),
  education_levels = CASE
    WHEN cardinality(current_college.education_levels) = 0 THEN EXCLUDED.education_levels
    ELSE current_college.education_levels
  END,
  facilities = CASE
    WHEN cardinality(current_college.facilities) = 0 THEN EXCLUDED.facilities
    ELSE current_college.facilities
  END,
  status = 'active',
  verification_status = CASE
    WHEN current_college.verification_status = 'institution_verified' THEN current_college.verification_status
    ELSE 'source_verified'
  END,
  source_name = COALESCE(current_college.source_name, EXCLUDED.source_name),
  source_url = COALESCE(current_college.source_url, EXCLUDED.source_url),
  last_verified_at = GREATEST(current_college.last_verified_at, EXCLUDED.last_verified_at),
  programs_offered = COALESCE(current_college.programs_offered, EXCLUDED.programs_offered),
  updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_colleges_status ON colleges(status);

COMMENT ON COLUMN colleges.programs_offered IS
  'Research summary of programs for discovery; confirm the current intake on the official institution website.';


