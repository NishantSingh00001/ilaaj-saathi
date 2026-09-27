import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runAgent, redact, validateMessages, runTool } from '../lib/agent.js';

test('redacts Aadhaar-like and phone numbers', () => {
  assert.equal(redact('my aadhaar is 1234 5678 9012'), 'my aadhaar is [number removed]');
  assert.equal(redact('call me on 9876543210'), 'call me on [number removed]');
  assert.equal(redact('helpline 14555'), 'helpline 14555');
});

test('validates message shape', () => {
  assert.equal(validateMessages([]), 'messages must be a non-empty array');
  assert.equal(validateMessages([{ role: 'assistant', content: 'hi' }]), 'last message must be from the user');
  assert.equal(validateMessages([{ role: 'user', content: 'x'.repeat(1201) }]), 'message too long');
  assert.equal(validateMessages([{ role: 'user', content: 'hello' }]), null);
});

test('tools return grounded facts and eligibility', () => {
  const f = runTool('get_scheme_facts', { topic: 'seniors' }, 'en');
  assert.ok(f.facts.length > 3);
  assert.ok(f.sources[0].url.startsWith('https://'));
  assert.equal(runTool('check_eligibility', { senior70: true }).headline, 'seniorCovered');
});

test('without an API key it answers offline', async () => {
  const out = await runAgent({ messages: [{ role: 'user', content: 'Is OPD covered?' }], lang: 'en', env: {} });
  assert.equal(out.mode, 'offline');
  assert.match(out.reply, /OPD/);
});

test('runs a tool loop and never sends raw Aadhaar numbers', async () => {
  const calls = [];
  const fake = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push(body);
    if (calls.length === 1) {
      return new Response(JSON.stringify({
        stop_reason: 'tool_use',
        content: [{ type: 'tool_use', id: 't1', name: 'get_scheme_facts', input: { topic: 'seniors' } }],
      }));
    }
    return new Response(JSON.stringify({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'Yes, she is covered.' }] }));
  };
  const out = await runAgent({
    messages: [{ role: 'user', content: 'My mother is 72, aadhaar 1234 5678 9012. Is she covered?' }],
    lang: 'en', env: { ANTHROPIC_API_KEY: 'test' }, fetchImpl: fake,
  });
  assert.equal(out.mode, 'ai');
  assert.equal(out.reply, 'Yes, she is covered.');
  assert.deepEqual(out.tools, ['get_scheme_facts']);
  assert.equal(calls.length, 2);
  assert.ok(!JSON.stringify(calls[0]).includes('1234 5678 9012'));
  const toolResult = calls[1].messages.at(-1).content[0];
  assert.equal(toolResult.type, 'tool_result');
  assert.match(toolResult.content, /70/);
});
