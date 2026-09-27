// "Saathi", the AI helper. A small tool-using agent on the Anthropic Messages API.
// It must ground every scheme fact in get_scheme_facts, and it can run the same
// eligibility rules the website uses. With no API key it falls back to lib/faq.js.

import { assess } from './eligibility.js';
import { factsFor, TOPICS, HELPLINE } from './knowledge.js';
import { answer as offlineAnswer, detectLang } from './faq.js';

export const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_TOOL_ROUNDS = 4;

export const TOOLS = [
  {
    name: 'get_scheme_facts',
    description:
      'Returns verified, source-cited facts about Ayushman Bharat PM-JAY for one topic. ' +
      'Call it before stating any fact about the scheme. Topics: coverage (what is paid for), exclusions (what is not), ' +
      'seniors (70+ / Vay Vandana), eligibility (who is on the list), card (how to get the Ayushman card, documents), ' +
      'hospitals (finding empanelled hospitals), rights (cashless rights, complaints, helpline, scams).',
    input_schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', enum: TOPICS },
        lang: { type: 'string', enum: ['en', 'hi'], description: 'Language of the facts to return (use en when replying in Bengali).' },
      },
      required: ['topic'],
    },
  },
  {
    name: 'check_eligibility',
    description:
      'Runs the first-pass PM-JAY eligibility rules for a family. Pass only what the user actually told you; omit unknown fields. ' +
      'The result is an estimate ("likely"), never a guarantee.',
    input_schema: {
      type: 'object',
      properties: {
        hasCard: { type: 'string', enum: ['yes', 'no', 'unsure'] },
        senior70: { type: 'boolean', description: 'Anyone in the family aged 70 or above.' },
        seniorGovtScheme: { type: 'string', enum: ['yes', 'no', 'unsure'], description: 'The 70+ member is under CGHS, ECHS or CAPF.' },
        area: { type: 'string', enum: ['rural', 'urban'] },
        rural: { type: 'array', items: { type: 'string', enum: ['D1', 'D2', 'D3', 'D4', 'D5', 'D7', 'AUTO'] } },
        urban: {
          type: 'string',
          enum: ['ragpicker', 'beggar', 'domestic', 'street', 'construction', 'sanitation', 'homebased', 'transport', 'shop', 'repair', 'washer', 'other'],
        },
        frontline: { type: 'boolean', description: 'An ASHA, anganwadi worker or anganwadi helper in the family.' },
        ration: { type: 'string', enum: ['aay', 'phh', 'other', 'none'] },
      },
    },
  },
];

export function systemPrompt(lang, context) {
  const language = {
    hi: 'Hindi, in Devanagari script, using everyday words (for example "इलाज", "अस्पताल", "कार्ड")',
    bn: 'Bengali, in Bengali script, using everyday words (for example "চিকিৎসা", "হাসপাতাল", "কার্ড"); translate the English facts from the tools faithfully',
  }[lang] || 'simple English';
  const ctx = context && typeof context === 'object'
    ? `\n\nThe user already did the 2-minute check on this page. Their result (from the same rules as check_eligibility): ${JSON.stringify({ headline: context.headline, family: context.family, senior: context.senior, reasons: context.reasons })}.`
    : '';
  return `You are Saathi, the helper on Ilaaj Saathi, an independent open-source website (not a government service) that helps Indian families understand and use Ayushman Bharat PM-JAY, the scheme that pays for hospital treatment.

How to answer:
- Answer in ${language}. If the user writes in the other language, switch to theirs.
- Many users have little schooling or are helping an elderly parent. Use short sentences and plain words. Keep answers under 90 words. Use at most 3 lines starting with "• ". No headings, tables or markdown links; write websites as plain domains like beneficiary.nha.gov.in.
- Only state scheme facts that came from get_scheme_facts in this conversation. If the tools do not cover the question, say you are not sure and give the free helpline ${HELPLINE}.
- If the user describes their family, you may call check_eligibility with only what they said. Present the result as an estimate and tell them how to confirm: the Ayushman app, beneficiary.nha.gov.in, or ${HELPLINE}.
- End with one concrete next step when there is one.

Safety:
- Never ask for, repeat or store an Aadhaar number, OTP, bank details, phone number or full name. If the user shares one, tell them kindly not to share it here.
- Do not diagnose or give medical advice. If the message suggests an emergency (accident, chest pain, unconsciousness, trouble breathing, heavy bleeding), first tell them to call 108 or 112 now.
- Stay on topic: PM-JAY, the 70+ Vay Vandana card, getting the card, hospitals, rights and complaints. Politely decline anything else.${ctx}`;
}

// Remove Aadhaar-like and phone-like numbers before anything leaves the server.
export function redact(text) {
  return String(text)
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[number removed]')
    .replace(/(\+91[\s-]?)?\b[6-9]\d{9}\b/g, '[number removed]');
}

export function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return 'messages must be a non-empty array';
  if (messages.length > 12) return 'too many messages';
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return 'invalid role';
    if (typeof m.content !== 'string' || !m.content.trim()) return 'invalid content';
    if (m.content.length > 1200) return 'message too long';
  }
  if (messages[messages.length - 1].role !== 'user') return 'last message must be from the user';
  return null;
}

export function runTool(name, input = {}, lang = 'en') {
  if (name === 'get_scheme_facts') {
    const f = factsFor(input.topic, input.lang || lang);
    return f || { error: `Unknown topic. Use one of: ${TOPICS.join(', ')}` };
  }
  if (name === 'check_eligibility') return assess(input);
  return { error: 'Unknown tool' };
}

function textOf(content) {
  return (content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
}

/**
 * @returns {Promise<{mode:'ai'|'offline', reply:string, tools?:string[]}>}
 */
export async function runAgent({ messages, lang, context, env = {}, fetchImpl = fetch }) {
  const clean = messages.map((m) => ({ role: m.role, content: redact(m.content) }));
  const lastUser = clean[clean.length - 1].content;
  const replyLang = ['hi', 'en', 'bn'].includes(lang) ? lang : detectLang(lastUser);
  const key = env.ANTHROPIC_API_KEY;
  if (!key) return { mode: 'offline', reply: offlineAnswer(lastUser, replyLang).text };

  const convo = [...clean];
  const used = [];
  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const res = await fetchImpl(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: env.LLM_MODEL || DEFAULT_MODEL,
        max_tokens: 600,
        system: systemPrompt(replyLang, context),
        tools: TOOLS,
        messages: convo,
      }),
    });
    if (!res.ok) throw new Error(`LLM error ${res.status}`);
    const data = await res.json();
    if (data.stop_reason !== 'tool_use') {
      const reply = textOf(data.content);
      if (!reply) break;
      return { mode: 'ai', reply, tools: used };
    }
    convo.push({ role: 'assistant', content: data.content });
    const results = data.content
      .filter((b) => b.type === 'tool_use')
      .map((b) => {
        used.push(b.name);
        return { type: 'tool_result', tool_use_id: b.id, content: JSON.stringify(runTool(b.name, b.input, replyLang)) };
      });
    convo.push({ role: 'user', content: results });
  }
  return { mode: 'offline', reply: offlineAnswer(lastUser, replyLang).text };
}
