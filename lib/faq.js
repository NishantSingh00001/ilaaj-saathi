// Offline answer engine. Used when no AI key is configured, when the network is
// down, or as a safety net if the AI call fails. Matches Hindi, English and
// Hinglish keywords to short, verified answers.

import { HELPLINE } from './knowledge.js';

const INTENTS = [
  {
    id: 'emergency',
    priority: 10,
    keys: ['emergency', 'chest pain', 'heart attack', 'accident', 'unconscious', 'heavy bleeding', 'not breathing', 'saans nahi', 'behosh', 'ambulance', 'दुर्घटना', 'बेहोश', 'सांस नहीं', 'साँस नहीं', 'सीने में दर्द', 'एम्बुलेंस', 'इमरजेंसी', 'জরুরি', 'দুর্ঘটনা', 'অজ্ঞান', 'অ্যাম্বুলেন্স', 'বুকে ব্যথা', 'শ্বাস নিতে পারছে না'],
    en: 'If this is an emergency, call 108 for an ambulance or 112 right now. At an empanelled hospital, ask for the Ayushman Mitra desk and show the Ayushman card or Aadhaar.',
    hi: 'अगर यह इमरजेंसी है, तो अभी 108 (एम्बुलेंस) या 112 पर फ़ोन करें। सूचीबद्ध अस्पताल में आयुष्मान मित्र डेस्क पर आयुष्मान कार्ड या आधार दिखाएँ।',
    bn: 'জরুরি অবস্থা হলে এখনই 108 (অ্যাম্বুলেন্স) বা 112-এ ফোন করুন। তালিকাভুক্ত হাসপাতালে Ayushman Mitra ডেস্কে Ayushman কার্ড বা Aadhaar দেখান।',
  },
  {
    id: 'seniors',
    priority: 3,
    keys: ['70', 'senior', 'old', 'elderly', 'parent', 'mother', 'father', 'grandmother', 'grandfather', 'vay vandana', 'vaya', 'budhe', 'buzurg', 'maa', 'papa', 'dadi', 'nani', 'dada', 'nana', 'बुज़ुर्ग', 'बुजुर्ग', 'वय वंदना', 'माँ', 'मां', 'पिता', 'पापा', 'दादी', 'नानी', 'दादा', 'नाना', 'साल की', 'साल के', 'उम्र', 'বয়স্ক', 'বৃদ্ধ', 'আমার মা', 'মায়ের', 'আমার বাবা', 'বাবার', 'দাদু', 'ঠাকুমা', 'দিদিমা', 'বছর বয়সী', 'বছরের বেশি', 'বয় বন্দনা'],
    en: 'Everyone aged 70 or above is covered, whatever their income. They get up to ₹5 lakh a year of free hospital treatment through the Ayushman Vay Vandana card. If their family is already under PM-JAY, they get an extra ₹5 lakh just for themselves. Make the card with their Aadhaar in the Ayushman app, at beneficiary.nha.gov.in, or at a CSC. If they are under CGHS, ECHS or CAPF, they must choose one scheme.',
    hi: '70 साल या उससे ज़्यादा उम्र के हर व्यक्ति को, आमदनी चाहे जितनी हो, आयुष्मान वय वंदना कार्ड से हर साल ₹5 लाख तक का मुफ़्त इलाज मिलता है। अगर परिवार पहले से PM-JAY में है, तो उन्हें अपने लिए अलग से ₹5 लाख मिलते हैं। उनके आधार से आयुष्मान ऐप, beneficiary.nha.gov.in या जन सेवा केंद्र (CSC) पर कार्ड बनवाएँ। CGHS, ECHS या CAPF वालों को एक योजना चुननी होगी।',
    bn: '70 বছর বা তার বেশি বয়সী প্রত্যেকে, আয় যা-ই হোক, Ayushman Vay Vandana কার্ডে বছরে ₹5 লাখ পর্যন্ত বিনামূল্যে হাসপাতালের চিকিৎসা পান। পরিবার আগে থেকেই PM-JAY-তে থাকলে তাঁরা নিজের জন্য আলাদা ₹5 লাখ পান। তাঁদের Aadhaar দিয়ে Ayushman অ্যাপে, beneficiary.nha.gov.in-এ বা CSC-তে কার্ড করান। CGHS, ECHS বা CAPF-এ থাকলে একটি প্রকল্প বেছে নিতে হবে।',
  },
  {
    id: 'cghs',
    priority: 4,
    keys: ['cghs', 'echs', 'capf', 'pension', 'retired', 'government employee', 'सरकारी कर्मचारी', 'पेंशन', 'रिटायर', 'পেনশন', 'অবসর', 'সরকারি কর্মচারী'],
    en: 'Seniors aged 70+ who are under CGHS, ECHS or Ayushman CAPF have to choose: stay in their current scheme or switch to PM-JAY. They cannot use both.',
    hi: 'CGHS, ECHS या आयुष्मान CAPF वाले 70+ बुज़ुर्गों को चुनना होगा: अपनी मौजूदा योजना में रहें या PM-JAY लें। दोनों एक साथ नहीं चलतीं।',
    bn: 'CGHS, ECHS বা Ayushman CAPF-এ থাকা 70+ বয়সীদের বেছে নিতে হবে: পুরোনো প্রকল্পে থাকবেন, না PM-JAY নেবেন। দুটো একসাথে চলে না।',
  },
  {
    id: 'private',
    priority: 4,
    keys: ['private insurance', 'mediclaim', 'esi', 'esic', 'insurance', 'बीमा', 'इंश्योरेंस', 'मेडिक्लेम', 'বিমা', 'ইনস্যুরেন্স', 'মেডিক্লেম'],
    en: 'Having private health insurance or ESI does not stop a senior aged 70+ from getting the PM-JAY card. They can keep both.',
    hi: 'प्राइवेट हेल्थ इंश्योरेंस या ESI होने पर भी 70+ बुज़ुर्ग PM-JAY कार्ड बनवा सकते हैं। दोनों रख सकते हैं।',
    bn: 'প্রাইভেট স্বাস্থ্য বিমা বা ESI থাকলেও 70+ বয়সীরা PM-JAY কার্ড করাতে পারেন। দুটোই রাখা যায়।',
  },
  {
    id: 'documents',
    priority: 2,
    keys: ['document', 'documents', 'papers', 'kagaz', 'kaagaz', 'dastavez', 'need to bring', 'कागज़', 'कागज', 'दस्तावेज़', 'दस्तावेज', 'क्या चाहिए', 'क्या लेकर', 'কাগজ', 'নথি', 'ডকুমেন্ট', 'কী লাগবে', 'কী দরকার'],
    en: 'Keep ready: the Aadhaar card, a mobile phone for the OTP, and your ration card if you have one. No income certificate is needed for seniors aged 70+.',
    hi: 'साथ रखें: आधार कार्ड, OTP के लिए मोबाइल फ़ोन, और राशन कार्ड अगर हो। 70+ बुज़ुर्गों के लिए आय प्रमाण पत्र नहीं चाहिए।',
    bn: 'সঙ্গে রাখুন: Aadhaar কার্ড, OTP-র জন্য মোবাইল ফোন, আর রেশন কার্ড থাকলে সেটিও। 70+ বয়সীদের আয়ের সার্টিফিকেট লাগে না।',
  },
  {
    id: 'card',
    priority: 2,
    keys: ['card', 'apply', 'register', 'registration', 'banwana', 'banaye', 'download', 'ekyc', 'e-kyc', 'app', 'kaise', 'कार्ड', 'बनवा', 'बनाए', 'बनाएँ', 'बनाये', 'आवेदन', 'डाउनलोड', 'कैसे', 'ऐप', 'কার্ড', 'আবেদন', 'ডাউনলোড', 'কীভাবে', 'কিভাবে', 'অ্যাপ'],
    en: 'Open the Ayushman app or beneficiary.nha.gov.in, log in with a mobile number, find your family using Aadhaar or ration card, finish Aadhaar e-KYC, then download the card once approved. It is free. A CSC or the Ayushman Mitra desk at an empanelled hospital can also do it for you.',
    hi: 'आयुष्मान ऐप या beneficiary.nha.gov.in खोलें, मोबाइल नंबर से लॉग इन करें, आधार या राशन कार्ड से अपना परिवार खोजें, आधार e-KYC पूरा करें, और मंज़ूरी के बाद कार्ड डाउनलोड करें। यह मुफ़्त है। जन सेवा केंद्र (CSC) या सूचीबद्ध अस्पताल का आयुष्मान मित्र भी बना सकता है।',
    bn: 'Ayushman অ্যাপ বা beneficiary.nha.gov.in খুলুন, মোবাইল নম্বর দিয়ে লগইন করুন, Aadhaar বা রেশন কার্ড দিয়ে পরিবার খুঁজুন, Aadhaar e-KYC করুন, আর অনুমোদনের পরে কার্ড ডাউনলোড করুন। এটি বিনামূল্যে। CSC বা তালিকাভুক্ত হাসপাতালের Ayushman Mitra-ও করে দিতে পারেন।',
  },
  {
    id: 'cost',
    priority: 3,
    keys: ['fee', 'charge', 'paisa', 'paise', 'cost', 'price', 'free', 'muft', 'फ़ीस', 'फीस', 'पैसे', 'मुफ़्त', 'मुफ्त', 'खर्च', 'कितना', 'খরচ', 'ফি', 'বিনামূল্যে', 'কত টাকা', 'টাকা লাগবে'],
    en: 'Making the card is free, and covered treatment at an empanelled hospital is cashless up to ₹5 lakh per family per year. If anyone asks you for money, call 14555.',
    hi: 'कार्ड बनवाना मुफ़्त है, और सूचीबद्ध अस्पताल में कवर वाला इलाज हर परिवार के लिए हर साल ₹5 लाख तक कैशलेस है। कोई पैसे माँगे तो 14555 पर फ़ोन करें।',
    bn: 'কার্ড করানো বিনামূল্যে, আর তালিকাভুক্ত হাসপাতালে কভার হওয়া চিকিৎসা প্রতি পরিবার প্রতি বছর ₹5 লাখ পর্যন্ত ক্যাশলেস। কেউ টাকা চাইলে 14555-এ ফোন করুন।',
  },
  {
    id: 'hospitalAsksMoney',
    priority: 5,
    keys: ['asking money', 'asked for money', 'asks for money', 'ask for money', 'money', 'charged', 'bill', 'demanding', 'refuse', 'refused', 'deposit', 'paise maang', 'paisa maang', 'पैसे माँग', 'पैसे मांग', 'मना कर', 'जमा करने', 'शिकायत', 'complaint', 'grievance', 'টাকা চাইছে', 'টাকা চাইলে', 'টাকা চায়', 'অভিযোগ'],
    en: 'Covered treatment at an empanelled hospital is cashless, so the hospital should not ask you to pay for it. Ask for the Ayushman Mitra desk first. If the problem continues, call the free 24x7 helpline 14555 or file a complaint at cgrms.pmjay.gov.in.',
    hi: 'सूचीबद्ध अस्पताल में कवर वाला इलाज कैशलेस है, इसलिए अस्पताल को पैसे नहीं माँगने चाहिए। पहले आयुष्मान मित्र डेस्क पर बात करें। फिर भी दिक़्क़त हो तो मुफ़्त 24x7 हेल्पलाइन 14555 पर फ़ोन करें या cgrms.pmjay.gov.in पर शिकायत दर्ज करें।',
    bn: 'তালিকাভুক্ত হাসপাতালে কভার হওয়া চিকিৎসা ক্যাশলেস, তাই হাসপাতালের টাকা চাওয়া উচিত নয়। আগে Ayushman Mitra ডেস্কে কথা বলুন। তাতেও সমস্যা থাকলে বিনামূল্যের 24x7 হেল্পলাইন 14555-এ ফোন করুন বা cgrms.pmjay.gov.in-এ অভিযোগ জানান।',
  },
  {
    id: 'hospitals',
    priority: 2,
    keys: ['hospital', 'hospitals', 'near me', 'nearby', 'list', 'aspatal', 'अस्पताल', 'हॉस्पिटल', 'पास में', 'नज़दीक', 'नजदीक', 'सूची', 'হাসপাতাল', 'কাছের', 'তালিকা'],
    en: 'Search empanelled hospitals by state and district at hospitals.pmjay.gov.in, or in the Ayushman app. There are 38,000+ across India. Every one has an Ayushman Mitra help desk.',
    hi: 'hospitals.pmjay.gov.in पर या आयुष्मान ऐप में राज्य और ज़िले से सूचीबद्ध अस्पताल खोजें। पूरे भारत में 38,000 से ज़्यादा हैं। हर एक में आयुष्मान मित्र हेल्प डेस्क होता है।',
    bn: 'hospitals.pmjay.gov.in-এ বা Ayushman অ্যাপে রাজ্য ও জেলা দিয়ে তালিকাভুক্ত হাসপাতাল খুঁজুন। সারা ভারতে 38,000-এর বেশি আছে। প্রতিটিতে Ayushman Mitra হেল্প ডেস্ক থাকে।',
  },
  {
    id: 'opd',
    priority: 4,
    keys: ['opd', 'checkup', 'check-up', 'consultation', 'doctor visit', 'without admission', 'बिना भर्ती', 'ओपीडी', 'दिखाना', 'ওপিডি', 'ভর্তি ছাড়া'],
    en: 'PM-JAY pays for treatment when you are admitted to hospital. OPD visits without admission are not covered. Tests and medicines from 3 days before admission and 15 days after discharge are covered.',
    hi: 'PM-JAY अस्पताल में भर्ती होने पर इलाज का ख़र्च देता है। बिना भर्ती के OPD में दिखाना शामिल नहीं है। भर्ती से 3 दिन पहले और छुट्टी के 15 दिन बाद तक की जाँच और दवाइयाँ शामिल हैं।',
    bn: 'PM-JAY হাসপাতালে ভর্তি হলে চিকিৎসার খরচ দেয়। ভর্তি ছাড়া OPD-তে দেখানো কভার নয়। ভর্তির 3 দিন আগে আর ছুটির 15 দিন পর পর্যন্ত পরীক্ষা ও ওষুধ কভার।',
  },
  {
    id: 'coverage',
    priority: 1,
    keys: ['cover', 'covered', 'coverage', 'benefit', 'what do i get', 'treatment', 'surgery', 'operation', 'cancer', 'dialysis', 'kya milta', 'ilaaj', 'इलाज', 'क्या मिलता', 'फ़ायदा', 'फायदा', 'ऑपरेशन', 'कैंसर', 'डायलिसिस', 'बीमारी', 'চিকিৎসা', 'কী পাওয়া যায়', 'অপারেশন', 'ক্যানসার', 'ডায়ালিসিস', 'রোগ', 'সুবিধা'],
    en: 'Up to ₹5 lakh per family per year for hospital treatment, cashless, at 38,000+ empanelled hospitals. It covers 1,961 procedures, including surgery, cancer care and dialysis, plus medicines, tests, room, food and ICU. Pre-existing conditions are covered from day one, and there is no limit on family size or age.',
    hi: 'हर परिवार को हर साल ₹5 लाख तक का कैशलेस इलाज, 38,000+ सूचीबद्ध अस्पतालों में। इसमें ऑपरेशन, कैंसर और डायलिसिस समेत 1,961 इलाज, और दवाइयाँ, जाँच, कमरा, खाना और ICU शामिल हैं। पुरानी बीमारियाँ पहले दिन से कवर हैं, और परिवार के आकार या उम्र की कोई सीमा नहीं है।',
    bn: 'প্রতি পরিবার প্রতি বছর ₹5 লাখ পর্যন্ত ক্যাশলেস চিকিৎসা, 38,000+ তালিকাভুক্ত হাসপাতালে। অপারেশন, ক্যানসার ও ডায়ালিসিস সহ 1,961 চিকিৎসা, আর ওষুধ, পরীক্ষা, ঘর, খাবার ও ICU কভার। পুরোনো রোগ প্রথম দিন থেকেই কভার, পরিবারের আকার বা বয়সের কোনো সীমা নেই।',
  },
  {
    id: 'eligibility',
    priority: 1,
    keys: ['eligible', 'eligibility', 'qualify', 'am i', 'patra', 'paatra', 'milega', 'पात्र', 'पात्रता', 'मिलेगा', 'हक़दार', 'हकदार', 'योग्य', 'যোগ্য', 'যোগ্যতা', 'পাব কি', 'পাবো', 'অধিকারী'],
    en: 'Families are covered based on deprivation and occupation criteria, families of ASHA and anganwadi workers are covered, and everyone aged 70+ is covered. Try the 2-minute check on this page, then confirm with Aadhaar at beneficiary.nha.gov.in or by calling 14555.',
    hi: 'अभाव और पेशे के आधार पर चुने गए परिवार, आशा और आंगनवाड़ी कार्यकर्ताओं के परिवार, और 70+ उम्र के सभी लोग शामिल हैं। इस पेज पर 2 मिनट की जाँच करें, फिर beneficiary.nha.gov.in पर आधार से या 14555 पर फ़ोन करके पक्का करें।',
    bn: 'অভাব ও পেশার ভিত্তিতে বাছা পরিবার, ASHA ও অঙ্গনওয়াড়ি কর্মীদের পরিবার, আর 70+ বয়সী সবাই কভার। এই পেজে 2 মিনিটের চেক করুন, তারপর beneficiary.nha.gov.in-এ Aadhaar দিয়ে বা 14555-এ ফোন করে নিশ্চিত হোন।',
  },
  {
    id: 'portability',
    priority: 3,
    keys: ['another state', 'other state', 'different state', 'migrant', 'portable', 'दूसरे राज्य', 'बाहर', 'प्रवासी', 'অন্য রাজ্যে', 'বাইরে', 'পরিযায়ী'],
    en: 'The card works at empanelled hospitals in any state, so migrant workers can use it wherever they are.',
    hi: 'कार्ड किसी भी राज्य के सूचीबद्ध अस्पताल में चलता है, इसलिए बाहर काम करने वाले लोग भी जहाँ हैं वहीं इलाज करवा सकते हैं।',
    bn: 'কার্ড যে কোনো রাজ্যের তালিকাভুক্ত হাসপাতালে চলে, তাই বাইরে কাজ করা মানুষও যেখানে আছেন সেখানেই চিকিৎসা করাতে পারেন।',
  },
  {
    id: 'privacy',
    priority: 4,
    keys: ['otp', 'aadhaar number', 'fraud', 'scam', 'call came', 'धोखा', 'फ़्रॉड', 'फ्रॉड', 'ओटीपी', 'প্রতারণা', 'জালিয়াতি', 'ওটিপি'],
    en: 'Never share your Aadhaar OTP with a stranger or on a call you did not make. Ilaaj Saathi never asks for your Aadhaar number or OTP. Use OTPs only inside the official Ayushman app or portal.',
    hi: 'अपना आधार OTP किसी अनजान व्यक्ति को या आए हुए कॉल पर कभी न बताएँ। इलाज साथी कभी आपका आधार नंबर या OTP नहीं माँगता। OTP सिर्फ़ सरकारी आयुष्मान ऐप या पोर्टल में डालें।',
    bn: 'নিজের Aadhaar OTP কখনো অচেনা কাউকে বা আসা ফোন কলে বলবেন না। Ilaaj Saathi কখনো আপনার Aadhaar নম্বর বা OTP চায় না। OTP শুধু সরকারি Ayushman অ্যাপ বা পোর্টালে দিন।',
  },
  {
    id: 'helpline',
    priority: 2,
    keys: ['helpline', 'phone', 'call', 'number', 'contact', 'हेल्पलाइन', 'फ़ोन', 'फोन', 'नंबर', 'संपर्क', 'হেল্পলাইন', 'ফোন', 'নম্বর', 'যোগাযোগ'],
    en: 'Call the free national helpline 14555. It works 24x7 and can check your eligibility and help with complaints.',
    hi: 'मुफ़्त राष्ट्रीय हेल्पलाइन 14555 पर फ़ोन करें। यह 24x7 चलती है और पात्रता जाँचने व शिकायत में मदद करती है।',
    bn: 'বিনামূল্যের জাতীয় হেল্পলাইন 14555-এ ফোন করুন। এটি 24x7 চালু, যোগ্যতা যাচাই ও অভিযোগে সাহায্য করে।',
  },
  {
    id: 'greeting',
    priority: 0,
    keys: ['hello', 'hi', 'namaste', 'namaskar', 'hey', 'नमस्ते', 'नमस्कार', 'हेलो', 'নমস্কার', 'হ্যালো'],
    en: 'Namaste! Ask me anything about free treatment under Ayushman Bharat PM-JAY: who is covered, how to make the card, what treatment is free, or what to do if a hospital asks for money.',
    hi: 'नमस्ते! आयुष्मान भारत PM-JAY के मुफ़्त इलाज के बारे में कुछ भी पूछिए: कौन पात्र है, कार्ड कैसे बनेगा, कौन-सा इलाज मुफ़्त है, या अस्पताल पैसे माँगे तो क्या करें।',
    bn: 'নমস্কার! Ayushman Bharat PM-JAY-এর বিনামূল্যের চিকিৎসা নিয়ে যা খুশি জিজ্ঞেস করুন: কারা পাবেন, কার্ড কীভাবে করাবেন, কোন চিকিৎসা বিনামূল্যে, বা হাসপাতাল টাকা চাইলে কী করবেন।',
  },
];

