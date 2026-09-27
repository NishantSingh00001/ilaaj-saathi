import { send } from '../lib/http.js';
import { EVENT_TYPES, storeConfig, pipeline, lastDays } from '../lib/store.js';

const DAILY = ['visit', 'check_completed', 'chat', 'share', 'got_card'];

// GET — public, anonymous impact numbers for the /impact page.
export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'GET only' }, { allow: 'GET' });
  const cfg = storeConfig();
  if (!cfg) return send(res, 200, { configured: false });
  const days = lastDays(30);
  const dailyKeys = days.flatMap((d) => DAILY.map((t) => `day:${d}:${t}`));
  try {
    const [totals, daily] = await pipeline([
      ['MGET', ...EVENT_TYPES.map((t) => `total:${t}`)],
      ['MGET', ...dailyKeys],
    ], cfg);
    const tot = Object.fromEntries(EVENT_TYPES.map((t, i) => [t, Number(totals.result[i] || 0)]));
    const series = days.map((date, di) => {
      const row = { date };
      DAILY.forEach((t, ti) => { row[t] = Number(daily.result[di * DAILY.length + ti] || 0); });
      return row;
    });
    return send(res, 200, { configured: true, totals: tot, daily: series, updatedAt: new Date().toISOString() },
      { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' });
  } catch (e) {
    console.error('stats failed', e.message);
    return send(res, 502, { error: 'stats unavailable' });
  }
}
