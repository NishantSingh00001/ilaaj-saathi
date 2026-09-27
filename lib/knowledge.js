// Verified facts about Ayushman Bharat PM-JAY, used by the website, the offline
// answer engine and the AI agent. Every fact carries its source so the agent can
// cite it. Re-verify these before each release and bump LAST_VERIFIED.
//
// Ilaaj Saathi is an independent, open-source helper. It is not a government service.

export const LAST_VERIFIED = '2026-09-27';

export const HELPLINE = '14555';

export const LINKS = {
  beneficiary: 'https://beneficiary.nha.gov.in/',
  hospitals: 'https://hospitals.pmjay.gov.in/Search/empnlWorkFlow.htm?actionFlag=ViewRegisteredHosptlsMap',
  grievance: 'https://cgrms.pmjay.gov.in/',
  nha: 'https://nha.gov.in/PM-JAY',
  pmjay: 'https://pmjay.gov.in/',
};

export const SOURCES = {
  nha: { title: 'National Health Authority — About PM-JAY', url: 'https://nha.gov.in/PM-JAY' },
  cabinet70: {
    title: 'Cabinet approves health coverage to all senior citizens aged 70+ (PMO, 11 Sep 2024)',
    url: 'https://www.pmindia.gov.in/en/news_updates/cabinet-approves-health-coverage-to-all-senior-citizens-of-the-age-70-years-and-above-irrespective-of-income-under-ayushman-bharat-pradhan-mantri-jan-arogya-yojana-ab-pm-jay/',
  },
  pib2024: {
    title: 'PIB — PM-JAY progress note (Nov 2024)',
    url: 'https://www.pib.gov.in/PressNoteDetails.aspx?NoteId=153425&ModuleId=3&reg=3&lang=1',
  },
  dd8yrs: {
    title: 'DD India — Ayushman Bharat PM-JAY marks 8 years (23 Sep 2026)',
    url: 'https://ddindia.co.in/2026/09/ayushman-bharat-pm-jay-marks-8-years-covers-over-48-5-crore-people/',
  },
  exclusions: {
    title: 'Business Standard — Treatments not covered under Ayushman Bharat (Apr 2025)',
    url: 'https://www.business-standard.com/health/ayushman-bharat-key-health-conditions-excluded-5-lakh-insurance-125041400330_1.html',
  },
  nha2223: {
    title: 'PIB — National Health Accounts Estimates 2022-23 (27 May 2026)',
    url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2265816&lang=1&reg=3',
  },
  awareness: {
    title: 'Parisi et al., Awareness of PM-JAY: a cross-sectional study across six states, Health Policy and Planning (2023)',
    url: 'https://academic.oup.com/heapol/article/38/3/289/6881114',
  },
};

// Headline numbers shown on the site. Keep the source next to each one.
export const STATS = {
  peopleEntitled: { value: '55 crore+', source: 'pib2024' },
  cardsCreated: { value: '48.5 crore', source: 'dd8yrs' },
  hospitals: { value: '38,000+', source: 'dd8yrs' },
  procedures: { value: '1,961', source: 'dd8yrs' },
  admissions: { value: '13.25 crore', source: 'dd8yrs' },
  seniorsEntitled: { value: '6 crore', source: 'cabinet70' },
  seniorCards: { value: '1.36 crore', source: 'dd8yrs', asOf: '2026-09-21' },
  oopShare: { value: '43.4%', source: 'nha2223', note: 'out-of-pocket share of total health expenditure, 2022-23' },
  unaware: { value: '38%', source: 'awareness', note: 'of eligible households had not heard of PM-JAY (6 states, 2019-20)' },
};