const FALLBACK = {
  en: `I'm not sure about that one. For a sure answer, call the free helpline ${HELPLINE} (24x7). You can also ask me who is covered, how to make the card, or what treatment is free.`,
  hi: `इस बारे में मुझे पक्का नहीं पता। पक्की जानकारी के लिए मुफ़्त हेल्पलाइन ${HELPLINE} (24x7) पर फ़ोन करें। आप मुझसे पूछ सकते हैं कि कौन पात्र है, कार्ड कैसे बनेगा, या कौन-सा इलाज मुफ़्त है।`,
  bn: `এ বিষয়ে আমি নিশ্চিত নই। নিশ্চিত তথ্যের জন্য বিনামূল্যের হেল্পলাইন ${HELPLINE} (24x7)-এ ফোন করুন। আমাকে জিজ্ঞেস করতে পারেন কারা পাবেন, কার্ড কীভাবে করাবেন, বা কোন চিকিৎসা বিনামূল্যে।`,
};

const DEVANAGARI = /[ऀ-ॿ]/;

const BENGALI = /[\u0980-\u09FF]/;

export function detectLang(text, fallback = 'en') {
  if (BENGALI.test(text)) return 'bn';
  if (DEVANAGARI.test(text)) return 'hi';
  if (/\b(kya|kaise|mera|meri|mere|hai|hain|milega|kitna|chahiye|nahi|aur|ke liye)\b/i.test(text)) return 'hi';
  return fallback;
}

function score(intent, text) {
  let s = 0;
  for (const k of intent.keys) {
    const key = k.toLowerCase();
    if (/^[a-z0-9 \-]+$/.test(key)) {
      const re = new RegExp(`(^|[^a-z0-9])${key.replace(/[-]/g, '\\-')}($|[^a-z0-9])`, 'i');
      if (re.test(text)) s += key.length > 3 ? 2 : 1;
    } else if (text.includes(key)) {
      s += 2;
    }
  }
  return s ? s + intent.priority * 0.5 : 0;
}

export function answer(question, lang) {
  const text = String(question || '').toLowerCase().trim();
  const l = lang || detectLang(text);
  if (!text) return { intent: 'empty', text: FALLBACK[l] || FALLBACK.en };
  let best = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const s = score(intent, text);
    if (s > bestScore) { best = intent; bestScore = s; }
  }
  // Emergencies always win if any emergency keyword matched.
  const emergency = INTENTS[0];
  if (score(emergency, text) > 0) best = emergency;
  if (!best) return { intent: 'fallback', text: FALLBACK[l] || FALLBACK.en };
  return { intent: best.id, text: best[l] || best.en };
}
