// Rules engine for a first-pass PM-JAY eligibility check.
// It mirrors the published criteria (see lib/knowledge.js) but it can only say
// "likely": the official list is the final word. Shared by the browser and the API.

export const RURAL_CRITERIA = [
  { id: 'D1', en: 'We live in a one-room house with kutcha walls and roof', hi: 'हम एक कमरे के कच्चे घर में रहते हैं', bn: 'আমরা কাঁচা দেয়াল ও ছাদের এক ঘরের বাড়িতে থাকি' },
  { id: 'D2', en: 'No one in the family is aged 16 to 59', hi: 'परिवार में 16 से 59 साल का कोई नहीं है', bn: 'পরিবারে 16 থেকে 59 বছর বয়সী কেউ নেই' },
  { id: 'D3', en: 'A woman heads the family and there is no man aged 16 to 59', hi: 'घर की मुखिया महिला है और 16-59 साल का कोई पुरुष नहीं है', bn: 'পরিবারের প্রধান একজন মহিলা এবং 16-59 বছর বয়সী কোনো পুরুষ নেই' },
  { id: 'D4', en: 'A family member has a disability and no other adult can work', hi: 'परिवार में कोई विकलांग है और कोई दूसरा वयस्क काम नहीं कर सकता', bn: 'পরিবারে কেউ প্রতিবন্ধী এবং কাজ করতে পারেন এমন আর কোনো প্রাপ্তবয়স্ক নেই' },
  { id: 'D5', en: 'We are a Scheduled Caste or Scheduled Tribe family', hi: 'हम अनुसूचित जाति या अनुसूचित जनजाति परिवार हैं', bn: 'আমরা তফসিলি জাতি বা তফসিলি উপজাতি পরিবার' },
  { id: 'D7', en: 'We own no land and earn mostly from daily-wage labour', hi: 'हमारे पास ज़मीन नहीं है और कमाई ज़्यादातर मज़दूरी से होती है', bn: 'আমাদের জমি নেই এবং আয় মূলত দিনমজুরি থেকে' },
  { id: 'AUTO', en: 'Homeless, destitute, manual scavenger, primitive tribal group or freed bonded labourer', hi: 'बेघर, बेसहारा, हाथ से मैला उठाने वाले, आदिम जनजाति या छुड़ाए गए बंधुआ मज़दूर', bn: 'গৃহহীন, নিঃস্ব, হাতে মলমূত্র সাফাইয়ের কাজ, আদিম জনজাতি বা মুক্ত হওয়া বন্ধুয়া শ্রমিক' },
];

export const URBAN_OCCUPATIONS = [
  { id: 'ragpicker', en: 'Ragpicker', hi: 'कचरा बीनना', bn: 'আবর্জনা কুড়ানো' },
  { id: 'beggar', en: 'Lives on alms', hi: 'भीख पर निर्भर', bn: 'ভিক্ষার উপর নির্ভরশীল' },
  { id: 'domestic', en: 'Domestic worker', hi: 'घरेलू कामगार', bn: 'গৃহকর্মী' },
  { id: 'street', en: 'Street vendor, hawker or cobbler', hi: 'रेहड़ी-पटरी, फेरीवाला या मोची', bn: 'ফুটপাতের বিক্রেতা, ফেরিওয়ালা বা মুচি' },
  { id: 'construction', en: 'Construction, mason, plumber, painter, welder, guard or coolie', hi: 'निर्माण मज़दूर, राजमिस्त्री, प्लंबर, पेंटर, वेल्डर, गार्ड या कुली', bn: 'নির্মাণ শ্রমিক, রাজমিস্ত্রি, প্লাম্বার, রংমিস্ত্রি, ওয়েল্ডার, গার্ড বা কুলি' },
  { id: 'sanitation', en: 'Sweeper, sanitation worker or gardener', hi: 'सफ़ाई कर्मचारी या माली', bn: 'সাফাই কর্মী বা মালি' },
  { id: 'homebased', en: 'Home-based worker, artisan or tailor', hi: 'घर से काम, कारीगर या दर्ज़ी', bn: 'বাড়ি থেকে কাজ, কারিগর বা দর্জি' },
  { id: 'transport', en: 'Driver, conductor, cart or rickshaw puller', hi: 'ड्राइवर, कंडक्टर, ठेला या रिक्शा चालक', bn: 'ড্রাইভার, কন্ডাক্টর, ঠেলা বা রিকশা চালক' },
  { id: 'shop', en: 'Shop worker, peon, delivery helper or waiter', hi: 'दुकान कर्मचारी, चपरासी, डिलीवरी सहायक या वेटर', bn: 'দোকানকর্মী, পিয়ন, ডেলিভারি সহকারী বা ওয়েটার' },
  { id: 'repair', en: 'Electrician, mechanic or repair worker', hi: 'इलेक्ट्रीशियन, मैकेनिक या मरम्मत का काम', bn: 'ইলেকট্রিশিয়ান, মেকানিক বা মেরামতের কাজ' },
  { id: 'washer', en: 'Washerman or chowkidar', hi: 'धोबी या चौकीदार', bn: 'ধোপা বা চৌকিদার' },
  { id: 'other', en: 'Something else (salaried job, business, farming…)', hi: 'कुछ और (नौकरी, व्यापार, खेती…)', bn: 'অন্য কিছু (চাকরি, ব্যবসা, চাষ…)' },
];

