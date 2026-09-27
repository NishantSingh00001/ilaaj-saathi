import { t, setLang, getLang } from './i18n.js';
import { assess, summarize, RURAL_CRITERIA, URBAN_OCCUPATIONS } from '../../lib/eligibility.js';
import { answer as offlineAnswer, detectLang } from '../../lib/faq.js';
import { LINKS, HELPLINE } from '../../lib/knowledge.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

/* ------------------------------------------------------------------ events */
// Anonymous counters only: an event name, nothing about the person.
const sentOnce = new Set();
function track(type, { once = false } = {}) {
  if (once) { if (sentOnce.has(type)) return; sentOnce.add(type); }
  const body = JSON.stringify({ type });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }));
    else fetch('/api/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch { /* offline or preview */ }
}

/* ---------------------------------------------------------------- language */
const speechCode = (l) => ({ hi: 'hi-IN', bn: 'bn-IN' }[l] || 'en-IN');
function initialLang() {
  if (location.hash === '#en') return 'en';
  if (location.hash === '#hi') return 'hi';
  if (location.hash === '#bn') return 'bn';
  const saved = store.get('saathi-lang');
  return ['hi', 'en', 'bn'].includes(saved) ? saved : 'hi';
}

function applyI18n() {
  const lang = getLang();
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  $('#langToggle').setAttribute('aria-label', t('lang.switch'));
  $$('.stat-num').forEach((el) => { el.textContent = formatStat(el, Number(el.dataset.count)); });
  checker.render(false);
  chat.onLangChange();
}

$('#langToggle').addEventListener('click', () => {
  const order = ['hi', 'en', 'bn'];
  setLang(order[(order.indexOf(getLang()) + 1) % order.length]);
  store.set('saathi-lang', getLang());
  applyI18n();
  track('lang_' + getLang());
});

