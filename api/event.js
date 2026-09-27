import { readJson, send } from '../lib/http.js';
import { EVENT_TYPES, storeConfig, pipeline, istDate } from '../lib/store.js';

// POST {type} — counts one anonymous event. Returns 204 even when storage is off.
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' }, { allow: 'POST' });
  const body = await readJson(req);
  const type = body && body.type;
  if (!EVENT_TYPES.includes(type)) return send(res, 400, { error: 'unknown event type' });
  const cfg = storeConfig();
  if (!cfg) return send(res, 204);
  const day = `day:${istDate()}:${type}`;
  try {
    await pipeline([['INCR', `total:${type}`], ['INCR', day], ['EXPIRE', day, 60 * 60 * 24 * 400]], cfg);
  } catch (e) {
    console.error('event store failed', e.message);
  }
  return send(res, 204);
}
