// Best-effort, in-memory rate limit per IP (per serverless instance).
const hits = new Map();

export function allow(key, { limit = 20, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= limit) { hits.set(key, list); return false; }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) for (const k of hits.keys()) { hits.delete(k); if (hits.size < 2500) break; }
  return true;
}
