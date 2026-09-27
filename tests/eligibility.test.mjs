import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess, RURAL_CRITERIA, URBAN_OCCUPATIONS } from '../lib/eligibility.js';

test('existing card holder is covered', () => {
  const r = assess({ hasCard: 'yes' });
  assert.equal(r.headline, 'covered');
  assert.ok(r.steps.includes('useCard'));
});

test('any senior aged 70+ is covered regardless of anything else', () => {
  const r = assess({ hasCard: 'no', senior70: true, seniorGovtScheme: 'no', area: 'urban', urban: 'other', ration: 'none' });
  assert.equal(r.headline, 'seniorCovered');
  assert.equal(r.family, 'unlikely');
  assert.equal(r.senior.reason, 'vayVandana');
});

test('senior in an already-covered family gets the top-up', () => {
  const r = assess({ hasCard: 'yes', senior70: true, seniorGovtScheme: 'no' });
  assert.equal(r.headline, 'covered');
  assert.equal(r.senior.reason, 'seniorTopUp');
  assert.ok(r.steps.includes('makeSeniorCard'));
});

test('senior under CGHS must choose', () => {
  const r = assess({ senior70: true, seniorGovtScheme: 'yes', area: 'urban', urban: 'other' });
  assert.equal(r.senior.status, 'choose');
  assert.ok(r.steps.includes('chooseScheme'));
});

test('rural deprivation criteria make a family likely', () => {
  const r = assess({ hasCard: 'no', area: 'rural', rural: ['D5'] });
  assert.equal(r.headline, 'likely');
  assert.ok(r.reasons.includes('ruralDeprivation'));
});

test('automatic inclusion is reported', () => {
  const r = assess({ area: 'rural', rural: ['AUTO'] });
  assert.ok(r.reasons.includes('autoInclusion'));
});

test('urban listed occupation makes a family likely, "other" does not', () => {
  assert.equal(assess({ area: 'urban', urban: 'domestic' }).headline, 'likely');
  assert.equal(assess({ area: 'urban', urban: 'other', ration: 'none' }).headline, 'unlikely');
});

test('ASHA / anganwadi families are likely', () => {
  assert.equal(assess({ area: 'urban', urban: 'other', frontline: true }).headline, 'likely');
});

test('priority ration card alone means "check"', () => {
  const r = assess({ area: 'urban', urban: 'other', ration: 'phh' });
  assert.equal(r.headline, 'check');
  assert.ok(r.reasons.includes('rationCard'));
});

test('unknown ids are ignored, never crash', () => {
  const r = assess({ area: 'rural', rural: ['X9', null], urban: 'nope' });
  assert.equal(r.headline, 'unlikely');
  assert.ok(r.steps.includes('callHelpline'));
});

test('every result offers the helpline', () => {
  for (const a of [{}, { hasCard: 'yes' }, { senior70: true }, { area: 'rural', rural: ['D1'] }]) {
    assert.ok(assess(a).steps.includes('callHelpline'));
  }
});

test('every option has Hindi, English and Bengali labels', () => {
  for (const o of [...RURAL_CRITERIA, ...URBAN_OCCUPATIONS]) {
    assert.ok(o.hi && o.en && o.bn, o.id);
  }
});