/* ------------------------------------------------------------------ stats */
function formatStat(el, v) {
  const dec = Number(el.dataset.decimals || 0);
  const key = { hi: 'suffixHi', en: 'suffixEn', bn: 'suffixBn' }[getLang()];
  const suffix = el.dataset[key] ?? el.dataset.suffixEn ?? '';
  return v.toFixed(dec) + suffix;
}
function countUp(el, dur = 1400) {
  const target = Number(el.dataset.count);
  if (reduced) { el.textContent = formatStat(el, target); return; }
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = formatStat(el, target * eased);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ------------------------------------------------------------- hero card */
const inr = (n) => Math.round(n).toLocaleString('en-IN');
function heroCard() {
  const card = $('#coverCard');
  const amount = $('#ccAmount');
  if (!reduced) {
    amount.textContent = '0';
    setTimeout(() => {
      const start = performance.now();
      const dur = 1700;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        amount.textContent = inr(500000 * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 750);
    card.addEventListener('animationend', (e) => { if (e.animationName === 'card-in') card.classList.add('floating'); });
    const stage = card.parentElement;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (fine) {
      stage.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg');
      });
      stage.addEventListener('pointerleave', () => {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    }
  }
}

/* ---------------------------------------------------------------- reveal */
function initReveal() {
  const targets = [...$$('[data-reveal]'), $('.receipt-wrap'), $('#steps'), $('.gap-figure'), $('#odometer')].filter(Boolean);
  const onShow = (el) => {
    el.classList.remove('pre');
    if (el.classList.contains('gap-figure')) $$('.stat-num', el).forEach((n, i) => setTimeout(() => countUp(n), i * 120));
    if (el.id === 'odometer') spinOdometer();
  };
  if (reduced || !('IntersectionObserver' in window)) { targets.forEach(onShow); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { onShow(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  const vh = window.innerHeight;
  targets.forEach((el) => {
    // Only hide what is below the fold, so the first screen is always complete.
    if (el.getBoundingClientRect().top > vh * 0.92) { el.classList.add('pre'); io.observe(el); }
    else onShow(el);
  });
}

function buildOdometer() {
  $$('#odometer .od-digit').forEach((d) => {
    const reel = document.createElement('span');
    reel.className = 'reel';
    for (let i = 0; i < 20; i++) { const s = document.createElement('span'); s.textContent = String(i % 10); reel.appendChild(s); }
    reel.setAttribute('aria-hidden', 'true');
    d.appendChild(reel);
    reel.style.transform = `translateY(-${Number(d.dataset.d)}em)`;
  });
}
function spinOdometer() {
  $$('#odometer .od-digit').forEach((d, i) => {
    const reel = $('.reel', d);
    if (!reel || reduced) return;
    reel.style.transition = 'none';
    reel.style.transform = 'translateY(0)';
    void reel.offsetHeight;
    reel.style.transition = `transform ${1.4 + i * 0.18}s cubic-bezier(.16,1,.3,1)`;
    reel.style.transform = `translateY(-${10 + Number(d.dataset.d)}em)`;
  });
}

/* --------------------------------------------------------------- header */
function initHeader() {
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  const links = $$('.nav a');
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['check', 'covered', 'card', 'ask'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
}

/* --------------------------------------------------------------- checker */
const CHECK_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5"/></svg>';
const ARROW_L = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10H5M9 5l-5 5 5 5"/></svg>';
const ARROW_R = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>';
const WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.6.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z"/></svg>';

const FLOW = [
  { id: 'hasCard', q: 'q.hasCard', opts: () => [['yes', 'opt.yes'], ['no', 'opt.no'], ['unsure', 'opt.unsure']], layout: 'two' },
  { id: 'senior70', q: 'q.senior', opts: () => [['yes', 'opt.yes'], ['no', 'opt.no']], layout: 'two' },
  { id: 'seniorGovtScheme', q: 'q.seniorScheme', when: (a) => a.senior70 === 'yes', opts: () => [['yes', 'opt.yes'], ['no', 'opt.no'], ['unsure', 'opt.unsure']], layout: 'two' },
  { id: 'area', q: 'q.area', when: (a) => a.hasCard !== 'yes', opts: () => [['rural', 'opt.rural'], ['urban', 'opt.urban']], layout: 'two' },
  { id: 'rural', q: 'q.rural', multi: true, when: (a) => a.hasCard !== 'yes' && a.area === 'rural', opts: () => [...RURAL_CRITERIA.map((c) => [c.id, c]), ['none', 'opt.none']] },
  { id: 'urban', q: 'q.urban', when: (a) => a.hasCard !== 'yes' && a.area === 'urban', opts: () => URBAN_OCCUPATIONS.map((o) => [o.id, o]) },
  { id: 'frontline', q: 'q.frontline', when: (a) => a.hasCard !== 'yes', opts: () => [['yes', 'opt.yes'], ['no', 'opt.no']], layout: 'two' },
  { id: 'ration', q: 'q.ration', when: (a) => a.hasCard !== 'yes', opts: () => [['aay', 'opt.aay'], ['phh', 'opt.phh'], ['other', 'opt.otherCard'], ['none', 'opt.noCard']] },
];

const checker = (() => {
  const stage = $('#checkerStage');
  const stepLabel = $('#checkerStep');
  const bar = $('#checkerBar');
  let answers = {};
  let index = 0;       // index into visible steps; === visible.length means result
  let lastResult = null;
  let started = false;

  const visible = () => FLOW.filter((s) => !s.when || s.when(answers));
  const label = (v) => (typeof v === 'string' ? t(v) : v[getLang()] || v.en);

  function toInput() {
    return {
      hasCard: answers.hasCard,
      senior70: answers.senior70 === 'yes',
      seniorGovtScheme: answers.seniorGovtScheme,
      area: answers.area,
      rural: (answers.rural || []).filter((x) => x !== 'none'),
      urban: answers.urban,
      frontline: answers.frontline === 'yes',
      ration: answers.ration,
    };
  }

  function swap(node, dir) {
    const old = $('.q, .result', stage);
    if (old && !reduced) {
      old.classList.add('leave');
      if (dir < 0) old.classList.add('back');
      old.addEventListener('animationend', () => old.remove(), { once: true });
      setTimeout(() => old.remove(), 500);
    } else if (old) old.remove();
    node.classList.add('enter');
    if (dir < 0) node.classList.add('back');
    stage.appendChild(node);
  }

  function render(animate = true, dir = 1) {
    const steps = visible();
    const total = steps.length;
    if (index >= total) return renderResult(animate, dir);
    const s = steps[index];
    stepLabel.textContent = t('check.step', { n: index + 1, total });
    bar.style.width = `${(index / total) * 100}%`;

    const node = document.createElement('div');
    node.className = 'q';
    const h = document.createElement('h3');
    h.className = 'q-title';
    h.textContent = t(s.q);
    node.appendChild(h);
    if (s.multi) {
      const hint = document.createElement('p');
      hint.className = 'q-hint';
      hint.textContent = t('check.pickMany');
      node.appendChild(hint);
    }
    const opts = document.createElement('div');
    opts.className = 'opts' + (s.layout === 'two' ? ' two' : '') + (s.multi ? ' multi' : '');
    opts.setAttribute('role', 'group');
    opts.setAttribute('aria-label', t(s.q));
    const current = answers[s.id];
    s.opts().forEach(([value, text], i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.style.setProperty('--i', i);
      const selected = s.multi ? (current || []).includes(value) : current === value;
      b.setAttribute('aria-pressed', String(selected));
      b.innerHTML = `<span class="mark">${CHECK_SVG}</span>`;
      const span = document.createElement('span');
      span.textContent = label(text);
      b.appendChild(span);
      b.addEventListener('click', () => choose(s, value, b, opts));
      opts.appendChild(b);
    });
    node.appendChild(opts);

    const nav = document.createElement('div');
    nav.className = 'q-nav';
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'link-btn';
    back.innerHTML = ARROW_L;
    back.append(t('check.back'));
    back.hidden = index === 0;
    back.addEventListener('click', () => { index = Math.max(0, index - 1); render(true, -1); });
    nav.appendChild(back);
    if (s.multi) {
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn btn-primary';
      next.innerHTML = `<span>${t('check.next')}</span>${ARROW_R}`;
      next.disabled = !(current && current.length);
      next.style.opacity = next.disabled ? '.45' : '1';
      next.addEventListener('click', () => { if ((answers[s.id] || []).length) { index++; render(true, 1); } });
      nav.appendChild(next);
    }
    node.appendChild(nav);

    if (animate) swap(node, dir);
    else { stage.replaceChildren(node); }
  }

  function choose(s, value, btn, group) {
    if (!started) { started = true; track('check_started'); }
    if (s.multi) {
      let list = answers[s.id] ? [...answers[s.id]] : [];
      if (value === 'none') list = list.includes('none') ? [] : ['none'];
      else {
        list = list.filter((x) => x !== 'none');
        list = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
      }
      answers[s.id] = list;
      $$('.opt', group).forEach((b, i) => {
        const v = s.opts()[i][0];
        b.setAttribute('aria-pressed', String(list.includes(v)));
      });
      const next = $('.q-nav .btn', group.parentElement);
      if (next) { next.disabled = !list.length; next.style.opacity = list.length ? '1' : '.45'; }
      return;
    }
    answers[s.id] = value;
    $$('.opt', group).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    setTimeout(() => { index++; render(true, 1); }, reduced ? 0 : 320);
  }

  function renderResult(animate, dir) {
    const r = assess(toInput());
    const first = !lastResult || animate;
    lastResult = r;
    stepLabel.textContent = t('check.done');
    bar.style.width = '100%';
    if (animate && first) {
      track('check_completed');
      track('result_' + r.headline);
      if (r.senior) track('senior_found');
      store.set('saathi-checked', '1');
    }

    const node = document.createElement('div');
    node.className = 'result';

    const head = document.createElement('div');
    head.className = 'result-head';
    const stamp = document.createElement('div');
    stamp.className = 'stamp';
    stamp.dataset.s = r.headline;
    stamp.textContent = t('stamp.' + r.headline);
    const titleWrap = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'result-title';
    title.textContent = t('headline.' + r.headline);
    titleWrap.appendChild(title);
    if (r.senior && r.headline === 'seniorCovered') {
      const fam = document.createElement('p');
      fam.className = 'result-family';
      fam.textContent = t('result.familyLine', { status: t('status.' + r.family) });
      titleWrap.appendChild(fam);
    }
    head.append(stamp, titleWrap);
    node.appendChild(head);

    const reasons = [];
    if (r.senior) reasons.push(r.senior.reason);
    r.reasons.forEach((x) => reasons.push(x));
    if (reasons.length) {
      const ul = document.createElement('ul');
      ul.className = 'result-list';
      reasons.forEach((id, i) => {
        const li = document.createElement('li');
        li.style.setProperty('--i', i);
        li.textContent = t('reason.' + id);
        ul.appendChild(li);
      });
      node.appendChild(ul);
    }

    const stepsWrap = document.createElement('div');
    const sh = document.createElement('h3');
    sh.className = 'sub-h';
    sh.textContent = t('steps.title');
    const ol = document.createElement('ol');
    ol.className = 'next-steps';
    r.steps.forEach((id, i) => {
      const li = document.createElement('li');
      li.style.setProperty('--i', i);
      const span = document.createElement('span');
      linkify(span, t('step.' + id));
      li.appendChild(span);
      ol.appendChild(li);
    });
    stepsWrap.append(sh, ol);
    node.appendChild(stepsWrap);

    if (r.family !== 'covered') {
      const dw = document.createElement('div');
      const dh = document.createElement('h3');
      dh.className = 'sub-h';
      dh.textContent = t('docs.title');
      const docs = document.createElement('div');
      docs.className = 'docs';
      r.documents.forEach((d) => { const s = document.createElement('span'); s.textContent = t('doc.' + d); docs.appendChild(s); });
      dw.append(dh, docs);
      node.appendChild(dw);
    }

    const note = document.createElement('p');
    note.className = 'result-note';
    note.textContent = t('result.disclaimer');
    node.appendChild(note);

    const actions = document.createElement('div');
    actions.className = 'result-actions';
    const wa = document.createElement('a');
    wa.className = 'btn btn-wa';
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.innerHTML = WA_SVG;
    wa.append(t('result.share'));
    const shareText = `${t('share.intro')}\n${summarize(r, t)}\n\n${t('share.outro')} ${siteUrl()}`;
    wa.href = 'https://wa.me/?text=' + encodeURIComponent(shareText);
    wa.addEventListener('click', () => track('share'));
    const again = document.createElement('button');
    again.type = 'button';
    again.className = 'btn btn-ghost';
    again.textContent = t('result.again');
    again.addEventListener('click', reset);
    const ask = document.createElement('a');
    ask.className = 'btn btn-ghost';
    ask.href = '#ask';
    ask.textContent = t('result.ask');
    ask.addEventListener('click', () => setTimeout(() => $('#chatInput').focus({ preventScroll: true }), 600));
    actions.append(wa, again, ask);
    node.appendChild(actions);

    if (animate) swap(node, dir);
    else stage.replaceChildren(node);
    if (reduced) $$('.stamp', node).forEach((s) => (s.style.animation = 'none'));
  }

  function reset() { answers = {}; index = 0; lastResult = null; render(true, -1); }

  return { render, get result() { return lastResult; } };
})();

function siteUrl() {
  return /^https?:/.test(location.protocol) && !/claude|localhost|127\./.test(location.hostname)
    ? location.origin + location.pathname.replace(/index\.html$/, '')
    : 'https://ilaaj-saathi.vercel.app';
}

/* ----------------------------------------------------------- link helper */
const LINK_PATTERNS = [
  [/(beneficiary\.nha\.gov\.in)/, LINKS.beneficiary],
  [/(hospitals\.pmjay\.gov\.in)/, LINKS.hospitals],
  [/(cgrms\.pmjay\.gov\.in)/, LINKS.grievance],
  [/(nha\.gov\.in\/PM-JAY)/, LINKS.nha],
  [/((?<![\w.])pmjay\.gov\.in)/, LINKS.pmjay],
  [/(\b14555\b)/, 'tel:' + HELPLINE],
  [/(\b108\b)/, 'tel:108'],
  [/(\b112\b)/, 'tel:112'],
];
function linkify(el, text) {
  // Builds text + <a> nodes; never injects HTML from the text.
  const combined = new RegExp(LINK_PATTERNS.map(([re]) => re.source).join('|'), 'g');
  let last = 0;
  for (const m of text.matchAll(combined)) {
    if (m.index > last) el.append(text.slice(last, m.index));
    const match = m[0];
    const [, href] = LINK_PATTERNS.find(([re]) => new RegExp('^' + re.source + '$').test(match)) || [];
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = match;
      if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; a.addEventListener('click', () => track('portal_click')); }
      el.append(a);
    } else el.append(match);
    last = m.index + match.length;
  }
  if (last < text.length) el.append(text.slice(last));
}

/* ------------------------------------------------------------------ chat */
const chat = (() => {
  const log = $('#chatLog');
  const form = $('#chatForm');
  const input = $('#chatInput');
  const micBtn = $('#micBtn');
  let history = [];
  let seeded = false;
  let busy = false;

  function bubble(role, text, { tag, lang } = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + (role === 'user' ? 'msg-user' : 'msg-bot');
    const b = document.createElement('div');
    b.className = 'bubble';
    if (role === 'user') b.textContent = text; else linkify(b, text);
    wrap.appendChild(b);
    if (role !== 'user' || tag) {
      const meta = document.createElement('div');
      meta.className = 'msg-meta';
      if (tag) { const s = document.createElement('span'); s.className = 'tag'; s.textContent = tag; meta.appendChild(s); }
      if (role !== 'user' && 'speechSynthesis' in window) meta.appendChild(listenButton(text, lang));
      if (meta.childNodes.length) wrap.appendChild(meta);
    }
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return wrap;
  }

  function listenButton(text, lang) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'listen-btn';
    const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
    const setLabel = (on) => { b.innerHTML = icon; b.append(t(on ? 'ask.stop' : 'ask.listen')); };
    setLabel(false);
    b.addEventListener('click', () => {
      const synth = window.speechSynthesis;
      if (synth.speaking) { synth.cancel(); setLabel(false); return; }
      const u = new SpeechSynthesisUtterance(text);
      const code = speechCode(lang || getLang());
      u.lang = code;
      const voice = synth.getVoices().find((v) => v.lang === code) || synth.getVoices().find((v) => v.lang.startsWith(code.slice(0, 2)));
      if (voice) u.voice = voice;
      u.rate = 0.95;
      u.onend = () => setLabel(false);
      setLabel(true);
      synth.speak(u);
      track('listen');
    });
    return b;
  }

  function seed() {
    log.replaceChildren();
    const q = t('ask.exampleQ');
    const lang = getLang();
    bubble('user', q, { tag: t('ask.example') });
    bubble('bot', offlineAnswer(q, lang).text, { tag: t('ask.example'), lang });
    seeded = true;
  }

  function typing() {
    const wrap = document.createElement('div');
    wrap.className = 'msg msg-bot';
    wrap.innerHTML = '<div class="bubble typing" role="status"><i></i><i></i><i></i></div>';
    $('.bubble', wrap).setAttribute('aria-label', t('ask.thinking'));
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return wrap;
  }

  async function ask(text) {
    const q = String(text || '').trim().slice(0, 600);
    if (!q || busy) return;
    busy = true;
    if (seeded) { log.replaceChildren(); seeded = false; }
    const lang = detectLang(q, /[a-z]/i.test(q) ? 'en' : getLang());
    bubble('user', q);
    history.push({ role: 'user', content: q });
    track('chat');
    const dots = typing();
    const minWait = new Promise((r) => setTimeout(r, reduced ? 0 : 650));
    let reply = null;
    let mode = 'offline';
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-10), lang, context: checker.result || undefined }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.reply === 'string' && data.reply.trim()) { reply = data.reply.trim(); mode = data.mode || 'ai'; }
      }
    } catch { /* fall back below */ }
    if (!reply) reply = offlineAnswer(q, lang).text;
    await minWait;
    dots.remove();
    history.push({ role: 'assistant', content: reply });
    bubble('bot', reply, { tag: mode === 'offline' ? t('ask.offline') : null, lang });
    busy = false;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    ask(v);
  });
  $$('#askChips .q-chip').forEach((c) => c.addEventListener('click', () => ask(c.textContent)));

  // Voice input (Chrome / Android support Hindi and Indian English).
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    micBtn.hidden = false;
    let rec = null;
    micBtn.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      try {
        rec = new SR();
        rec.lang = speechCode(getLang());
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        micBtn.classList.add('on');
        input.placeholder = t('ask.listening');
        let finalText = '';
        rec.onresult = (e) => {
          let interim = '';
          for (const r of e.results) { if (r.isFinal) finalText = r[0].transcript; else interim += r[0].transcript; }
          input.value = finalText || interim;
        };
        const end = () => {
          micBtn.classList.remove('on');
          input.placeholder = t('ask.placeholder');
          rec = null;
          if (finalText) { input.value = ''; ask(finalText); track('voice'); }
        };
        rec.onend = end;
        rec.onerror = end;
        rec.start();
      } catch { micBtn.classList.remove('on'); rec = null; }
    });
  }

  return {
    onLangChange() { if (seeded || !log.childElementCount) seed(); },
  };
})();

