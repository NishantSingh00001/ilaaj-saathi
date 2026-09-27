import { readJson, send, clientIp } from '../lib/http.js';
import { runAgent, validateMessages } from '../lib/agent.js';
import { answer as offlineAnswer } from '../lib/faq.js';
import { allow } from '../lib/ratelimit.js';

// POST {messages:[{role,content}], lang?:'hi'|'en'|'bn', context?:object}
// Returns {mode:'ai'|'offline', reply}
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' }, { allow: 'POST' });
  if (!allow(clientIp(req), { limit: 30, windowMs: 10 * 60 * 1000 })) {
    return send(res, 429, { error: 'Too many questions. Please wait a few minutes, or call 14555.' });
  }
  const body = await readJson(req);
  const problem = validateMessages(body && body.messages);
  if (problem) return send(res, 400, { error: problem });
  const lang = ['hi', 'en', 'bn'].includes(body.lang) ? body.lang : undefined;
  const context = body.context && typeof body.context === 'object' ? body.context : undefined;
  try {
    const out = await runAgent({ messages: body.messages, lang, context, env: process.env });
    return send(res, 200, { mode: out.mode, reply: out.reply });
  } catch (e) {
    console.error('agent failed', e.message);
    const q = body.messages[body.messages.length - 1].content;
    return send(res, 200, { mode: 'offline', reply: offlineAnswer(q, lang).text });
  }
}
