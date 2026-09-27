import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answer, detectLang } from '../lib/faq.js';

test('detects Hindi script and Hinglish', () => {
  assert.equal(detectLang('कार्ड कैसे बनेगा'), 'hi');
  assert.equal(detectLang('card kaise banega'), 'hi');
  assert.equal(detectLang('how do I get the card'), 'en');
});

test('answers the 70+ question in Hindi', () => {
  const a = answer('मेरी माँ 72 साल की हैं। क्या उनका इलाज मुफ़्त होगा?', 'hi');
  assert.equal(a.intent, 'seniors');
  assert.match(a.text, /70/);
});

test('hospital asking for money routes to the complaint answer', () => {
  assert.equal(answer('What if the hospital asks for money?', 'en').intent, 'hospitalAsksMoney');
  assert.equal(answer('अस्पताल पैसे माँगे तो क्या करें?', 'hi').intent, 'hospitalAsksMoney');
});

test('OPD and documents', () => {
  assert.equal(answer('Is OPD covered?', 'en').intent, 'opd');
  assert.equal(answer('कौन-से कागज़ चाहिए?', 'hi').intent, 'documents');
});

test('emergencies always win', () => {
  assert.equal(answer('my father had an accident, which hospital card?', 'en').intent, 'emergency');
});

test('unknown questions fall back to the helpline', () => {
  const a = answer('what is the weather in Delhi', 'en');
  assert.equal(a.intent, 'fallback');
  assert.match(a.text, /14555/);
});

test('detects Bengali script', () => {
  assert.equal(detectLang('কার্ড কীভাবে পাব'), 'bn');
});

test('answers in Bengali', () => {
  const a = answer('আমার মা 72 বছর বয়সী। তাঁর চিকিৎসা কি বিনামূল্যে হবে?', 'bn');
  assert.equal(a.intent, 'seniors');
  assert.match(a.text, /Vay Vandana/);
  assert.equal(answer('হাসপাতাল টাকা চাইলে কী করব?', 'bn').intent, 'hospitalAsksMoney');
  assert.match(answer('আবহাওয়া কেমন', 'bn').text, /14555/);
});
