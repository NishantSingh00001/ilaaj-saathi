import { test } from 'node:test';
import assert from 'node:assert/strict';
import chat from '../api/chat.js';
import event from '../api/event.js';
import stats from '../api/stats.js';

function mockRes() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end(b) { this.body = b || ''; this.done = true; },
  };
}
const req = (method, body) => ({ method, body, headers: {}, socket: { remoteAddress: '127.0.0.1' } });

test('chat answers offline without a key', async () => {
  delete process.env.ANTHROPIC_API_KEY;
  const res = mockRes();
  await chat(req('POST', { messages: [{ role: 'user', content: 'कार्ड कैसे बनवाएँ?' }], lang: 'hi' }), res);
  assert.equal(res.statusCode, 200);
  const data = JSON.parse(res.body);
  assert.equal(data.mode, 'offline');
  assert.match(data.reply, /आयुष्मान/);
});

test('chat rejects bad input', async () => {
  const res = mockRes();
  await chat(req('POST', { messages: 'nope' }), res);
  assert.equal(res.statusCode, 400);
});

test('event accepts known types and is a no-op without storage', async () => {
  const ok = mockRes();
  await event(req('POST', { type: 'check_completed' }), ok);
  assert.equal(ok.statusCode, 204);
  const bad = mockRes();
  await event(req('POST', { type: 'drop table' }), bad);
  assert.equal(bad.statusCode, 400);
});

test('stats reports when storage is not configured', async () => {
  const res = mockRes();
  await stats(req('GET'), res);
  assert.deepEqual(JSON.parse(res.body), { configured: false });
});