/* --------------------------------------------------------- small actions */
function initActions() {
  const copyBtn = $('#copyHelpline');
  copyBtn.addEventListener('click', async () => {
    track('helpline_copy');
    try { await navigator.clipboard.writeText(HELPLINE); }
    catch {
      const range = document.createRange();
      range.selectNodeContents($('#odometer'));
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    }
    copyBtn.textContent = t('rights.copied');
    setTimeout(() => { copyBtn.textContent = t('rights.copy'); }, 1800);
  });
  $$('[data-track]').forEach((a) => a.addEventListener('click', () => track(a.dataset.track)));

  const got = $('#gotCard');
  const gotBtn = $('#gotCardBtn');
  const thanks = () => { got.replaceChildren(); const s = document.createElement('span'); s.dataset.i18n = 'foot.gotCardThanks'; s.textContent = t('foot.gotCardThanks'); got.appendChild(s); };
  if (store.get('saathi-got-card')) thanks();
  gotBtn.addEventListener('click', () => { track('got_card'); store.set('saathi-got-card', '1'); thanks(); });

  const repo = document.querySelector('meta[name="repo"]');
  if (repo) $('#repoLink').href = repo.content;
}

/* ------------------------------------------------------------------ boot */
setLang(initialLang());
buildOdometer();
applyI18n();
initHeader();
initActions();

const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve();
fontsReady.then(() => {
  document.body.classList.remove('booting');
  document.body.classList.add('ready');
  heroCard();
  initReveal();
  track('visit', { once: true });
});