// Topic-wise facts. The AI agent reads these through the get_scheme_facts tool,
// so keep them short, plain and self-contained.
export const FACTS = {
  coverage: {
    en: [
      'Cover of up to ₹5 lakh per family per year for secondary and tertiary care hospitalisation.',
      'Treatment is cashless at empanelled hospitals: covered treatment should cost the family nothing.',
      'Covers up to 3 days of pre-hospitalisation and 15 days of post-hospitalisation expenses such as tests and medicines.',
      'Includes consultation, medicines, tests, implants, room, food, ICU care and treatment of complications.',
      'There is no limit on family size, age or gender.',
      'All pre-existing conditions are covered from day one.',
      'The card works at any empanelled hospital anywhere in India (38,000+ hospitals, 1,961 procedures across 27 specialties).',
    ],
    hi: [
      'हर परिवार को हर साल ₹5 लाख तक का इलाज, अस्पताल में भर्ती होने पर।',
      'सूचीबद्ध अस्पतालों में इलाज कैशलेस है: कवर वाले इलाज के लिए परिवार को कुछ नहीं देना होता।',
      'भर्ती से 3 दिन पहले और छुट्टी के 15 दिन बाद तक की जाँच और दवाइयाँ भी शामिल हैं।',
      'डॉक्टर की सलाह, दवाइयाँ, जाँच, इम्प्लांट, कमरा, खाना, ICU और इलाज की जटिलताएँ शामिल हैं।',
      'परिवार के आकार, उम्र या लिंग की कोई सीमा नहीं है।',
      'पुरानी बीमारियाँ पहले दिन से कवर होती हैं।',
      'कार्ड पूरे भारत में किसी भी सूचीबद्ध अस्पताल में चलता है (38,000+ अस्पताल, 27 विभागों में 1,961 इलाज)।',
    ],
    sources: ['nha', 'pib2024', 'dd8yrs'],
  },
  exclusions: {
    en: [
      'PM-JAY is for hospital admission. Doctor visits without admission (OPD) are not covered.',
      'Cosmetic surgery, fertility treatment such as IVF, and routine dental work are among the exclusions.',
      'Only treatments on the scheme\'s package list are covered; the hospital\'s Ayushman Mitra desk can confirm.',
    ],
    hi: [
      'PM-JAY अस्पताल में भर्ती के लिए है। बिना भर्ती के डॉक्टर को दिखाना (OPD) शामिल नहीं है।',
      'कॉस्मेटिक सर्जरी, IVF जैसा बाँझपन का इलाज और दाँतों का आम इलाज शामिल नहीं हैं।',
      'सिर्फ़ योजना की सूची वाले इलाज कवर होते हैं; अस्पताल का आयुष्मान मित्र डेस्क पक्का बता सकता है।',
    ],
    sources: ['nha', 'exclusions'],
  },
  seniors: {
    en: [
      'Every citizen aged 70 or above is eligible, whatever their income (Ayushman Vay Vandana card).',
      'Age is checked from Aadhaar. No income test and no medical test.',
      'Seniors whose family is already under PM-JAY get an extra top-up of up to ₹5 lakh a year for themselves, not shared with younger members.',
      'Seniors under CGHS, ECHS or Ayushman CAPF must choose either their existing scheme or PM-JAY.',
      'Seniors with private health insurance or ESI can still get the card.',
      'About 6 crore seniors in 4.5 crore families are eligible; only 1.36 crore Vay Vandana cards had been made by 21 Sep 2026.',
    ],
    hi: [
      '70 साल या उससे ज़्यादा उम्र का हर नागरिक पात्र है, आमदनी चाहे जितनी हो (आयुष्मान वय वंदना कार्ड)।',
      'उम्र आधार से जाँची जाती है। न आमदनी की जाँच, न मेडिकल जाँच।',
      'अगर परिवार पहले से PM-JAY में है, तो 70+ सदस्य को अपने लिए ₹5 लाख सालाना का अलग टॉप-अप मिलता है, जो छोटे सदस्यों से नहीं बँटता।',
      'CGHS, ECHS या आयुष्मान CAPF वाले बुज़ुर्गों को अपनी पुरानी योजना या PM-JAY में से एक चुनना होगा।',
      'प्राइवेट हेल्थ इंश्योरेंस या ESI वाले बुज़ुर्ग भी कार्ड बनवा सकते हैं।',
      'लगभग 4.5 करोड़ परिवारों के 6 करोड़ बुज़ुर्ग पात्र हैं; 21 सितंबर 2026 तक सिर्फ़ 1.36 करोड़ वय वंदना कार्ड बने थे।',
    ],
    sources: ['cabinet70', 'dd8yrs'],
  },
  eligibility: {
    en: [
      'Families are on the list based on deprivation and occupation data (SECC 2011), later updated by states.',
      'Rural families qualify if they meet any of: one-room kutcha house (D1); no adult aged 16-59 (D2); female-headed household with no adult male aged 16-59 (D3); a disabled member and no able-bodied adult (D4); SC/ST household (D5); landless household earning mainly from manual casual labour (D7).',
      'Automatically included: households without shelter, destitute or living on alms, manual scavenger families, primitive tribal groups, legally released bonded labourers.',
      'Urban families qualify through 11 occupation groups, including ragpickers, beggars, domestic workers, street vendors and cobblers, construction workers, plumbers, masons, painters, welders, security guards, head-load workers, sweepers and sanitation workers, home-based workers and tailors, transport workers such as drivers and rickshaw pullers, shop workers and delivery assistants, electricians and mechanics, washermen and chowkidars.',
      'Since March 2024, families of ASHA workers, anganwadi workers and anganwadi helpers are covered.',
      'Many states run a combined state scheme that covers more families, often using ration card data. Call 14555 to check your state.',
      'Only the official list decides. Check with your Aadhaar or ration card at beneficiary.nha.gov.in, in the Ayushman app, or by calling 14555.',
    ],
    hi: [
      'परिवार सामाजिक-आर्थिक जनगणना (SECC 2011) के अभाव और पेशे के आधार पर सूची में हैं, जिसे बाद में राज्यों ने अपडेट किया।',
      'गाँव के परिवार पात्र हैं अगर इनमें से कोई बात लागू हो: एक कमरे का कच्चा घर (D1); 16-59 साल का कोई वयस्क नहीं (D2); महिला मुखिया वाला घर जिसमें 16-59 साल का कोई पुरुष नहीं (D3); कोई विकलांग सदस्य और कोई सक्षम वयस्क नहीं (D4); SC/ST परिवार (D5); भूमिहीन परिवार जो ज़्यादातर मज़दूरी से कमाता है (D7)।',
      'अपने आप शामिल: बेघर, बेसहारा या भीख पर निर्भर, हाथ से मैला उठाने वाले परिवार, आदिम जनजाति समूह, क़ानूनी रूप से छुड़ाए गए बंधुआ मज़दूर।',
      'शहर के परिवार 11 पेशों के आधार पर पात्र हैं, जैसे कचरा बीनने वाले, घरेलू कामगार, रेहड़ी-पटरी वाले, मोची, निर्माण मज़दूर, राजमिस्त्री, प्लंबर, पेंटर, वेल्डर, सुरक्षा गार्ड, कुली, सफ़ाई कर्मचारी, घर से काम करने वाले कारीगर और दर्ज़ी, ड्राइवर और रिक्शा चालक, दुकान कर्मचारी और डिलीवरी सहायक, इलेक्ट्रीशियन और मैकेनिक, धोबी और चौकीदार।',
      'मार्च 2024 से आशा कार्यकर्ता, आंगनवाड़ी कार्यकर्ता और आंगनवाड़ी सहायिका के परिवार भी शामिल हैं।',
      'कई राज्य अपनी मिली-जुली योजना चलाते हैं जिसमें ज़्यादा परिवार शामिल हैं, अक्सर राशन कार्ड के आधार पर। अपने राज्य के लिए 14555 पर पूछें।',
      'आख़िरी फ़ैसला सरकारी सूची से होता है। beneficiary.nha.gov.in पर, आयुष्मान ऐप में, या 14555 पर आधार या राशन कार्ड से जाँचें।',
    ],
    sources: ['nha'],
  },
  card: {
    en: [
      'Getting the card is free.',
      'Step 1: Open the Ayushman app or beneficiary.nha.gov.in and log in with a mobile number.',
      'Step 2: Search for your family by state and Aadhaar, ration card or family ID.',
      'Step 3: Complete Aadhaar e-KYC with an OTP or face authentication.',
      'Step 4: After approval, download the card. Show it (or Aadhaar) at the Ayushman Mitra desk of any empanelled hospital.',
      'Can\'t do it yourself? A Common Service Centre (CSC) or the Ayushman Mitra at an empanelled hospital can make it for you.',
      'Keep ready: Aadhaar card, a mobile phone for the OTP, and your ration card if you have one.',
    ],
    hi: [
      'कार्ड बनवाना मुफ़्त है।',
      'कदम 1: आयुष्मान ऐप या beneficiary.nha.gov.in खोलें और मोबाइल नंबर से लॉग इन करें।',
      'कदम 2: राज्य चुनकर आधार, राशन कार्ड या फ़ैमिली ID से अपना परिवार खोजें।',
      'कदम 3: आधार OTP या चेहरे से e-KYC पूरा करें।',
      'कदम 4: मंज़ूरी के बाद कार्ड डाउनलोड करें। किसी भी सूचीबद्ध अस्पताल के आयुष्मान मित्र डेस्क पर कार्ड (या आधार) दिखाएँ।',
      'ख़ुद नहीं कर पा रहे? नज़दीकी जन सेवा केंद्र (CSC) या सूचीबद्ध अस्पताल का आयुष्मान मित्र कार्ड बना सकता है।',
      'साथ रखें: आधार कार्ड, OTP के लिए मोबाइल फ़ोन, और राशन कार्ड अगर हो।',
    ],
    sources: ['nha', 'cabinet70'],
  },
  hospitals: {
    en: [
      'Find empanelled hospitals by state and district on the official hospital search: hospitals.pmjay.gov.in.',
      'The Ayushman app also lists nearby hospitals, and 14555 can tell you over the phone.',
      'Every empanelled hospital has an Ayushman Mitra help desk.',
    ],
    hi: [
      'सरकारी वेबसाइट hospitals.pmjay.gov.in पर राज्य और ज़िले से सूचीबद्ध अस्पताल खोजें।',
      'आयुष्मान ऐप में भी नज़दीकी अस्पताल दिखते हैं, और 14555 पर फ़ोन से भी पूछ सकते हैं।',
      'हर सूचीबद्ध अस्पताल में आयुष्मान मित्र हेल्प डेस्क होता है।',
    ],
    sources: ['nha'],
  },
  rights: {
    en: [
      'Covered treatment is cashless. An empanelled hospital should not ask you to pay for it.',
      'Nobody should charge you money to make the Ayushman card.',
      'Never share your Aadhaar OTP with a stranger or on a phone call you did not make.',
      'Complaints: call the free 24x7 helpline 14555, or file online at cgrms.pmjay.gov.in.',
    ],
    hi: [
      'कवर वाला इलाज कैशलेस है। सूचीबद्ध अस्पताल को इसके लिए आपसे पैसे नहीं माँगने चाहिए।',
      'आयुष्मान कार्ड बनाने के लिए किसी को पैसे न दें।',
      'अपना आधार OTP किसी अनजान व्यक्ति को या आए हुए फ़ोन कॉल पर कभी न बताएँ।',
      'शिकायत: मुफ़्त 24x7 हेल्पलाइन 14555 पर फ़ोन करें, या cgrms.pmjay.gov.in पर ऑनलाइन दर्ज करें।',
    ],
    sources: ['nha'],
  },
};

export const TOPICS = Object.keys(FACTS);

export function factsFor(topic, lang = 'en') {
  const t = FACTS[topic];
  if (!t) return null;
  return {
    topic,
    facts: t[lang === 'hi' ? 'hi' : 'en'],
    sources: t.sources.map((k) => SOURCES[k]),
    lastVerified: LAST_VERIFIED,
  };
}
