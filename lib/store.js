// Anonymous impact counters in Upstash Redis (REST). Works with either the
// UPSTASH_REDIS_REST_* or the Vercel KV_REST_API_* variable names.
// No personal data is ever stored: only "event name + day" counters.

export const EVENT_TYPES = [
  'visit', 'check_started', 'check_completed',
  'result_covered', 'result_seniorCovered', 'result_likely', 'result_check', 'result_unlikely',
  'senior_found', 'share', 'chat', 'voice', 'listen', 'got_card',
  'helpline_copy', 'portal_click', 'hospital_click', 'lang_en', 'lang_hi',
];

export function storeConfig(env = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

export async function pipeline(commands, cfg, fetchImpl = fetch) {
  const res = await fetchImpl(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { authorization: `Bearer ${cfg.token}`, 'content-type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`store error ${res.status}`);
  return res.json();
}

// Dates are counted in India time.
export function istDate(d = new Date()) {
  return new Date(d.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

export function lastDays(n, from = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(istDate(new Date(from.getTime() - i * 86400000)));
  return out;
}