const RANK = { unlikely: 0, check: 1, likely: 2, covered: 3 };

/**
 * @param {object} a answers
 * @param {'yes'|'no'|'unsure'} [a.hasCard]
 * @param {boolean} [a.senior70]        anyone aged 70+ in the family
 * @param {'yes'|'no'|'unsure'} [a.seniorGovtScheme]  senior is under CGHS / ECHS / CAPF
 * @param {'rural'|'urban'} [a.area]
 * @param {string[]} [a.rural]          ids from RURAL_CRITERIA
 * @param {string} [a.urban]            id from URBAN_OCCUPATIONS
 * @param {boolean} [a.frontline]       an ASHA / anganwadi worker / helper in the family
 * @param {'aay'|'phh'|'other'|'none'} [a.ration]
 */
export function assess(a = {}) {
  const reasons = [];
  let family = 'unlikely';
  const bump = (s) => { if (RANK[s] > RANK[family]) family = s; };

  if (a.hasCard === 'yes') { reasons.push('hasCard'); bump('covered'); }

  const rural = Array.isArray(a.rural) ? a.rural.filter((id) => RURAL_CRITERIA.some((c) => c.id === id)) : [];
  if (a.area === 'rural' && rural.length) {
    reasons.push(rural.includes('AUTO') ? 'autoInclusion' : 'ruralDeprivation');
    bump('likely');
  }
  if (a.area === 'urban' && a.urban && a.urban !== 'other' && URBAN_OCCUPATIONS.some((o) => o.id === a.urban)) {
    reasons.push('urbanOccupation');
    bump('likely');
  }
  if (a.frontline) { reasons.push('frontline'); bump('likely'); }
  if (a.ration === 'aay' || a.ration === 'phh') { reasons.push('rationCard'); bump('check'); }
  if (a.hasCard === 'unsure' && family === 'unlikely') { reasons.push('unsureCard'); bump('check'); }

  let senior = null;
  if (a.senior70) {
    if (a.seniorGovtScheme === 'yes') senior = { status: 'choose', reason: 'seniorMustChoose' };
    else senior = {
      status: 'covered',
      reason: RANK[family] >= RANK.likely ? 'seniorTopUp' : 'vayVandana',
    };
  }

  // Overall headline: the best news we can honestly give.
  let headline = family;
  if (senior && senior.status === 'covered' && RANK[headline] < RANK.covered) headline = 'seniorCovered';

  const steps = [];
  if (family === 'covered') steps.push('useCard', 'findHospital');
  else if (family === 'unlikely' && !senior) steps.push('callHelpline', 'stateScheme');
  else steps.push('verify', 'makeCard', 'findHospital');
  if (senior && senior.status === 'covered' && family === 'covered') steps.splice(1, 0, 'makeSeniorCard');
  if (senior && senior.status === 'choose') steps.push('chooseScheme');
  if (!steps.includes('callHelpline')) steps.push('callHelpline');

  return {
    headline,          // covered | seniorCovered | likely | check | unlikely
    family,            // covered | likely | check | unlikely
    senior,            // null | { status: covered|choose, reason }
    reasons,           // ids, see i18n "reason.*"
    steps,             // ids, see i18n "step.*"
    documents: ['aadhaar', 'mobile', 'ration'],
  };
}

// Plain-language summary for sharing on WhatsApp or for the agent.
export function summarize(result, t) {
  const lines = [t(`headline.${result.headline}`)];
  if (result.senior) lines.push(t(`reason.${result.senior.reason}`));
  result.reasons.forEach((r) => lines.push('• ' + t(`reason.${r}`)));
  return lines.join('\n');
}
