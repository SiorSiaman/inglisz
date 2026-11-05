'use strict';

/* ================= Dane ================= */
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const CATS = {
  core: 'Słownik ogólny',
  general: 'Ogólne (wybrane)',
  phrasal: 'Phrasal verbs',
  colloc: 'Kolokacje i idiomy',
  work: 'Praca i biznes',
  telecom: 'Telekomunikacja',
  tech: 'IT i technika',
  travel: 'Podróże',
};

const WORDS = [];
(function parseWords() {
  const seen = new Set();
  const packs = [...WORD_PACKS, ...(typeof DICT_PACKS !== 'undefined' ? DICT_PACKS : [])];
  for (const pack of packs) {
    for (const line of pack.items.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('//')) continue;
      const [en, pl, ex = '', exPl = '', ipa = ''] = t.split('|').map(s => s.trim());
      if (!en || !pl) continue;
      const id = en.toLowerCase();
      if (seen.has(id)) continue;
      seen.add(id);
      WORDS.push({ id, en, pl, ex, exPl, ipa, level: pack.level, cat: pack.cat });
    }
  }
})();
const BY_ID = new Map(WORDS.map(w => [w.id, w]));

const SENTENCES = [
  ...SENTENCE_DATA.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const [pl, en, cat] = l.split('|').map(s => s.trim());
    return { pl, en, cat, level: 'B1' };
  }),
  ...(typeof TATOEBA_DATA !== 'undefined' ? TATOEBA_DATA : '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const [pl, en, level] = l.split('|').map(s => s.trim());
    return { pl, en, cat: 'core', level };
  }),
].filter(s => s.pl && s.en);

/* ================= Stan i zapis ================= */
const STORE_KEY = 'inglisz-v1';
const DEFAULT_SETTINGS = {
  newPerDay: 15,
  autoSpeak: true,
  accent: 'en-GB',
  rate: 0.95,
  direction: 'mix',
  buildLevel: 'all',
  deck: 'all',
  retention: 0.9,
  learnSteps: '1 10',
  relearnSteps: '10',
  cats: Object.fromEntries(Object.keys(CATS).map(k => [k, true])),
};

function normalizeState(s) {
  if (!s || typeof s !== 'object') s = {};
  return {
    cards: s.cards || {},
    placed: s.placed || {},
    log: s.log || {},
    edits: s.edits || {},
    extraNew: s.extraNew || null,
    suspended: s.suspended || {},
    grammar: s.grammar || {},
    buried: s.buried || {},
    savedAt: s.savedAt || 0,
    settings: Object.assign({}, DEFAULT_SETTINGS, s.settings || {}, {
      cats: Object.assign({}, DEFAULT_SETTINGS.cats, (s.settings && s.settings.cats) || {}),
    }),
  };
}
function loadState() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { s = null; }
  return normalizeState(s);
}
let state = loadState();

/* Drugi, niezależny zapis w IndexedDB. Jeśli localStorage zostanie wyczyszczony,
   postęp wraca z IndexedDB (i odwrotnie). */
const idb = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      try {
        const r = indexedDB.open('inglisz', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => { this.db = r.result; res(this.db); };
        r.onerror = () => rej(r.error);
      } catch (e) { rej(e); }
    });
  },
  async get(key) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const q = db.transaction('kv').objectStore('kv').get(key);
      q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
    });
  },
  async set(key, val) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(val, key);
      tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
    });
  },
};

function save() {
  state.savedAt = Date.now();
  const json = JSON.stringify(state);
  try { localStorage.setItem(STORE_KEY, json); }
  catch (e) { toast('Nie udało się zapisać postępu'); }
  idb.set(STORE_KEY, json).catch(() => {});
  // Dzienna kopia: ostatnie 7 dni w IndexedDB.
  const t = today();
  idb.set('backup-' + (t % 7), json).catch(() => {});
}

async function restoreFromIdb() {
  try {
    const json = await idb.get(STORE_KEY);
    if (!json) return false;
    const fromIdb = normalizeState(JSON.parse(json));
    if (fromIdb.savedAt > state.savedAt && Object.keys(fromIdb.cards).length > 0) {
      state = fromIdb;
      try { localStorage.setItem(STORE_KEY, json); } catch (e) { /* ignore */ }
      return true;
    }
  } catch (e) { /* brak IndexedDB */ }
  return false;
}

let storagePersisted = null;
async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      storagePersisted = await navigator.storage.persisted() || await navigator.storage.persist();
    }
  } catch (e) { storagePersisted = null; }
}

const plOf = w => state.edits[w.id] || w.pl;
function editTranslation(w, after) {
  const v = prompt(`Popraw tłumaczenie słowa "${w.en}":`, plOf(w));
  if (v === null) return;
  const t = v.trim();
  if (!t || t === w.pl) delete state.edits[w.id]; else state.edits[w.id] = t;
  if (w.custom) {
    // W imporcie poprawiamy bezpośrednio talię.
    const d = custom.decks[w.cat];
    const x = d && d.words.find(x => x.en.toLowerCase() === w.en.toLowerCase());
    if (x && t) { x.pl = t; w.pl = t; delete state.edits[w.id]; saveCustom(); }
  }
  save();
  toast('Zapisano tłumaczenie');
  if (after) after();
}

/* ================= Własne talie (import) ================= */
const CUSTOM_KEY = 'inglisz-custom';
let custom = { decks: {} };
function loadCustom() {
  try { const c = JSON.parse(localStorage.getItem(CUSTOM_KEY)); if (c && c.decks) custom = c; } catch (e) { /* brak */ }
}
function saveCustom() {
  const j = JSON.stringify(custom);
  try { localStorage.setItem(CUSTOM_KEY, j); } catch (e) { toast('Brak miejsca w pamięci przeglądarki'); }
  idb.set(CUSTOM_KEY, j).catch(() => {});
}
async function restoreCustomFromIdb() {
  if (Object.keys(custom.decks).length) return false;
  try {
    const j = await idb.get(CUSTOM_KEY);
    const c = j && JSON.parse(j);
    if (c && c.decks && Object.keys(c.decks).length) {
      custom = c;
      try { localStorage.setItem(CUSTOM_KEY, j); } catch (e) { /* ignore */ }
      applyCustom();
      return true;
    }
  } catch (e) { /* ignore */ }
  return false;
}
function applyCustom() {
  for (let i = WORDS.length - 1; i >= 0; i--) if (WORDS[i].custom) { BY_ID.delete(WORDS[i].id); WORDS.splice(i, 1); }
  for (const k of Object.keys(CATS)) if (k.startsWith('u_')) delete CATS[k];
  for (const [did, d] of Object.entries(custom.decks)) {
    CATS[did] = d.name;
    const seen = new Set();
    for (const x of d.words) {
      const key = x.en.toLowerCase();
      const id = did + ':' + key;
      if (seen.has(id)) continue;
      seen.add(id);
      const base = BY_ID.get(key);
      const w = {
        id, en: x.en, pl: x.pl, ex: x.ex || '', exPl: x.exPl || '',
        ipa: base ? base.ipa : '',
        level: LEVELS.includes(x.level) ? x.level : (base ? base.level : 'B2'),
        cat: did, custom: true,
      };
      WORDS.push(w); BY_ID.set(id, w);
    }
  }
}
loadCustom();
applyCustom();

/* ================= Pomocnicze ================= */
const view = document.getElementById('view');
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
// Polska odmiana: plural(5, 'fiszka', 'fiszki', 'fiszek') -> '5 fiszek'
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  const w = n === 1 ? one : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? few : many;
  return `${n} ${w}`;
}
const nFiszek = n => plural(n, 'fiszka', 'fiszki', 'fiszek');
const nSlow = n => plural(n, 'słowo', 'słowa', 'słów');

function today() {
  const d = new Date();
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
}
function dayLabel(day) {
  const d = new Date(day * 86400000);
  return d.getUTCDate() + '.' + String(d.getUTCMonth() + 1).padStart(2, '0');
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// kind: 'new' | 'review' | 'ex'; ok: czy poprawnie; extra: { ms, rv (ocena karty w stanie review), rvOk }
function logActivity(kind, ok, extra = {}) {
  const t = today();
  const e = state.log[t] || (state.log[t] = { r: 0, n: 0, ok: 0, x: 0 });
  if (kind === 'new') e.n++;
  else if (kind === 'review') e.r++;
  else e.x++;
  if (ok) e.ok++;
  if (extra.ms) e.t = (e.t || 0) + extra.ms;
  if (extra.rv) { e.rv = (e.rv || 0) + 1; if (extra.rvOk) e.rvOk = (e.rvOk || 0) + 1; }
}

const ICON_SPEAK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const ICON_SLOW = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const ICON_GEAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
const speakBtn = (text, label = '') => `<button class="speak" data-say="${esc(text)}" aria-label="Odsłuchaj">${ICON_SPEAK}${label}</button>`;
const slowBtn = text => `<button class="speak" data-say="${esc(text)}" data-slow="1" aria-label="Odsłuchaj wolno">${ICON_SLOW}</button>`;
const backLink = (href, label = 'Wróć') => `<a class="back" href="${href}">‹ ${label}</a>`;

/* ================= Synteza mowy ================= */
let voices = [];
const hasTTS = 'speechSynthesis' in window;
function loadVoices() { voices = speechSynthesis.getVoices(); }
if (hasTTS) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function pickVoice() {
  const acc = state.settings.accent;
  const norm = v => v.lang.replace('_', '-');
  const same = voices.filter(v => norm(v) === acc);
  return same.find(v => /natural|neural|google|premium|enhanced/i.test(v.name)) || same[0]
    || voices.find(v => v.lang.startsWith('en'));
}
function speak(text, slow = false) {
  if (!hasTTS) { toast('Ta przeglądarka nie obsługuje czytania na głos'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) u.voice = v;
  u.lang = state.settings.accent;
  u.rate = slow ? 0.65 : state.settings.rate;
  speechSynthesis.speak(u);
}
function stopSpeech() { if (hasTTS) speechSynthesis.cancel(); }

document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]');
  if (b) { e.stopPropagation(); speak(b.dataset.say, !!b.dataset.slow); }
});

/* ================= Powtórki: algorytm FSRS-4.5 + kroki nauki w minutach ================= */
const FSRS_W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const DECAY = -0.5;
const FACTOR = 19 / 81;
const clampD = d => Math.min(10, Math.max(1, d));
const initS = G => Math.max(0.1, FSRS_W[G - 1]);
const initD = G => clampD(FSRS_W[4] - (G - 3) * FSRS_W[5]);
const nextD = (D, G) => clampD(FSRS_W[7] * initD(4) + (1 - FSRS_W[7]) * (D - FSRS_W[6] * (G - 3)));
const retrievability = (t, S) => Math.pow(1 + FACTOR * t / S, DECAY);
const recallS = (D, S, R, G) => S * (1 + Math.exp(FSRS_W[8]) * (11 - D) * Math.pow(S, -FSRS_W[9]) *
  (Math.exp(FSRS_W[10] * (1 - R)) - 1) * (G === 2 ? FSRS_W[15] : 1) * (G === 4 ? FSRS_W[16] : 1));
const forgetS = (D, S, R) => Math.min(S, FSRS_W[11] * Math.pow(D, -FSRS_W[12]) * (Math.pow(S + 1, FSRS_W[13]) - 1) * Math.exp(FSRS_W[14] * (1 - R)));
function ivFromS(S) {
  const r = state.settings.retention || 0.9;
  return Math.min(36500, Math.max(1, Math.round(S / FACTOR * (Math.pow(r, 1 / DECAY) - 1))));
}
function parseSteps(str, def) {
  const a = String(str || '').split(/[\s,;]+/).map(Number).filter(n => n > 0 && n < 1440);
  return a.length ? a : def;
}
const learnSteps = () => parseSteps(state.settings.learnSteps, [1, 10]);
const relearnSteps = () => parseSteps(state.settings.relearnSteps, [10]);

// Zamiana starych kart (SM-2) na format FSRS.
function migrateCard(c) {
  if (!c || c.S != null) return c;
  const t = today();
  if (c.s === 'known') return { s: 'review', known: true, S: Math.max(1, c.iv || 60), D: 3, iv: c.iv || 60, due: c.due, last: c.first ?? t, reps: c.reps || 3, lapses: 0, first: c.first ?? t };
  if (!c.reps || c.s === 'learning') return { s: 'relearning', S: 1, D: 6, step: 0, iv: 0, due: Math.min(c.due ?? t, t), dueAt: 1, last: t, reps: c.reps || 1, lapses: c.lapses || 0, first: c.first ?? t };
  const D = clampD(11 - ((c.ef || 2.5) - 1.3) / 1.9 * 9);
  return { s: 'review', S: Math.max(1, c.iv || 1), D, iv: c.iv || 1, due: c.due, last: (c.due ?? t) - (c.iv || 1), reps: c.reps, lapses: c.lapses || 0, first: c.first ?? t };
}

// Czysta funkcja: zwraca nową kartę po ocenie G (1 = Nie wiem, 2 = Trudne, 3 = Dobrze, 4 = Łatwe).
function schedule(c0, G, now = Date.now()) {
  const t = today();
  const MIN = 60000;
  const c = c0 ? Object.assign({}, migrateCard(c0)) : { s: 'new', reps: 0, lapses: 0, first: t };
  const toStep = (steps, idx, minutes) => {
    c.step = idx; c.dueAt = now + (minutes ?? steps[idx]) * MIN; c.due = t; c.iv = 0;
  };
  const graduate = days => {
    c.s = 'review'; c.iv = days; c.due = t + days; c.dueAt = 0; c.step = 0; c.last = t;
  };
  c.reps = (c.reps || 0) + 1;
  if (c.s === 'new') {
    c.S = initS(G); c.D = initD(G); c.last = t;
    const st = learnSteps();
    if (G === 1) { c.s = 'learning'; toStep(st, 0); }
    else if (G === 2) { c.s = 'learning'; toStep(st, 0, st.length > 1 ? (st[0] + st[1]) / 2 : st[0] * 1.5); }
    else if (G === 3) { if (st.length > 1) { c.s = 'learning'; toStep(st, 1); } else graduate(ivFromS(c.S)); }
    else graduate(ivFromS(c.S));
    return c;
  }
  if (c.s === 'learning' || c.s === 'relearning') {
    const st = c.s === 'learning' ? learnSteps() : relearnSteps();
    const i = Math.min(c.step || 0, st.length - 1);
    if (G === 1) toStep(st, 0);
    else if (G === 2) toStep(st, i, i === 0 && st.length > 1 ? (st[0] + st[1]) / 2 : st[i] * 1.5);
    else if (G === 3) { if (i + 1 < st.length) toStep(st, i + 1); else graduate(ivFromS(c.S)); }
    else graduate(Math.max(ivFromS(c.S) + 1, c.s === 'learning' ? 4 : 2));
    return c;
  }
  // Karta w powtórkach
  const elapsed = Math.max(0, t - (c.last ?? t));
  const R = retrievability(elapsed, c.S);
  if (G === 1) {
    c.lapses = (c.lapses || 0) + 1; c.known = false;
    c.S = forgetS(c.D, c.S, R); c.D = nextD(c.D, 1); c.s = 'relearning'; c.last = t;
    toStep(relearnSteps(), 0);
    return c;
  }
  const sH = recallS(c.D, c.S, R, 2), sG = recallS(c.D, c.S, R, 3), sE = recallS(c.D, c.S, R, 4);
  let iH = ivFromS(sH), iG = ivFromS(sG), iE = ivFromS(sE);
  iH = Math.min(iH, iG); iG = Math.max(iG, iH + 1); iE = Math.max(iE, iG + 1);
  c.S = G === 2 ? sH : G === 3 ? sG : sE;
  c.D = nextD(c.D, G);
  graduate(G === 2 ? iH : G === 3 ? iG : iE);
  return c;
}
function previewLabels(c) {
  const now = Date.now();
  return [1, 2, 3, 4].map(G => {
    const n = schedule(c, G, now);
    if (n.dueAt) { const m = Math.round((n.dueAt - now) / 60000); return m < 60 ? `${m} min` : `${Math.round(m / 60)} godz.`; }
    return ivLabel(n.iv);
  });
}

function status(id) {
  if (state.suspended[id]) return 'suspended';
  const c = state.cards[id];
  if (!c) return 'new';
  if (c.known || c.s === 'known') return 'known';
  if (c.s === 'learning' || c.s === 'relearning' || !c.reps) return 'learning';
  if ((c.iv || 0) >= 21) return 'mastered';
  return 'review';
}
const STATUS_PL = { new: 'nowe', learning: 'w nauce', review: 'powtarzane', mastered: 'opanowane', known: 'znane', suspended: 'zawieszone' };
const isBuried = id => (state.buried[id] || 0) > today();
const isBlocked = id => !!state.suspended[id] || isBuried(id);

/* Wybór fiszek do nauki: dowolne połączenie kategorii (także własnych talii) i poziomów. */
function study() {
  const s = state.settings;
  if (!s.study || typeof s.study !== 'object') s.study = { cats: {}, levels: {} };
  s.study.cats = s.study.cats || {}; s.study.levels = s.study.levels || {};
  return s.study;
}
const catOn = c => study().cats[c] !== false;
const lvlOn = l => study().levels[l] !== false;
const studyKey = () => JSON.stringify(study()) + '|' + Object.keys(CATS).length;
function inDeck(w, deck = 'study') {
  if (deck === 'any') return true;
  return catOn(w.cat) && lvlOn(w.level);
}
function enabledWords() { return WORDS.filter(w => catOn(w.cat)); }
function studySummary() {
  const cats = Object.keys(CATS).filter(catOn);
  const lv = LEVELS.filter(lvlOn);
  const catTxt = cats.length === Object.keys(CATS).length ? 'wszystkie kategorie'
    : cats.length <= 2 ? cats.map(c => CATS[c]).join(', ') : `${cats.length} kategorie`;
  const lvTxt = lv.length === LEVELS.length ? 'wszystkie poziomy' : lv.join(', ');
  return `${catTxt} · ${lvTxt}`;
}
function dueIds(deck = 'study') {
  const t = today();
  return Object.keys(state.cards).filter(id => BY_ID.has(id) && state.cards[id].due <= t && !isBlocked(id) && inDeck(BY_ID.get(id), deck));
}
function newIntroducedToday(deck = 'study') {
  const t = today();
  return Object.entries(state.cards).filter(([id, c]) => c.first === t && !c.known && c.s !== 'known' && BY_ID.has(id) && inDeck(BY_ID.get(id), deck)).length;
}
function newAvailable(deck = 'study') {
  const extra = state.extraNew && state.extraNew.day === today() ? state.extraNew.n : 0;
  const left = Math.max(0, state.settings.newPerDay + extra - newIntroducedToday(deck));
  const pool = WORDS.filter(w => inDeck(w, deck) && !state.cards[w.id] && !isBlocked(w.id));
  return { left: Math.min(left, pool.length), pool };
}
function orderNew(pool) {
  // Każda kategoria uporządkowana od niższych poziomów; kategorie na zmianę,
  // żeby słownictwo branżowe i podróżnicze pojawiało się od początku, a nie po 3000 słów.
  const byCat = {};
  for (const w of pool) (byCat[w.cat] = byCat[w.cat] || []).push(w);
  const lists = Object.values(byCat).map(arr => {
    const out = [];
    for (const l of LEVELS) out.push(...shuffle(arr.filter(w => w.level === l)));
    return out;
  });
  // Słownik ogólny jest największy, więc dostaje 2 miejsca na każdą rundę.
  const core = byCat.core ? lists.find(l => l[0] && l[0].cat === 'core') : null;
  const rest = shuffle(lists.filter(l => l !== core));
  const out = [];
  let ri = 0;
  while (out.length < pool.length) {
    if (core && core.length) out.push(core.shift());
    if (core && core.length) out.push(core.shift());
    const live = rest.filter(l => l.length);
    if (live.length) { out.push(live[ri % live.length].shift()); ri++; }
    if (!live.length && !(core && core.length)) break;
  }
  return out;
}

const ivLabel = d => d === 0 ? 'teraz' : d < 30 ? d + ' d' : d < 365 ? Math.round(d / 30) + ' mies.' : (d / 365).toFixed(1) + ' r.';

// g: 0..3 z przycisków (Nie wiem..Łatwe). Zwraca nową kartę.
function grade(id, g, ms = 0) {
  const prev = state.cards[id] ? migrateCard(state.cards[id]) : null;
  const wasReview = prev && prev.s === 'review';
  const c = schedule(prev, g + 1);
  state.cards[id] = c;
  logActivity(prev ? 'review' : 'new', g >= 1, { ms, rv: wasReview, rvOk: g >= 1 });
  save();
  return c;
}

function markKnown(id, days = 30) {
  // Znane słowo wraca dopiero po kilku miesiącach jako kontrola.
  const t = today();
  const iv = days + Math.floor(Math.random() * days * 2);
  state.cards[id] = { s: 'review', known: true, S: iv, D: 3, iv, reps: 1, lapses: 0, first: t, last: t, due: t + iv };
}

/* ================= Router ================= */
const ROUTES = {};
const NAV_OF = { pick: 'learn', import: 'words', decks: 'words', deck: 'words', grammar: 'practice', glesson: 'practice', gpractice: 'practice', build: 'practice', listen: 'practice', quiz: 'practice', placement: 'practice', settings: 'home' };
function render() {
  const [r, arg] = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  const name = ROUTES[r] ? r : 'home';
  stopSpeech();
  ROUTES[name](arg ? decodeURIComponent(arg) : undefined);
  const nav = NAV_OF[name] || name;
  $$('.tabbar a').forEach(a => a.classList.toggle('active', a.dataset.route === nav));
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);

/* ================= Start ================= */
function streak() {
  const t = today();
  let n = 0;
  let d = state.log[t] ? t : t - 1;
  while (state.log[d]) { n++; d--; }
  return n;
}
ROUTES.home = () => {
  const due = dueIds().length;
  const { left } = newAvailable();
  const learned = Object.keys(state.cards).length;
  const mastered = Object.keys(state.cards).filter(id => ['mastered', 'known'].includes(status(id))).length;
  const t = today();
  const todayLog = state.log[t] || { r: 0, n: 0, x: 0 };
  const doneToday = todayLog.r + todayLog.n + todayLog.x;
  view.innerHTML = `
    <header class="top">
      <div><h1>Inglisz</h1><div class="sub">Angielski od A1 do C1</div></div>
      <a class="icon-btn" href="#/settings" aria-label="Ustawienia">${ICON_GEAR}</a>
    </header>
    <section class="card hero">
      <div class="row"><div><div class="big-num">${streak()}</div><div class="muted small">${streak() === 1 ? 'dzień' : 'dni'} z rzędu</div></div>
      <div class="spacer"></div><div class="muted small" style="text-align:right">Dziś: ${doneToday} ćwiczeń</div></div>
      <div class="kpis">
        <div class="kpi"><b>${due}</b><span>do powtórki</span></div>
        <div class="kpi"><b>${left}</b><span>nowych dziś</span></div>
        <div class="kpi"><b>${mastered}</b><span>opanowanych</span></div>
      </div>
      <a class="btn primary big block" href="#/learn">${due + left > 0 ? 'Ucz się słówek' : 'Na dziś wszystko zrobione'}</a>
    </section>
    ${learned === 0 ? `
    <section class="card">
      <h2>Zacznij od testu poziomu</h2>
      <p class="muted">Zaznacz słówka, które już znasz. Aplikacja ich nie będzie powtarzać, a resztę doda do nauki, również z niższych poziomów.</p>
      <a class="btn block" href="#/placement">Przejdź do testu</a>
    </section>` : ''}
    <div class="grid2">
      <a class="tile" href="#/grammar"><span class="ico">📘</span><b>Gramatyka</b><span>Lekcje i ćwiczenia</span></a>
      <a class="tile" href="#/build"><span class="ico">🧩</span><b>Ułóż zdanie</b><span>Tłumacz z polskiego z klocków</span></a>
      <a class="tile" href="#/listen"><span class="ico">🎧</span><b>Ze słuchu</b><span>Usłysz i ułóż zdanie</span></a>
      <a class="tile" href="#/quiz"><span class="ico">✅</span><b>Quiz</b><span>10 pytań, 4 odpowiedzi</span></a>
      <a class="tile" href="#/placement"><span class="ico">📋</span><b>Test poziomu</b><span>Oznacz znane słowa</span></a>
    </div>`;
};

/* ================= Fiszki ================= */
let session = null;
const LEARN_AHEAD_MS = 20 * 60000; // jak w Anki: karty w nauce można pokazać do 20 min wcześniej
function buildSession(deck = studyKey()) {
  const ids = dueIds();
  const learn = [];
  const due = [];
  for (const id of shuffle(ids)) {
    const c = state.cards[id];
    if (c.s === 'learning' || c.s === 'relearning') learn.push({ id, dueAt: c.dueAt || 0 });
    else due.push({ id, isNew: false });
  }
  const { left, pool } = newAvailable();
  const fresh = orderNew(pool).slice(0, left).map(w => ({ id: w.id, isNew: true }));
  // Przeplatamy: co 3 powtórki jedno nowe słowo.
  const q = [];
  while (due.length || fresh.length) {
    for (let i = 0; i < 3 && due.length; i++) q.push(due.shift());
    if (fresh.length) q.push(fresh.shift());
  }
  return { deck, queue: q, learn, cur: null, done: 0, revealed: false, dir: null, history: [] };
}
const remaining = s => s.queue.length + s.learn.length + (s.cur ? 1 : 0);

// Wybiera następną kartę: najpierw karty w nauce, których czas minął, potem kolejka.
function pickNext(s, force = false) {
  if (s.cur) return 'card';
  const now = Date.now();
  s.learn.sort((a, b) => a.dueAt - b.dueAt);
  if (s.learn.length && s.learn[0].dueAt <= now) { s.cur = { id: s.learn.shift().id, isNew: false }; return 'card'; }
  if (s.queue.length) { s.cur = s.queue.shift(); return 'card'; }
  if (s.learn.length) {
    if (force || s.learn[0].dueAt - now <= LEARN_AHEAD_MS) { s.cur = { id: s.learn.shift().id, isNew: false }; return 'card'; }
    return 'wait';
  }
  return 'done';
}

ROUTES.learn = () => {
  const deck = studyKey();
  if (!session || session.deck !== deck || (remaining(session) === 0 && !session.history.length)) session = buildSession(deck);
  showCard();
};

function deckBar() {
  return `<a class="study-bar" href="#/pick"><span><span class="muted small">Uczysz się:</span><br><b>${esc(studySummary())}</b></span><span class="btn" style="min-height:36px;padding:6px 12px">Wybierz fiszki</span></a>`;
}
function bindDeckBar() {}

/* ---------- Wybór fiszek ---------- */
const PRESETS = [
  { label: 'Wszystko', cats: null },
  { label: 'Techniczne', cats: ['telecom', 'tech'] },
  { label: 'Praca + technika', cats: ['work', 'telecom', 'tech'] },
  { label: 'Podróże + zwroty', cats: ['travel', 'phrasal', 'colloc'] },
  { label: 'Moje talie', cats: 'custom' },
];
ROUTES.pick = () => {
  const s = study();
  const t = today();
  const catRows = Object.entries(CATS).map(([k, name]) => {
    const ws = WORDS.filter(w => w.cat === k && lvlOn(w.level));
    const fresh = ws.filter(w => !state.cards[w.id]).length;
    const due = ws.filter(w => state.cards[w.id] && state.cards[w.id].due <= t).length;
    return `<label class="check"><input type="checkbox" data-pc="${esc(k)}" ${catOn(k) ? 'checked' : ''}>
      <div class="txt"><div class="en">${esc(name)}${k.startsWith('u_') ? ' <span class="tag" style="font-size:.65rem">import</span>' : ''}</div>
      <div class="pl">${nSlow(ws.length)} · ${fresh} nowych · ${due} do powtórki</div></div>
      <a class="btn" href="#/deck/${encodeURIComponent(k)}" style="min-height:36px;padding:4px 10px" onclick="event.stopPropagation()">Zobacz</a></label>`;
  }).join('');
  const selWords = WORDS.filter(w => inDeck(w));
  view.innerHTML = `
    <header class="top">${backLink('#/learn', 'Fiszki')}<span class="muted small">Wybór fiszek</span></header>
    <p class="muted small">Zaznacz dowolne kategorie i poziomy. Podczas sesji słówka będą losowane ze wszystkich zaznaczonych.</p>
    <div class="chips">${PRESETS.map((p, i) => `<button class="filter" data-preset="${i}">${p.label}</button>`).join('')}</div>
    <section class="card">
      <h2>Poziomy</h2>
      <div class="row wrap">${LEVELS.map(l => `<button class="filter ${lvlOn(l) ? 'on' : ''}" data-pl="${l}">${l}</button>`).join('')}</div>
    </section>
    <h2 style="font-size:1.05rem;margin:4px 0 8px">Kategorie i talie</h2>
    <div class="list">${catRows}</div>
    <div class="row" style="margin:10px 0"><button class="btn" id="pall">Zaznacz wszystkie</button><button class="btn" id="pnone">Odznacz</button>
      <div class="spacer"></div><a class="btn" href="#/import">+ Import</a></div>
    <div class="sticky-cta">
      <div class="muted small">Wybrano ${nSlow(selWords.length)} · ${dueIds().length} do powtórki · ${newAvailable().left} nowych dziś</div>
      <a class="btn primary big block" href="#/learn" ${selWords.length ? '' : 'disabled'}>Ucz się tych fiszek</a>
    </div>`;
  const changed = () => { save(); session = null; ROUTES.pick(); };
  $$('[data-pc]').forEach(i => i.onchange = () => { s.cats[i.dataset.pc] = i.checked; changed(); });
  $$('[data-pl]').forEach(b => b.onclick = () => {
    const l = b.dataset.pl; s.levels[l] = !lvlOn(l);
    if (!LEVELS.some(lvlOn)) { s.levels[l] = true; toast('Zostaw przynajmniej jeden poziom'); }
    changed();
  });
  $$('[data-preset]').forEach(b => b.onclick = () => {
    const p = PRESETS[+b.dataset.preset];
    for (const k of Object.keys(CATS)) {
      s.cats[k] = p.cats === null ? true : p.cats === 'custom' ? k.startsWith('u_') : p.cats.includes(k);
    }
    if (p.cats === 'custom' && !Object.keys(CATS).some(k => k.startsWith('u_'))) { toast('Nie masz jeszcze własnych talii. Użyj importu.'); }
    changed();
  });
  $('#pall').onclick = () => { Object.keys(CATS).forEach(k => s.cats[k] = true); changed(); };
  $('#pnone').onclick = () => { Object.keys(CATS).forEach(k => s.cats[k] = false); changed(); };
};
const undoBtn = () => session && session.history.length
  ? `<button class="btn" id="undo" style="min-height:38px;padding:6px 12px">↶ Cofnij</button>` : '';

let waitTimer = null;
function showCard(force = false) {
  const s = session;
  clearTimeout(waitTimer);
  const st = pickNext(s, force);
  if (st === 'wait') {
    const mins = Math.max(1, Math.ceil((s.learn[0].dueAt - Date.now()) / 60000));
    view.innerHTML = `
      <header class="top"><h1>Fiszki</h1>${undoBtn()}</header>
      ${deckBar()}
      <section class="card center">
        <div class="done-emoji">⏳</div>
        <h2>Następna karta za ${mins} min</h2>
        <p class="muted">Słowa, których nie pamiętałeś, wracają po kilku minutach (kroki nauki). Możesz poczekać albo powtórzyć je od razu.</p>
        <button class="btn primary block" id="now">Pokaż teraz</button>
      </section>`;
    $('#now').onclick = () => showCard(true);
    if ($('#undo')) $('#undo').onclick = undo;
    waitTimer = setTimeout(() => { if (location.hash.startsWith('#/learn') && session === s) showCard(); }, Math.min(60000, s.learn[0].dueAt - Date.now() + 500));
    return;
  }
  if (st === 'done') {
    const doneAny = s.done > 0;
    view.innerHTML = `
      <header class="top"><h1>Fiszki</h1>${undoBtn()}</header>
      ${deckBar()}
      <section class="card center">
        <div class="done-emoji">${doneAny ? '🎉' : '☕'}</div>
        <h2>${doneAny ? 'Sesja ukończona!' : 'Brak słówek na teraz'}</h2>
        <p class="muted">${doneAny ? `Przerobione karty: ${s.done}.` : 'W tej talii wszystkie powtórki są zrobione, a dzienny limit nowych słów wyczerpany.'}
        Wybierz inną talię powyżej, poćwicz zdania albo zwiększ limit nowych słów w ustawieniach.</p>
        <div class="row wrap" style="justify-content:center;margin-bottom:12px">
          ${[10, 20, 50].map(n => `<button class="btn primary" data-more="${n}">+${n} nowych</button>`).join('')}
        </div>
        <div class="grid2">
          <a class="btn" href="#/build">Ułóż zdanie</a>
          <a class="btn" href="#/quiz">Quiz</a>
        </div>
        <p><a href="#/settings">Ustawienia limitu</a></p>
      </section>`;
    $$('[data-more]').forEach(b => b.onclick = () => addMoreNew(+b.dataset.more));
    bindDeckBar();
    if ($('#undo')) $('#undo').onclick = undo;
    return;
  }
  const item = s.cur;
  const w = BY_ID.get(item.id);
  const card = state.cards[item.id];
  const dirSetting = state.settings.direction;
  s.dir = dirSetting === 'mix' ? (item.isNew ? 'en-pl' : (Math.random() < 0.5 ? 'en-pl' : 'pl-en')) : dirSetting;
  s.revealed = false;
  s.shownAt = Date.now();
  const pct = Math.round((s.done / Math.max(1, s.done + remaining(s))) * 100);
  const stateTag = item.isNew ? 'NOWE · ' : card && (card.s === 'learning' || card.s === 'relearning') ? 'W NAUCE · ' : '';
  const front = s.dir === 'en-pl'
    ? `<div class="word">${esc(w.en)}</div>${w.ipa ? `<div class="ipa">/${esc(w.ipa)}/</div>` : ''}${speakBtn(w.en)}`
    : `<div class="word">${esc(plOf(w))}</div><div class="muted small">Jak to powiesz po angielsku?</div>`;
  view.innerHTML = `
    <header class="top"><h1>Fiszki</h1><span class="muted small">Zostało: ${remaining(s)}${s.learn.length ? ` (w nauce: ${s.learn.length})` : ''}</span></header>
    ${deckBar()}
    <div class="bar"><div style="width:${pct}%"></div></div>
    <div class="flash" id="flash">
      ${s.history.length ? `<button class="undo-corner" id="undo" aria-label="Cofnij do poprzedniego słowa">↶ Cofnij</button>` : ''}
      <span class="tag ${stateTag ? 'new' : ''}">${stateTag}${w.level} · ${esc(CATS[w.cat])}</span>
      ${front}
      <div id="back" hidden></div>
    </div>
    <div id="actions">
      ${item.isNew
        ? `<div class="grid2"><button class="btn big g2" id="known">Znam, pomiń</button><button class="btn primary big" id="reveal">Pokaż</button></div>
           <p class="muted small center" style="margin:8px 0 0">„Znam” usuwa słowo z nauki. Wróci za kilka miesięcy jako kontrola.</p>`
        : `<button class="btn primary big block" id="reveal">Pokaż odpowiedź</button>`}
    </div>`;
  if (s.dir === 'en-pl' && state.settings.autoSpeak) speak(w.en);
  bindDeckBar();
  if ($('#undo')) $('#undo').onclick = undo;
  if ($('#known')) $('#known').onclick = answerKnown;
  $('#reveal').onclick = reveal;
  $('#flash').onclick = e => { if (!e.target.closest('button') && !s.revealed) reveal(); };
}

function reveal() {
  const s = session;
  const item = s.cur;
  const w = BY_ID.get(item.id);
  s.revealed = true;
  const back = $('#back');
  back.hidden = false;
  back.innerHTML = `
    <div class="divider"></div>
    ${s.dir === 'en-pl'
      ? `<div class="trans">${esc(plOf(w))}</div>`
      : `<div class="word">${esc(w.en)}</div>${w.ipa ? `<div class="ipa">/${esc(w.ipa)}/</div>` : ''}<div class="row" style="justify-content:center">${speakBtn(w.en)}${slowBtn(w.en)}</div>`}
    ${w.ex ? `<div class="example">${esc(w.ex)}</div>${w.exPl ? `<div class="example-pl">${esc(w.exPl)}</div>` : ''}${speakBtn(w.ex, 'Zdanie')}` : ''}
    <button class="link-btn" id="edit">Popraw tłumaczenie</button>`;
  $('#edit').onclick = () => editTranslation(w, () => {
    const tr = $('#back .trans'); if (tr) tr.textContent = plOf(w);
  });
  if (s.dir === 'pl-en' && state.settings.autoSpeak) speak(w.en);
  const ivs = previewLabels(state.cards[w.id]);
  const labels = ['Nie wiem', 'Trudne', 'Dobrze', 'Łatwe'];
  $('#actions').innerHTML = `<div class="grades">${labels.map((l, g) =>
    `<button class="btn g${g}" data-g="${g}">${l}<small>${ivs[g]}</small></button>`).join('')}</div>
    <div class="card-tools">
      <button class="btn" id="known">Znam</button>
      <button class="btn" id="bury">Jutro</button>
      <button class="btn" id="suspend">Zawieś</button>
    </div>
    <p class="muted small center" style="margin:6px 0 0">Znam: wróci za kilka miesięcy · Jutro: odłóż do jutra · Zawieś: nie pokazuj, dopóki nie wznowisz (w Słówkach)</p>`;
  $$('#actions [data-g]').forEach(b => b.onclick = () => answer(+b.dataset.g));
  $('#known').onclick = answerKnown;
  $('#bury').onclick = () => setAside('bury');
  $('#suspend').onclick = () => setAside('suspend');
}

function addMoreNew(n) {
  // Jednorazowo zwiększa dzisiejszy limit nowych słów, bez zmiany ustawień.
  const t = today();
  if (!state.extraNew || state.extraNew.day !== t) state.extraNew = { day: t, n: 0 };
  state.extraNew.n += n;
  save();
  session = null;
  ROUTES.learn();
  if (remaining(session) === 0) toast('W tej talii nie ma już nowych słów');
}

function snapshot() {
  const s = session;
  const id = s.cur.id;
  const t = today();
  s.history.push({
    id,
    card: state.cards[id] ? JSON.stringify(state.cards[id]) : null,
    log: state.log[t] ? JSON.stringify(state.log[t]) : null,
    buried: state.buried[id], suspended: state.suspended[id],
    day: t,
    cur: Object.assign({}, s.cur),
    queue: s.queue.slice(),
    learn: s.learn.map(x => Object.assign({}, x)),
    done: s.done,
  });
  if (s.history.length > 30) s.history.shift();
}

function undo() {
  const s = session;
  const h = s && s.history.pop();
  if (!h) return;
  if (h.card) state.cards[h.id] = JSON.parse(h.card); else delete state.cards[h.id];
  if (h.log) state.log[h.day] = JSON.parse(h.log); else delete state.log[h.day];
  if (h.buried) state.buried[h.id] = h.buried; else delete state.buried[h.id];
  if (h.suspended) state.suspended[h.id] = h.suspended; else delete state.suspended[h.id];
  s.queue = h.queue; s.learn = h.learn; s.cur = h.cur; s.done = h.done;
  save();
  stopSpeech();
  showCard();
  toast('Cofnięto: ' + BY_ID.get(h.id).en);
}

const elapsedMs = s => Math.min(60000, Math.max(0, Date.now() - (s.shownAt || Date.now())));

function answer(g) {
  const s = session;
  snapshot();
  const item = s.cur;
  const c = grade(item.id, g, elapsedMs(s));
  s.cur = null;
  if (c.dueAt) s.learn.push({ id: item.id, dueAt: c.dueAt });
  s.done++;
  showCard();
}

// Dokłada kolejne nowe słowo, gdy pominięte nie powinno zabierać miejsca w limicie.
function topUpNew(s) {
  const inQueue = new Set([...s.queue.map(q => q.id), ...s.learn.map(q => q.id)]);
  const next = orderNew(newAvailable().pool).find(w => !inQueue.has(w.id));
  if (next) s.queue.push({ id: next.id, isNew: true });
}

function answerKnown() {
  const s = session;
  snapshot();
  const item = s.cur;
  markKnown(item.id, 60);
  s.cur = null;
  s.learn = s.learn.filter(q => q.id !== item.id);
  if (item.isNew) topUpNew(s);
  logActivity(item.isNew ? 'new' : 'review', true, { ms: elapsedMs(s) });
  save();
  s.done++;
  showCard();
}

function setAside(kind) {
  const s = session;
  snapshot();
  const item = s.cur;
  if (kind === 'bury') state.buried[item.id] = today() + 1;
  else state.suspended[item.id] = true;
  s.cur = null;
  s.learn = s.learn.filter(q => q.id !== item.id);
  if (item.isNew) topUpNew(s);
  save();
  toast(kind === 'bury' ? 'Odłożono do jutra' : 'Karta zawieszona. Wznowisz ją w zakładce Słówka.');
  showCard();
}

/* ================= Ćwiczenia (menu) ================= */
ROUTES.practice = () => {
  view.innerHTML = `
    <header class="top"><h1>Ćwiczenia</h1></header>
    <div class="grid2">
      <a class="tile" href="#/grammar"><span class="ico">📘</span><b>Gramatyka</b><span>${LESSONS.length} lekcji z ćwiczeniami, A2–C1</span></a>
      <a class="tile" href="#/build"><span class="ico">🧩</span><b>Ułóż zdanie</b><span>Przetłumacz zdanie z polskiego, układając klocki</span></a>
      <a class="tile" href="#/listen"><span class="ico">🎧</span><b>Ze słuchu</b><span>Posłuchaj zdania i ułóż je z klocków</span></a>
      <a class="tile" href="#/quiz"><span class="ico">✅</span><b>Quiz</b><span>Wybierz poprawne tłumaczenie</span></a>
      <a class="tile" href="#/placement"><span class="ico">📋</span><b>Test poziomu</b><span>Oznacz słowa, które znasz</span></a>
      <a class="tile" href="#/import"><span class="ico">📥</span><b>Import fiszek</b><span>Talie Anki, CSV albo własna lista</span></a>
      <a class="tile" href="#/pick"><span class="ico">🗂️</span><b>Wybór fiszek</b><span>Połącz kategorie i poziomy</span></a>
    </div>
    <section class="card" style="margin-top:14px">
      <h2>Wkrótce</h2>
      <p class="muted small">Wymowa z mikrofonem, uzupełnianie luk w zdaniach i dyktando to kolejne etapy.</p>
    </section>`;
};

/* ================= Układanie zdań ================= */
const tokenize = s => s.split(/\s+/).map(t => t.replace(/[.,!?;:]+$/, '')).filter(Boolean);
const normTok = t => t.toLowerCase().replace(/[’']/g, "'");

function builderScreen({ title, mode, promptHtml, target, extra, toolbar = '' }) {
  const tokens = tokenize(target);
  const targetSet = new Set(tokens.map(normTok));
  const distractPool = shuffle(SENTENCES.flatMap(x => tokenize(x.en))).filter(t => !targetSet.has(normTok(t)));
  const distract = [...new Set(distractPool)].slice(0, tokens.length > 7 ? 3 : 2);
  const bank = shuffle([...tokens, ...distract]).map((t, i) => ({ t, i }));
  const placed = [];
  view.innerHTML = `
    <header class="top">${backLink('#/practice', 'Ćwiczenia')}<span class="muted small">${title}</span></header>
    ${toolbar}
    <section class="card">
      ${promptHtml}
      <div class="answer-area" id="ans" aria-label="Twoja odpowiedź"></div>
      <div class="bank" id="bank">${bank.map(b => `<button class="chip" data-i="${b.i}">${esc(b.t)}</button>`).join('')}</div>
      <div id="fb"></div>
      <div class="row"><button class="btn" id="skip">Pomiń</button><div class="spacer"></div><button class="btn primary" id="check" disabled>Sprawdź</button></div>
    </section>`;
  const ans = $('#ans');
  const drawAns = () => {
    ans.innerHTML = placed.map(i => `<button class="chip" data-p="${i}">${esc(bank.find(b => b.i === i).t)}</button>`).join('');
    $('#check').disabled = placed.length === 0;
  };
  let checked = false;
  $('#bank').onclick = e => {
    const c = e.target.closest('[data-i]'); if (!c || checked || c.classList.contains('used')) return;
    c.classList.add('used'); placed.push(+c.dataset.i); drawAns();
  };
  ans.onclick = e => {
    const c = e.target.closest('[data-p]'); if (!c || checked) return;
    const i = +c.dataset.p; placed.splice(placed.indexOf(i), 1);
    $(`#bank [data-i="${i}"]`).classList.remove('used'); drawAns();
  };
  const next = () => ROUTES[mode]();
  $('#skip').onclick = next;
  $('#check').onclick = () => {
    if (checked) { next(); return; }
    checked = true;
    const given = placed.map(i => normTok(bank.find(b => b.i === i).t)).join(' ');
    const ok = given === tokens.map(normTok).join(' ');
    logActivity('ex', ok); save();
    $('#fb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'ko'}">
      <b>${ok ? 'Świetnie!' : 'Prawie. Poprawna odpowiedź:'}</b>
      <div class="row wrap">${esc(target)} ${speakBtn(target)}</div>${extra || ''}</div>`;
    $('#check').textContent = 'Dalej';
    $('#skip').hidden = true;
    speak(target);
  };
}

ROUTES.build = () => {
  const lvl = state.settings.buildLevel || 'all';
  const pool = SENTENCES.filter(s => lvl === 'all' || s.level === lvl);
  const s = pick(pool.length ? pool : SENTENCES);
  const chip = (v, label) => `<button class="filter ${lvl === v ? 'on' : ''}" data-bl="${v}">${label}</button>`;
  builderScreen({
    title: 'Ułóż zdanie',
    mode: 'build',
    target: s.en,
    toolbar: `<div class="chips">${chip('all', 'Wszystkie')}${LEVELS.map(l => chip(l, l)).join('')}</div>`,
    promptHtml: `<div class="muted small">Przetłumacz na angielski · ${s.level}</div><div class="prompt">${esc(s.pl)}</div>`,
  });
  $$('[data-bl]').forEach(b => b.onclick = () => { state.settings.buildLevel = b.dataset.bl; save(); ROUTES.build(); });
};

ROUTES.listen = () => {
  const ok = w => w.ex && tokenize(w.ex).length >= 4 && tokenize(w.ex).length <= 11;
  const seenPool = enabledWords().filter(w => state.cards[w.id] && ok(w));
  const pool = seenPool.length >= 10 ? seenPool : enabledWords().filter(ok);
  const w = pick(pool);
  builderScreen({
    title: 'Ze słuchu',
    mode: 'listen',
    target: w.ex,
    promptHtml: `<div class="muted small">Posłuchaj i ułóż zdanie:</div>
      <div class="row" style="margin:10px 0">${speakBtn(w.ex, 'Odtwórz')}${slowBtn(w.ex)}</div>`,
    extra: `${w.exPl ? `<div class="small" style="margin-top:6px">${esc(w.exPl)}</div>` : ''}
      <div class="small muted" style="margin-top:6px">Słowo: <b>${esc(w.en)}</b> – ${esc(plOf(w))}</div>`,
  });
  setTimeout(() => speak(w.ex), 300);
};

/* ================= Quiz ================= */
let quiz = null;
ROUTES.quiz = () => {
  const seen = enabledWords().filter(w => state.cards[w.id]);
  const base = seen.length >= 12 ? seen : enabledWords().filter(w => ['A1', 'A2', 'B1', 'B2'].includes(w.level));
  quiz = { qs: shuffle(base).slice(0, 10), i: 0, score: 0 };
  quizQuestion();
};
function quizQuestion() {
  const q = quiz;
  if (q.i >= q.qs.length) {
    logActivity('ex', false); save();
    view.innerHTML = `
      <header class="top">${backLink('#/practice', 'Ćwiczenia')}</header>
      <section class="card center">
        <div class="done-emoji">${q.score >= 8 ? '🏆' : q.score >= 5 ? '👍' : '💪'}</div>
        <h2>Wynik: ${q.score} / ${q.qs.length}</h2>
        <p class="muted">Błędnie zaznaczone słowa wrócą szybciej w fiszkach.</p>
        <div class="grid2"><a class="btn primary" href="#/quiz" id="again">Jeszcze raz</a><a class="btn" href="#/learn">Fiszki</a></div>
      </section>`;
    $('#again').onclick = e => { e.preventDefault(); ROUTES.quiz(); };
    return;
  }
  const w = q.qs[q.i];
  const enToPl = Math.random() < 0.5;
  const sameCat = shuffle(WORDS.filter(x => x.id !== w.id && x.cat === w.cat));
  const others = shuffle(WORDS.filter(x => x.id !== w.id && x.cat !== w.cat));
  const wrong = [...sameCat, ...others].filter(x => (enToPl ? x.pl !== w.pl : x.en !== w.en)).slice(0, 3);
  const opts = shuffle([w, ...wrong]);
  view.innerHTML = `
    <header class="top">${backLink('#/practice', 'Ćwiczenia')}<span class="muted small">Pytanie ${q.i + 1} / ${q.qs.length}</span></header>
    <div class="bar"><div style="width:${(q.i / q.qs.length) * 100}%"></div></div>
    <section class="card center" style="margin-top:14px">
      <div class="muted small">${enToPl ? 'Co to znaczy?' : 'Jak to jest po angielsku?'}</div>
      <div class="word" style="margin:8px 0">${esc(enToPl ? w.en : plOf(w))}</div>
      ${enToPl ? speakBtn(w.en) : ''}
    </section>
    <div class="options">${opts.map(o => `<button class="btn option" data-id="${esc(o.id)}">${esc(enToPl ? plOf(o) : o.en)}</button>`).join('')}</div>
    <div id="fb" style="margin-top:12px"></div>`;
  if (enToPl && state.settings.autoSpeak) speak(w.en);
  let answered = false;
  $$('.option').forEach(b => b.onclick = () => {
    if (answered) return;
    answered = true;
    const ok = b.dataset.id === w.id;
    if (ok) q.score++;
    b.classList.add(ok ? 'right' : 'wrong');
    $$('.option').find(x => x.dataset.id === w.id).classList.add('right');
    // Błąd w quizie = słowo wraca do powtórki dziś.
    if (!ok && state.cards[w.id]) { state.cards[w.id].due = today(); }
    logActivity('ex', ok); save();
    if (!enToPl) speak(w.en);
    $('#fb').innerHTML = `${w.ex ? `<p class="example">${esc(w.ex)}</p>` : ''}<button class="btn primary block big" id="next">Dalej</button>`;
    $('#next').onclick = () => { q.i++; quizQuestion(); };
  });
}

/* ================= Test poziomu ================= */
ROUTES.placement = level => {
  if (!level || !LEVELS.includes(level)) {
    view.innerHTML = `
      <header class="top">${backLink('#/practice', 'Ćwiczenia')}<span class="muted small">Test poziomu</span></header>
      <section class="card">
        <h2>Oznacz słowa, które znasz</h2>
        <p class="muted small">Wybierz poziom. Pokażę po 30 słów: zaznacz te, które znasz na pewno. Niezaznaczone trafią do nauki.
        Warto przejść też niższe poziomy, bo zawsze trafią się luki.</p>
      </section>
      <div class="list">${LEVELS.map(l => {
        const all = enabledWords().filter(w => w.level === l);
        const doneN = all.filter(w => state.cards[w.id] || state.placed[w.id]).length;
        return `<a class="item" href="#/placement/${l}" style="text-decoration:none;color:inherit">
          <div class="txt"><div class="en">Poziom ${l}</div><div class="pl">${doneN} / ${all.length} sprawdzonych</div>
          <div class="bar" style="margin-top:6px"><div style="width:${all.length ? (doneN / all.length) * 100 : 0}%"></div></div></div><span>›</span></a>`;
      }).join('')}</div>`;
    return;
  }
  const batch = shuffle(enabledWords().filter(w => w.level === level && !state.cards[w.id] && !state.placed[w.id])).slice(0, 30);
  if (batch.length === 0) {
    view.innerHTML = `
      <header class="top">${backLink('#/placement', 'Poziomy')}</header>
      <section class="card center"><div class="done-emoji">✅</div><h2>Poziom ${level} sprawdzony</h2>
      <p class="muted">Wszystkie słowa z tego poziomu są oznaczone albo już w nauce.</p>
      <a class="btn primary" href="#/placement">Wybierz inny poziom</a></section>`;
    return;
  }
  view.innerHTML = `
    <header class="top">${backLink('#/placement', 'Poziomy')}<span class="muted small">Poziom ${level}</span></header>
    <p class="muted small">Zaznacz słowa, które znasz na pewno, czyli wiesz, co znaczą, i umiesz ich użyć.</p>
    <div class="list" id="plist">${batch.map(w => `
      <label class="check"><input type="checkbox" value="${esc(w.id)}">
        <div class="txt"><div class="en">${esc(w.en)}</div><div class="pl">${esc(plOf(w))}</div></div>
        ${speakBtn(w.en)}</label>`).join('')}</div>
    <div class="row" style="margin-top:14px">
      <button class="btn" id="all">Zaznacz wszystkie</button><div class="spacer"></div>
      <button class="btn primary" id="savep">Zapisz i dalej</button>
    </div>`;
  $('#all').onclick = () => $$('#plist input').forEach(i => i.checked = true);
  $('#savep').onclick = () => {
    let known = 0;
    $$('#plist input').forEach(i => {
      if (i.checked) { markKnown(i.value); known++; } else state.placed[i.value] = 1;
    });
    save();
    toast(`Znane: ${known}, do nauki: ${batch.length - known}`);
    ROUTES.placement(level);
    window.scrollTo(0, 0);
  };
};

/* ================= Lista słówek ================= */
const wordsFilter = { level: 'all', cat: 'all', q: '', st: 'all' };
ROUTES.words = () => {
  const chip = (group, val, label) => `<button class="filter ${wordsFilter[group] === val ? 'on' : ''}" data-g="${group}" data-v="${val}">${label}</button>`;
  view.innerHTML = `
    <header class="top"><div><h1>Słówka</h1><span class="muted small">${WORDS.length} w bazie</span></div>
      <div class="row"><a class="btn" href="#/decks">Talie</a><a class="btn" href="#/import">+ Import</a></div></header>
    <input class="search" id="q" type="search" placeholder="Szukaj po angielsku lub polsku…" value="${esc(wordsFilter.q)}">
    <div class="chips">${chip('level', 'all', 'Wszystkie poziomy')}${LEVELS.map(l => chip('level', l, l)).join('')}</div>
    <div class="chips">${chip('cat', 'all', 'Wszystkie kategorie')}${Object.entries(CATS).map(([k, v]) => chip('cat', k, v)).join('')}</div>
    <div class="chips">${chip('st', 'all', 'Każdy status')}${chip('st', 'new', 'Nowe')}${chip('st', 'learn', 'W nauce')}${chip('st', 'done', 'Opanowane / znane')}${chip('st', 'susp', 'Zawieszone')}</div>
    <div class="muted small" id="count" style="margin:4px 0 8px"></div>
    <div class="list" id="wlist"></div>`;
  $$('.filter').forEach(b => b.onclick = () => { wordsFilter[b.dataset.g] = b.dataset.v; ROUTES.words(); });
  $('#q').oninput = e => { wordsFilter.q = e.target.value; wordsLimit = 150; drawWordList(); };
  wordsLimit = 150;
  drawWordList();
};
let wordsLimit = 150;
function drawWordList() {
  const q = wordsFilter.q.trim().toLowerCase();
  const list = WORDS.filter(w => {
    if (wordsFilter.level !== 'all' && w.level !== wordsFilter.level) return false;
    if (wordsFilter.cat !== 'all' && w.cat !== wordsFilter.cat) return false;
    const st = status(w.id);
    if (wordsFilter.st === 'new' && st !== 'new') return false;
    if (wordsFilter.st === 'learn' && !['learning', 'review'].includes(st)) return false;
    if (wordsFilter.st === 'done' && !['mastered', 'known'].includes(st)) return false;
    if (wordsFilter.st === 'susp' && st !== 'suspended') return false;
    return !q || w.en.toLowerCase().includes(q) || plOf(w).toLowerCase().includes(q);
  });
  if (q) list.sort((a, b) => (b.en.toLowerCase() === q) - (a.en.toLowerCase() === q) || (b.en.toLowerCase().startsWith(q)) - (a.en.toLowerCase().startsWith(q)));
  $('#count').textContent = `Znaleziono: ${list.length}`;
  renderWordItems($('#wlist'), list, wordsLimit, () => { wordsLimit += 300; drawWordList(); }, drawWordList);
}

const dueLabel = c => {
  if (!c) return '';
  if (c.dueAt && c.dueAt > Date.now()) return 'powtórka za ' + Math.max(1, Math.round((c.dueAt - Date.now()) / 60000)) + ' min';
  const d = (c.due ?? today()) - today();
  return d <= 0 ? 'do powtórki dziś' : d === 1 ? 'powtórka jutro' : `powtórka za ${ivLabel(d)}`;
};
function wordItemHtml(w) {
  const st = status(w.id);
  const c = state.cards[w.id];
  return `<div class="item" data-id="${esc(w.id)}"><span class="dot ${st}" title="${STATUS_PL[st]}"></span>
    <div class="txt"><div class="en">${esc(w.en)} <span class="muted small">· ${w.level}${w.ipa ? ' · /' + esc(w.ipa) + '/' : ''}</span></div><div class="pl">${esc(plOf(w))}</div>
    <div class="ex">${w.ex ? `${esc(w.ex)}${w.exPl ? `<br>${esc(w.exPl)}` : ''}<br>` : ''}
      <span class="small">Status: ${STATUS_PL[st]}${c && st !== 'suspended' ? ' · ' + dueLabel(c) : ''}${c && c.lapses ? ` · pomyłek: ${c.lapses}` : ''}</span><br>
      <button class="link-btn" data-edit="${esc(w.id)}">Popraw tłumaczenie</button>
      <button class="link-btn" data-susp="${esc(w.id)}">${st === 'suspended' ? 'Wznów kartę' : 'Zawieś kartę'}</button>
      ${c ? `<button class="link-btn" data-reset="${esc(w.id)}">Ucz od nowa</button>` : ''}
      ${w.custom ? `<button class="link-btn" data-wdel="${esc(w.id)}" style="color:var(--bad)">Usuń z talii</button>` : ''}</div></div>${speakBtn(w.en)}</div>`;
}
// Wspólna lista słów (Słówka i widok talii): stronicowanie i akcje na słowie.
function renderWordItems(el, list, limit, onMore, redraw) {
  const shown = list.slice(0, limit);
  el.innerHTML = shown.length ? shown.map(wordItemHtml).join('') +
    (list.length > limit ? `<button class="btn block" data-more-words style="border:0;border-top:1px solid var(--border);border-radius:0">Pokaż więcej (${list.length - limit})</button>` : '')
    : '<div class="item muted">Brak słów</div>';
  el.onclick = e => {
    if (e.target.closest('[data-more-words]')) { onMore(); return; }
    const ed = e.target.closest('[data-edit]');
    if (ed) { editTranslation(BY_ID.get(ed.dataset.edit), redraw); return; }
    const su = e.target.closest('[data-susp]');
    if (su) {
      const id = su.dataset.susp;
      if (state.suspended[id]) { delete state.suspended[id]; toast('Karta wznowiona'); }
      else { state.suspended[id] = true; toast('Karta zawieszona'); }
      save(); session = null; redraw(); return;
    }
    const rs = e.target.closest('[data-reset]');
    if (rs) {
      if (!confirm('Zacząć naukę tego słowa od nowa? Historia powtórek tej karty zostanie usunięta.')) return;
      delete state.cards[rs.dataset.reset]; delete state.buried[rs.dataset.reset];
      save(); session = null; toast('Słowo wróci jako nowe'); redraw(); return;
    }
    const wd = e.target.closest('[data-wdel]');
    if (wd) {
      const w = BY_ID.get(wd.dataset.wdel);
      if (!w || !confirm(`Usunąć „${w.en}” z talii?`)) return;
      const d = custom.decks[w.cat];
      if (d) d.words = d.words.filter(x => x.en.toLowerCase() !== w.en.toLowerCase());
      delete state.cards[w.id]; delete state.suspended[w.id];
      saveCustom(); applyCustom(); save(); session = null; toast('Usunięto słowo'); redraw(); return;
    }
    const it = e.target.closest('.item');
    if (it && !e.target.closest('button')) it.classList.toggle('open');
  };
}

/* ================= Talie ================= */
function deckStats(cat) {
  const ws = WORDS.filter(w => w.cat === cat);
  const c = { total: ws.length, new: 0, learning: 0, review: 0, done: 0, susp: 0, due: 0 };
  const t = today();
  for (const w of ws) {
    const st = status(w.id);
    if (st === 'new') c.new++;
    else if (st === 'learning') c.learning++;
    else if (st === 'review') c.review++;
    else if (st === 'suspended') c.susp++;
    else c.done++;
    const card = state.cards[w.id];
    if (card && !isBlocked(w.id) && (card.due ?? t) <= t) c.due++;
  }
  return c;
}
ROUTES.decks = () => {
  const rows = Object.entries(CATS).map(([k, name]) => {
    const s = deckStats(k);
    const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
    return `<a class="item" href="#/deck/${encodeURIComponent(k)}" style="text-decoration:none;color:inherit">
      <div class="txt"><div class="en">${esc(name)}${k.startsWith('u_') ? ' <span class="tag" style="font-size:.65rem">moja</span>' : ''}</div>
      <div class="pl">${nSlow(s.total)} · ${s.new} nowych · ${s.due} do powtórki · ${pct}% opanowane</div>
      <div class="bar" style="margin-top:6px"><div style="width:${pct}%"></div></div></div><span>›</span></a>`;
  }).join('');
  view.innerHTML = `
    <header class="top">${backLink('#/words', 'Słówka')}<a class="btn" href="#/import">+ Import</a></header>
    <h1 style="margin-bottom:12px">Talie</h1>
    <div class="list">${rows}</div>`;
};

const deckView = { q: '', st: 'all', limit: 150 };
ROUTES.deck = id => {
  if (!CATS[id]) { location.hash = '#/decks'; return; }
  const isCustom = id.startsWith('u_');
  const s = deckStats(id);
  const chip = (val, label) => `<button class="filter ${deckView.st === val ? 'on' : ''}" data-dst="${val}">${label}</button>`;
  view.innerHTML = `
    <header class="top">${backLink('#/decks', 'Talie')}<span class="muted small">${isCustom ? 'Moja talia' : 'Talia wbudowana'}</span></header>
    <h1 style="margin-bottom:10px;overflow-wrap:anywhere">${esc(CATS[id])}</h1>
    <div class="kpis" style="margin-top:0;grid-template-columns:repeat(4,1fr)">
      <div class="kpi"><b>${s.total}</b><span>${nSlow(s.total).split(' ')[1]}</span></div>
      <div class="kpi"><b>${s.new}</b><span>nowe</span></div>
      <div class="kpi"><b>${s.due}</b><span>do powtórki</span></div>
      <div class="kpi"><b>${s.done}</b><span>opanowane</span></div>
    </div>
    <button class="btn primary block big" id="dlearn">Ucz się tylko tej talii</button>
    ${isCustom ? `<div class="card-tools" style="margin:10px 0 0">
      <button class="btn" id="drename">Zmień nazwę</button>
      <button class="btn" id="dexport">Eksport</button>
      <button class="btn" id="ddelete" style="color:var(--bad)">Usuń talię</button></div>` : ''}
    <input class="search" id="dq" type="search" placeholder="Szukaj w tej talii…" value="${esc(deckView.q)}" style="margin-top:14px">
    <div class="chips">${chip('all', 'Wszystkie')}${chip('new', 'Nowe')}${chip('learn', 'W nauce')}${chip('done', 'Opanowane')}${chip('susp', 'Zawieszone')}</div>
    <div class="muted small" id="dcount" style="margin:4px 0 8px"></div>
    <div class="list" id="dlist"></div>
    ${isCustom ? `<a class="btn block" href="#/import" style="margin-top:10px">+ Dodaj słowa do talii</a>` : ''}`;
  const draw = () => {
    const q = deckView.q.trim().toLowerCase();
    const list = WORDS.filter(w => {
      if (w.cat !== id) return false;
      const st = status(w.id);
      if (deckView.st === 'new' && st !== 'new') return false;
      if (deckView.st === 'learn' && !['learning', 'review'].includes(st)) return false;
      if (deckView.st === 'done' && !['mastered', 'known'].includes(st)) return false;
      if (deckView.st === 'susp' && st !== 'suspended') return false;
      return !q || w.en.toLowerCase().includes(q) || plOf(w).toLowerCase().includes(q);
    });
    $('#dcount').textContent = `Pokazano: ${Math.min(list.length, deckView.limit)} z ${list.length}`;
    renderWordItems($('#dlist'), list, deckView.limit, () => { deckView.limit += 300; draw(); }, () => ROUTES.deck(id));
  };
  $('#dq').oninput = e => { deckView.q = e.target.value; deckView.limit = 150; draw(); };
  $$('[data-dst]').forEach(b => b.onclick = () => { deckView.st = b.dataset.dst; deckView.limit = 150; ROUTES.deck(id); });
  $('#dlearn').onclick = () => {
    const st = study();
    Object.keys(CATS).forEach(k => st.cats[k] = k === id);
    LEVELS.forEach(l => st.levels[l] = true);
    save(); session = null; location.hash = '#/learn';
  };
  if (isCustom) {
    $('#drename').onclick = () => {
      const n = prompt('Nowa nazwa talii:', custom.decks[id].name);
      if (!n || !n.trim()) return;
      custom.decks[id].name = n.trim(); saveCustom(); applyCustom(); ROUTES.deck(id);
    };
    $('#dexport').onclick = () => exportDeckTsv(id);
    $('#ddelete').onclick = () => {
      if (!confirm(`Usunąć talię „${custom.decks[id].name}”? Postęp jej fiszek też zniknie.`)) return;
      for (const cid of Object.keys(state.cards)) if (cid.startsWith(id + ':')) delete state.cards[cid];
      delete custom.decks[id]; delete study().cats[id];
      saveCustom(); applyCustom(); save(); session = null; location.hash = '#/decks';
    };
  }
  draw();
};
function exportDeckTsv(id) {
  const dd = custom.decks[id];
  const tsv = '#separator:tab\n#html:false\n' + dd.words.map(x => [x.en, x.pl, x.ex || ''].map(v => v.replace(/[\t\n]/g, ' ')).join('\t')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([tsv], { type: 'text/tab-separated-values' }));
  a.download = dd.name.replace(/[^\w\-ąćęłńóśźż ]+/gi, '') + '.txt';
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ================= Gramatyka ================= */
const LESSONS = typeof GRAMMAR !== 'undefined' ? GRAMMAR : [];
const LESSON_BY_ID = new Map(LESSONS.map(l => [l.id, l]));
const gstate = id => state.grammar[id] || (state.grammar[id] = { best: 0, last: 0, done: 0, wrong: [] });

function normAns(s) {
  let t = String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[.!?]+$/g, '').replace(/,/g, ' ');
  // Klawiatury w telefonach często gubią apostrof: dont -> don't, ive -> i've.
  t = t.replace(/\b(do|does|did|is|are|was|were|have|has|had|could|would|should|must|need)nt\b/g, "$1n't")
    .replace(/\bwont\b/g, "won't").replace(/\bcant\b/g, "can't")
    .replace(/\bim\b/g, "i'm").replace(/\bive\b/g, "i've").replace(/\b(you|they)re\b/g, "$1're").replace(/\b(you|they|we)ve\b/g, "$1've");
  t = t.replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot').replace(/\bcan not\b/g, 'cannot')
    .replace(/\bshan't\b/g, 'shall not').replace(/n't\b/g, ' not')
    .replace(/'m\b/g, ' am').replace(/'re\b/g, ' are').replace(/'ve\b/g, ' have').replace(/'ll\b/g, ' will');
  return t.replace(/\s+/g, ' ').trim();
}
const answerOk = (given, answers) => answers.some(a => normAns(a) === normAns(given));
const blankCount = q => (q.match(/___/g) || []).length;
function fillBlanks(q, parts) {
  let i = 0;
  return q.replace(/___(\s*\([^)]*\))?/g, () => parts[i++] ?? '___');
}
// Pełne poprawne zdanie (do wyświetlenia i odsłuchu), jeśli da się je zbudować.
function correctSentence(ex) {
  const [type, q] = ex;
  if (type === 'c') return fillBlanks(q, ex[2][ex[3]].split(' / '));
  if (type === 'g') return blankCount(q) === 1 ? fillBlanks(q, [ex[2][0]]) : null;
  if (type === 'f') return ex[2][0];
  if (type === 'o') return ex[2];
  return null;
}

ROUTES.grammar = () => {
  const wrongTotal = LESSONS.reduce((a, l) => a + ((state.grammar[l.id] && state.grammar[l.id].wrong.length) || 0), 0);
  const doneN = LESSONS.filter(l => (state.grammar[l.id] || {}).best >= 80).length;
  const next = LESSONS.find(l => ['B1', 'B2'].includes(l.level) && !((state.grammar[l.id] || {}).best >= 80))
    || LESSONS.find(l => !((state.grammar[l.id] || {}).best >= 80));
  const byLevel = LEVELS.map(lv => [lv, LESSONS.filter(l => l.level === lv)]).filter(([, ls]) => ls.length);
  view.innerHTML = `
    <header class="top">${backLink('#/practice', 'Ćwiczenia')}<span class="muted small">${doneN} / ${LESSONS.length} opanowanych</span></header>
    <h1 style="margin-bottom:12px">Gramatyka</h1>
    ${next ? `<a class="card" href="#/glesson/${next.id}" style="display:block;text-decoration:none;color:inherit">
      <div class="muted small">Polecana lekcja · ${next.level}</div><h2 style="margin:4px 0 0">${esc(next.title)}</h2></a>` : ''}
    ${wrongTotal ? `<button class="btn block" id="gmist" style="margin-bottom:14px">Powtórz błędy (${wrongTotal})</button>` : ''}
    ${byLevel.map(([lv, ls]) => `
      <h2 style="font-size:1rem;margin:14px 0 8px">Poziom ${lv}</h2>
      <div class="list">${ls.map(l => {
        const g = state.grammar[l.id];
        const badge = !g || !g.done ? '<span class="muted small">nowa</span>'
          : `<span class="small" style="color:${g.best >= 80 ? 'var(--good)' : 'var(--warn)'};font-weight:700">${g.best}%</span>`;
        return `<a class="item" href="#/glesson/${l.id}" style="text-decoration:none;color:inherit">
          <div class="txt"><div class="en">${esc(l.title)}</div><div class="pl">${l.ex.length} ćwiczeń${g && g.wrong.length ? ` · błędy do powtórki: ${g.wrong.length}` : ''}</div></div>${badge}</a>`;
      }).join('')}</div>`).join('')}`;
  if ($('#gmist')) $('#gmist').onclick = () => startGrammarRun(null);
};

ROUTES.glesson = id => {
  const l = LESSON_BY_ID.get(id);
  if (!l) { location.hash = '#/grammar'; return; }
  const g = state.grammar[id];
  view.innerHTML = `
    <header class="top">${backLink('#/grammar', 'Gramatyka')}<span class="muted small">${l.level}</span></header>
    <h1 style="margin-bottom:12px">${esc(l.title)}</h1>
    <section class="card lesson">${l.intro}</section>
    ${g && g.done ? `<p class="muted small">Najlepszy wynik: ${g.best}% · podejść: ${g.done}</p>` : ''}
    <div class="sticky-cta"><button class="btn primary big block" id="gstart">Ćwicz (${l.ex.length} zadań)</button></div>`;
  $('#gstart').onclick = () => startGrammarRun(id);
};

let grun = null;
function startGrammarRun(lessonId) {
  let items;
  if (lessonId) items = shuffle(LESSON_BY_ID.get(lessonId).ex.map((_, i) => ({ lid: lessonId, i })));
  else items = shuffle(LESSONS.flatMap(l => ((state.grammar[l.id] || {}).wrong || []).map(i => ({ lid: l.id, i })))).slice(0, 20);
  if (!items.length) { toast('Brak zadań'); return; }
  grun = { lessonId, items, pos: 0, score: 0, wrong: [] };
  if (location.hash === '#/gpractice') showGrammarItem(); else location.hash = '#/gpractice';
}
ROUTES.gpractice = () => { if (!grun) { location.hash = '#/grammar'; return; } showGrammarItem(); };

function showGrammarItem() {
  const r = grun;
  if (r.pos >= r.items.length) return showGrammarResult();
  const { lid, i } = r.items[r.pos];
  const ex = LESSON_BY_ID.get(lid).ex[i];
  const [type, q] = ex;
  const head = `
    <header class="top">${backLink(r.lessonId ? '#/glesson/' + r.lessonId : '#/grammar', r.lessonId ? 'Lekcja' : 'Gramatyka')}<span class="muted small">${r.pos + 1} / ${r.items.length}</span></header>
    <div class="bar"><div style="width:${(r.pos / r.items.length) * 100}%"></div></div>`;
  const label = { c: 'Wybierz poprawną odpowiedź', g: 'Uzupełnij lukę', f: 'Popraw błąd w zdaniu', o: 'Ułóż zdanie po angielsku' }[type];
  let body = '';
  let order = null;
  if (type === 'c') {
    order = shuffle(ex[2].map((_, k) => k));
    body = `<div class="prompt">${esc(q)}</div><div class="options">${order.map(k => `<button class="btn option" data-k="${k}">${esc(ex[2][k])}</button>`).join('')}</div>`;
  } else if (type === 'g') {
    body = `<div class="prompt">${esc(q)}</div>
      <input class="input" id="gin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${blankCount(q) > 1 ? 'Wpisz brakujące słowa po kolei' : 'Wpisz brakujące słowa'}">`;
  } else if (type === 'f') {
    body = `<div class="prompt" style="text-decoration:line-through;text-decoration-color:var(--bad)">${esc(q)}</div>
      <textarea class="area" id="gin" style="min-height:80px" autocapitalize="sentences" spellcheck="false">${esc(q)}</textarea>`;
  } else if (type === 'o') {
    body = `<div class="prompt">${esc(q)}</div><div class="answer-area" id="gans"></div><div class="bank" id="gbank"></div>`;
  }
  view.innerHTML = `${head}
    <section class="card" style="margin-top:14px">
      <div class="muted small">${label}</div>
      ${body}
      <div id="gfb"></div>
      <div class="row" style="margin-top:12px"><div class="spacer"></div><button class="btn primary" id="gcheck">Sprawdź</button></div>
    </section>`;
  let checked = false;
  const finish = (ok, givenText) => {
    checked = true;
    if (ok) r.score++; else r.wrong.push({ lid, i });
    const gs = gstate(lid);
    if (ok) gs.wrong = gs.wrong.filter(x => x !== i);
    else if (!gs.wrong.includes(i)) gs.wrong.push(i);
    logActivity('ex', ok);
    save();
    const correct = correctSentence(ex);
    const answers = type === 'c' ? [ex[2][ex[3]]] : type === 'o' ? [ex[2]] : ex[2];
    const why = type === 'c' ? ex[4] : ex[3];
    $('#gfb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'ko'}">
      <b>${ok ? 'Dobrze!' : 'Niestety nie.'}</b>
      ${!ok && givenText ? `<div class="small">Twoja odpowiedź: ${esc(givenText)}</div>` : ''}
      ${correct ? `<div class="row wrap" style="margin-top:4px">${esc(correct)} ${speakBtn(correct)}</div>` : `<div>Poprawnie: ${answers.map(esc).join(' / ')}</div>`}
      ${why ? `<div class="small" style="margin-top:6px">${esc(why)}</div>` : ''}</div>`;
    $('#gcheck').textContent = r.pos + 1 < r.items.length ? 'Dalej' : 'Wynik';
    $('#gcheck').disabled = false;
    if (correct && state.settings.autoSpeak) speak(correct);
  };
  const next = () => { r.pos++; showGrammarItem(); };
  if (type === 'c') {
    $('#gcheck').hidden = true;
    $$('.option').forEach(b => b.onclick = () => {
      if (checked) return;
      const k = +b.dataset.k;
      const ok = k === ex[3];
      b.classList.add(ok ? 'right' : 'wrong');
      $(`.option[data-k="${ex[3]}"]`).classList.add('right');
      $('#gcheck').hidden = false;
      finish(ok, ok ? '' : ex[2][k]);
    });
  } else if (type === 'g' || type === 'f') {
    const inp = $('#gin');
    inp.focus();
    inp.onkeydown = e => { if (e.key === 'Enter' && type === 'g') { e.preventDefault(); $('#gcheck').click(); } };
  } else if (type === 'o') {
    const toks = tokenize(ex[2]);
    const bank = shuffle(toks.map((t, k) => ({ t, k })));
    const placed = [];
    const draw = () => {
      $('#gbank').innerHTML = bank.map(b => `<button class="chip ${placed.includes(b.k) ? 'used' : ''}" data-k="${b.k}">${esc(b.t)}</button>`).join('');
      $('#gans').innerHTML = placed.map(k => `<button class="chip" data-p="${k}">${esc(toks[k])}</button>`).join('');
    };
    draw();
    $('#gbank').onclick = e => { const c = e.target.closest('[data-k]'); if (!c || checked || placed.includes(+c.dataset.k)) return; placed.push(+c.dataset.k); draw(); };
    $('#gans').onclick = e => { const c = e.target.closest('[data-p]'); if (!c || checked) return; placed.splice(placed.indexOf(+c.dataset.p), 1); draw(); };
    r.orderPlaced = () => placed.map(k => toks[k]).join(' ');
  }
  $('#gcheck').onclick = () => {
    if (checked) { next(); return; }
    if (type === 'g' || type === 'f') {
      const v = $('#gin').value.trim();
      if (!v) { toast('Wpisz odpowiedź'); return; }
      let ok = answerOk(v, ex[2]);
      // Przy dwóch lukach akceptujemy też same brakujące słowa w kolejności.
      if (!ok && type === 'g' && blankCount(q) > 1) ok = ex[2].some(a => normAns(a).split(' ').join(' ') === normAns(v));
      finish(ok, ok ? '' : v);
    } else if (type === 'o') {
      const v = r.orderPlaced();
      if (!v) { toast('Ułóż zdanie z klocków'); return; }
      finish(normAns(v) === normAns(tokenize(ex[2]).join(' ')), v);
    }
  };
}

function showGrammarResult() {
  const r = grun;
  const pct = Math.round((r.score / r.items.length) * 100);
  if (r.lessonId) {
    const gs = gstate(r.lessonId);
    gs.best = Math.max(gs.best || 0, pct); gs.last = pct; gs.done = (gs.done || 0) + 1; gs.at = today();
    save();
  }
  view.innerHTML = `
    <header class="top">${backLink('#/grammar', 'Gramatyka')}</header>
    <section class="card center">
      <div class="done-emoji">${pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
      <h2>Wynik: ${r.score} / ${r.items.length} (${pct}%)</h2>
      <p class="muted">${pct >= 80 ? 'Temat opanowany. Wróć do niego za jakiś czas, żeby utrwalić.' : 'Przeczytaj jeszcze raz wyjaśnienie i spróbuj ponownie. Błędne zadania trafiły do „Powtórz błędy”.'}</p>
      <div class="grid2">
        ${r.lessonId ? `<a class="btn" href="#/glesson/${r.lessonId}">Wyjaśnienie</a>` : `<a class="btn" href="#/grammar">Lekcje</a>`}
        <button class="btn primary" id="gagain">${r.lessonId ? 'Jeszcze raz' : 'Powtórz błędy'}</button>
      </div>
    </section>`;
  $('#gagain').onclick = () => startGrammarRun(r.lessonId);
}

/* ================= Import fiszek ================= */
let importDraft = null; // { name, rows: [[...pola]], colEn, colPl, colEx, level, target }

function cleanField(s) {
  if (s == null) return '';
  let t = String(s)
    .replace(/\[sound:[^\]]*\]/g, ' ')
    .replace(/<br\s*\/?>|<\/div>|<\/p>|<\/li>/gi, ' ')
    .replace(/<[^>]+>/g, '');
  const ta = document.createElement('textarea');
  ta.innerHTML = t;
  return ta.value.replace(/\s+/g, ' ').trim();
}
function splitLine(line, sep) {
  if (sep === '\t' && !line.includes('"')) return line.split('\t');
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c;
    } else if (c === '"' && cur === '') q = true;
    else if (line.startsWith(sep, i)) { out.push(cur); cur = ''; i += sep.length - 1; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
function parseTextCards(txt) {
  const lines = txt.replace(/\r/g, '').split('\n').filter(l => l.trim() && !l.startsWith('#'));
  if (!lines.length) return [];
  const share = ch => lines.filter(l => l.includes(ch)).length / lines.length;
  const sep = share('\t') >= 0.5 ? '\t' : share(' | ') >= 0.5 ? ' | ' : share(';') >= 0.5 ? ';' : share(' - ') >= 0.5 ? ' - ' : share(' = ') >= 0.5 ? ' = ' : ',';
  return lines.map(l => splitLine(l, sep).map(cleanField)).filter(f => f.length >= 2 && f[0] && f[1]);
}
function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('Nie udało się pobrać ' + src));
    document.head.appendChild(s);
  });
}
async function parseApkg(file) {
  if (!window.JSZip) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  if (!window.initSqlJs) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js');
  const zip = await JSZip.loadAsync(file);
  let data;
  if (zip.file('collection.anki21b')) {
    if (!window.fzstd) await loadScript('https://cdn.jsdelivr.net/npm/fzstd@0.1.1/umd/index.js');
    data = fzstd.decompress(await zip.file('collection.anki21b').async('uint8array'));
  } else if (zip.file('collection.anki21')) data = await zip.file('collection.anki21').async('uint8array');
  else if (zip.file('collection.anki2')) data = await zip.file('collection.anki2').async('uint8array');
  else throw new Error('W pliku nie ma kolekcji Anki');
  const SQL = await initSqlJs({ locateFile: f => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + f });
  const db = new SQL.Database(data);
  const r = db.exec('SELECT flds FROM notes');
  db.close();
  if (!r.length) return [];
  return r[0].values.map(v => String(v[0]).split('\x1f').map(cleanField)).filter(f => f.length >= 2 && f[0] && f[1]);
}
const hasPolish = s => /[ąćęłńóśźż]/i.test(s);

// Duplikaty: to samo angielskie słowo z co najmniej jednym wspólnym polskim znaczeniem
// w dowolnej talii (wbudowanej albo własnej).
const meaningSet = s => new Set(String(s).toLowerCase().replace(/\([^)]*\)/g, ' ').split(/[,;\/]| lub | albo /)
  .map(x => x.replace(/[.!?"']/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean));
function findDuplicate(en, pl, extra = []) {
  const key = String(en).toLowerCase().trim();
  const mine = meaningSet(pl);
  const pool = [...WORDS.filter(w => w.en.toLowerCase() === key), ...extra.filter(x => x.en.toLowerCase() === key)];
  for (const w of pool) {
    const theirs = meaningSet(w.custom || w.cat ? plOf(w) : w.pl);
    for (const m of mine) if (theirs.has(m)) return w;
  }
  return null;
}
const deckNameOf = w => w.cat ? (CATS[w.cat] || 'talia') : 'ten import';
function startDraft(rows, name) {
  if (!rows.length) { toast('Nie znalazłem fiszek w tym pliku'); return; }
  // Zgadnij, która kolumna jest polska.
  const sample = rows.slice(0, 200);
  const pl0 = sample.filter(r => hasPolish(r[0])).length, pl1 = sample.filter(r => hasPolish(r[1])).length;
  const swap = pl0 > pl1;
  const cols = Math.max(...rows.map(r => r.length));
  importDraft = { name: name || 'Moja talia', rows, colEn: swap ? 1 : 0, colPl: swap ? 0 : 1, colEx: cols > 2 ? 2 : -1, level: 'auto', target: 'new', cols };
  ROUTES.import();
}
function deckId(name) {
  let base = 'u_' + name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  if (base === 'u_') base = 'u_talia';
  let id = base, n = 2;
  while (custom.decks[id]) id = base + '-' + n++;
  return id;
}
function commitImport() {
  const d = importDraft;
  const words = d.rows.map(r => ({
    en: (r[d.colEn] || '').slice(0, 200), pl: (r[d.colPl] || '').slice(0, 300),
    ex: d.colEx >= 0 ? (r[d.colEx] || '').slice(0, 300) : '', level: d.level,
  })).filter(x => x.en && x.pl);
  let id = d.target;
  if (id === 'new' || !custom.decks[id]) {
    id = deckId(d.name);
    custom.decks[id] = { name: d.name.trim() || 'Moja talia', created: Date.now(), words: [] };
  }
  const deck = custom.decks[id];
  const have = new Set(deck.words.map(x => x.en.toLowerCase()));
  let added = 0, dups = 0;
  const accepted = [];
  for (const x of words) {
    if (have.has(x.en.toLowerCase())) { dups++; continue; }
    if (d.skipDup !== false && findDuplicate(x.en, x.pl, accepted)) { dups++; continue; }
    deck.words.push(x); accepted.push(x); have.add(x.en.toLowerCase()); added++;
  }
  if (!deck.words.length) delete custom.decks[id];
  saveCustom(); applyCustom();
  if (custom.decks[id]) study().cats[id] = true;
  save(); session = null;
  importDraft = null;
  toast(`Dodano ${nFiszek(added)} do talii „${deck.name}”${dups ? `, pominięto duplikaty: ${dups}` : ''}`);
  ROUTES.import();
}

ROUTES.import = () => {
  const decks = Object.entries(custom.decks);
  const deckOpts = sel => decks.map(([k, d]) => `<option value="${esc(k)}" ${sel === k ? 'selected' : ''}>${esc(d.name)}</option>`).join('');
  let draftHtml = '';
  const d = importDraft;
  if (d) {
    const colOpts = (sel, allowNone) => (allowNone ? `<option value="-1" ${sel === -1 ? 'selected' : ''}>brak</option>` : '') +
      Array.from({ length: d.cols }, (_, i) => `<option value="${i}" ${sel === i ? 'selected' : ''}>kolumna ${i + 1}</option>`).join('');
    draftHtml = `
    <section class="card" id="draft">
      <h2>Podgląd: ${nFiszek(d.rows.length)}</h2>
      <div class="form-grid">
        <label>Dodaj do<select id="dtarget" class="input"><option value="new">Nowa talia</option>${deckOpts(d.target)}</select></label>
        <label id="dnamewrap" ${d.target !== 'new' ? 'hidden' : ''}>Nazwa nowej talii<input id="dname" class="input" value="${esc(d.name)}"></label>
        <div class="grid2">
          <label>Angielski<select id="den" class="input">${colOpts(d.colEn)}</select></label>
          <label>Polski<select id="dpl" class="input">${colOpts(d.colPl)}</select></label>
        </div>
        <div class="grid2">
          <label>Przykład<select id="dex" class="input">${colOpts(d.colEx, true)}</select></label>
          <label>Poziom<select id="dlvl" class="input"><option value="auto">automatycznie</option>${LEVELS.map(l => `<option ${d.level === l ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        </div>
      </div>
      <table class="preview"><tr><th>Angielski</th><th>Polski</th>${d.colEx >= 0 ? '<th>Przykład</th>' : ''}</tr>
        ${d.rows.slice(0, 6).map(r => `<tr><td>${esc(r[d.colEn] || '')}</td><td>${esc(r[d.colPl] || '')}</td>${d.colEx >= 0 ? `<td>${esc(r[d.colEx] || '')}</td>` : ''}</tr>`).join('')}
      </table>
      ${(() => {
        const dl = d.rows.map(r => [r, findDuplicate(r[d.colEn] || '', r[d.colPl] || '')]).filter(x => x[1]);
        if (!dl.length) return '<p class="muted small">Nie znaleziono duplikatów w Twoich taliach.</p>';
        return `<div class="feedback ko" style="margin:8px 0">
          <b>Duplikaty: ${dl.length}</b>
          <div class="small">To samo słowo z tym samym znaczeniem jest już w innej talii, np.:
          ${dl.slice(0, 4).map(([r, w]) => `<br>• ${esc(r[d.colEn])}: ${esc(r[d.colPl])} (jest w: ${esc(deckNameOf(w))})`).join('')}</div>
          <label class="row small" style="margin-top:8px"><input type="checkbox" id="dskip" class="switch" ${d.skipDup !== false ? 'checked' : ''}> Pomiń duplikaty przy imporcie</label>
        </div>`;
      })()}
      <div class="row"><button class="btn" id="dcancel">Anuluj</button><div class="spacer"></div><button class="btn primary" id="dok">Importuj</button></div>
    </section>`;
  }
  view.innerHTML = `
    <header class="top">${backLink('#/words', 'Słówka')}<span class="muted small">Import fiszek</span></header>
    ${draftHtml}
    <section class="card">
      <h2>Z pliku</h2>
      <p class="muted small">Obsługiwane: <b>talie Anki .apkg</b>, eksport Anki „Notatki jako zwykły tekst” (.txt),
      pliki CSV/TSV z Excela lub Arkuszy Google. Kolumny: angielski, polski i opcjonalnie przykład.</p>
      <input type="file" id="ifile" accept=".apkg,.colpkg,.txt,.csv,.tsv,text/plain,text/csv" hidden>
      <button class="btn primary block" id="ipick">Wybierz plik</button>
      <p class="muted small" style="margin-bottom:0">Pliki .apkg wymagają internetu przy imporcie (pobieram czytnik formatu Anki).</p>
    </section>
    <section class="card">
      <h2>Wklej listę</h2>
      <p class="muted small">Jedna fiszka na linię, np. <code>latency - opóźnienie</code>, <code>latency;opóźnienie</code> albo kolumny skopiowane z arkusza.</p>
      <textarea id="itext" class="area" placeholder="handover - przełączenie&#10;throughput - przepustowość"></textarea>
      <button class="btn block" id="iparse" style="margin-top:8px">Dalej</button>
    </section>
    <section class="card">
      <h2>Dodaj jedną fiszkę</h2>
      <div class="form-grid">
        <label>Talia<select id="mdeck" class="input"><option value="new">Moje słówka (nowa)</option>${deckOpts(decks.length ? decks[0][0] : '')}</select></label>
        <label>Angielski<input id="men" class="input" autocomplete="off"></label>
        <label>Polski<input id="mpl" class="input" autocomplete="off"></label>
        <label>Przykład (opcjonalnie)<input id="mex" class="input" autocomplete="off"></label>
        <button class="btn primary" id="madd">Dodaj</button>
      </div>
    </section>
    <section class="card">
      <h2>Moje talie</h2>
      ${decks.length ? `<div class="list">${decks.map(([k, dd]) => `
        <div class="item"><a class="txt" href="#/deck/${encodeURIComponent(k)}" style="text-decoration:none;color:inherit"><div class="en">${esc(dd.name)} ›</div><div class="pl">${nFiszek(dd.words.length)} · otwórz</div></a>
          <button class="btn" data-dexp="${esc(k)}" style="min-height:36px;padding:4px 10px">Eksport</button>
          <button class="btn" data-ddel="${esc(k)}" style="min-height:36px;padding:4px 10px;color:var(--bad)">Usuń</button></div>`).join('')}</div>`
        : '<p class="muted small">Nie masz jeszcze własnych talii.</p>'}
    </section>`;

  $('#ipick').onclick = () => $('#ifile').click();
  $('#ifile').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    const name = f.name.replace(/\.[^.]+$/, '');
    try {
      if (/\.(apkg|colpkg)$/i.test(f.name)) {
        toast('Czytam talię Anki…');
        startDraft(await parseApkg(f), name);
      } else {
        startDraft(parseTextCards(await f.text()), name);
      }
    } catch (err) {
      toast('Nie udało się odczytać pliku: ' + (err && err.message ? err.message : err));
    }
  };
  $('#iparse').onclick = () => startDraft(parseTextCards($('#itext').value), 'Moja talia');
  $('#madd').onclick = () => {
    const en = $('#men').value.trim(), pl = $('#mpl').value.trim();
    if (!en || !pl) { toast('Wpisz słowo i tłumaczenie'); return; }
    const dup = findDuplicate(en, pl);
    if (dup) { toast(`„${en}” z tym znaczeniem już jest w talii „${deckNameOf(dup)}”`); return; }
    let id = $('#mdeck').value;
    if (id === 'new' || !custom.decks[id]) {
      id = Object.keys(custom.decks).find(k => custom.decks[k].name === 'Moje słówka') || deckId('Moje słówka');
      custom.decks[id] = custom.decks[id] || { name: 'Moje słówka', created: Date.now(), words: [] };
    }
    const deck = custom.decks[id];
    if (deck.words.some(x => x.en.toLowerCase() === en.toLowerCase())) { toast('To słowo już jest w tej talii'); return; }
    deck.words.push({ en, pl, ex: $('#mex').value.trim(), level: 'auto' });
    saveCustom(); applyCustom(); study().cats[id] = true; save(); session = null;
    toast(`Dodano „${en}”`);
    ROUTES.import();
  };
  $$('[data-ddel]').forEach(b => b.onclick = () => {
    const k = b.dataset.ddel;
    if (!confirm(`Usunąć talię „${custom.decks[k].name}”? Postęp jej fiszek też zniknie.`)) return;
    for (const id of Object.keys(state.cards)) if (id.startsWith(k + ':')) delete state.cards[id];
    delete custom.decks[k]; delete study().cats[k];
    saveCustom(); applyCustom(); save(); session = null; ROUTES.import();
  });
  $$('[data-dexp]').forEach(b => b.onclick = () => {
    const dd = custom.decks[b.dataset.dexp];
    const tsv = '#separator:tab\n#html:false\n' + dd.words.map(x => [x.en, x.pl, x.ex || ''].map(v => v.replace(/[\t\n]/g, ' ')).join('\t')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([tsv], { type: 'text/tab-separated-values' }));
    a.download = dd.name.replace(/[^\w\-ąćęłńóśźż ]+/gi, '') + '.txt';
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  if (d) {
    const reread = () => {
      d.target = $('#dtarget').value; d.name = $('#dname') ? $('#dname').value : d.name;
      d.colEn = +$('#den').value; d.colPl = +$('#dpl').value; d.colEx = +$('#dex').value; d.level = $('#dlvl').value;
    };
    ['#dtarget', '#den', '#dpl', '#dex', '#dlvl'].forEach(s => $(s).onchange = () => { reread(); ROUTES.import(); });
    if ($('#dname')) $('#dname').oninput = () => { d.name = $('#dname').value; };
    if ($('#dskip')) $('#dskip').onchange = e => { d.skipDup = e.target.checked; };
    $('#dcancel').onclick = () => { importDraft = null; ROUTES.import(); };
    $('#dok').onclick = () => { reread(); commitImport(); };
  }
};

/* ================= Postępy ================= */
ROUTES.stats = () => {
  const t = today();
  const counts = { new: 0, learning: 0, review: 0, mastered: 0, known: 0, suspended: 0 };
  WORDS.forEach(w => counts[status(w.id)]++);
  const logs = state.log;
  const cnt = e => e ? e.r + e.n + e.x : 0;
  const fmtMin = ms => { const m = Math.round(ms / 60000); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} godz. ${m % 60} min`; };

  // Mapa aktywności: 26 tygodni, kolumny = tygodnie (pon–niedz).
  const dow = d => (new Date(d * 86400000).getUTCDay() + 6) % 7; // 0 = poniedziałek
  const start = t - dow(t) - 7 * 25;
  const maxDay = Math.max(1, ...Object.keys(logs).filter(d => +d >= start).map(d => cnt(logs[d])));
  let cells = '';
  for (let d = start; d <= t; d++) {
    const v = cnt(logs[d]);
    const lvl = v === 0 ? 0 : Math.min(4, Math.ceil((v / maxDay) * 4));
    cells += `<i class="${lvl ? 'l' + lvl : ''} ${d === t ? 'today' : ''}" title="${dayLabel(d)}: ${v}"></i>`;
  }
  const activeDays = Object.keys(logs).filter(d => +d >= start && cnt(logs[d]) > 0).length;

  // Prognoza powtórek na 30 dni (zaległe liczone na dziś).
  const fc = Array(30).fill(0);
  for (const [id, c] of Object.entries(state.cards)) {
    if (isBlocked(id) || !BY_ID.has(id)) continue;
    const off = Math.max(0, (c.due ?? t) - t);
    if (off < 30) fc[off]++;
  }
  const fcMax = Math.max(1, ...fc);
  const fcWeek = fc.slice(0, 7).reduce((a, b) => a + b, 0);

  // Czas i skuteczność.
  const sumRange = (from, f) => Object.entries(logs).filter(([d]) => +d >= from).reduce((a, [, e]) => a + (f(e) || 0), 0);
  const timeToday = (logs[t] && logs[t].t) || 0;
  const time30 = sumRange(t - 29, e => e.t);
  const timeAll = sumRange(-Infinity, e => e.t);
  const rv30 = sumRange(t - 29, e => e.rv), rvOk30 = sumRange(t - 29, e => e.rvOk);
  const retention = rv30 ? Math.round((rvOk30 / rv30) * 100) : null;
  const totalReviews = sumRange(-Infinity, e => e.r + e.n);
  const days30 = Object.keys(logs).filter(d => +d >= t - 29 && cnt(logs[d]) > 0).length;

  // Rozkład odstępów (karty w powtórkach).
  const buckets = [['≤ 1 d', 0, 1], ['2–7 d', 2, 7], ['8–21 d', 8, 21], ['22 d – 3 mies.', 22, 90], ['> 3 mies.', 91, Infinity]];
  const ivCounts = buckets.map(([, a, b]) => Object.values(state.cards).filter(c => c.s === 'review' && (c.iv || 0) >= a && (c.iv || 0) <= b).length);
  const ivMax = Math.max(1, ...ivCounts);

  view.innerHTML = `
    <header class="top"><h1>Postępy</h1></header>
    <section class="card">
      <div class="kpis" style="margin-top:0">
        <div class="kpi"><b>${streak()}</b><span>${streak() === 1 ? 'dzień' : 'dni'} z rzędu</span></div>
        <div class="kpi"><b>${fmtMin(timeToday)}</b><span>nauki dziś</span></div>
        <div class="kpi"><b>${retention === null ? '–' : retention + '%'}</b><span>zapamiętane (30 dni)</span></div>
      </div>
      <h2>Aktywność (26 tygodni)</h2>
      <div class="heatmap">${cells}</div>
      <p class="muted small">Aktywne dni: ${activeDays} z ${t - start + 1} · ${days30} w ostatnich 30 dniach</p>
    </section>
    <section class="card">
      <h2>Prognoza powtórek (30 dni)</h2>
      <div class="chart">${fc.map((v, i) => `<div class="col"><div style="height:${(v / fcMax) * 100}%" title="${dayLabel(t + i)}: ${v}"></div><span>${i % 5 === 0 ? (i === 0 ? 'dziś' : '+' + i) : ''}</span></div>`).join('')}</div>
      <p class="muted small">Dziś: ${fc[0]} · jutro: ${fc[1]} · w tym tygodniu: ${fcWeek}</p>
    </section>
    <section class="card">
      <h2>Czas i skuteczność</h2>
      <div class="stat-grid">
        <div class="kpi"><b>${fmtMin(time30)}</b><span>w ostatnich 30 dniach</span></div>
        <div class="kpi"><b>${days30 ? fmtMin(time30 / days30) : '–'}</b><span>średnio na dzień nauki</span></div>
        <div class="kpi"><b>${fmtMin(timeAll)}</b><span>łącznie</span></div>
        <div class="kpi"><b>${totalReviews}</b><span>odpowiedzi na fiszkach</span></div>
      </div>
      <p class="muted small">„Zapamiętane” to odsetek powtórek, w których nie wybrałeś „Nie wiem”. Cel ustawiony w algorytmie: ${Math.round((state.settings.retention || 0.9) * 100)}%.</p>
    </section>
    <section class="card">
      <h2>Słówka według statusu</h2>
      <div class="bar" style="display:flex;height:14px">
        ${[['known', 'var(--good)'], ['mastered', 'var(--good)'], ['review', 'var(--accent)'], ['learning', 'var(--warn)'], ['suspended', 'var(--muted)']].map(([k, c]) =>
          `<div style="width:${(counts[k] / WORDS.length) * 100}%;background:${c};border-radius:0"></div>`).join('')}
      </div>
      <div class="legend">
        <span><i style="background:var(--good)"></i>opanowane / znane ${counts.mastered + counts.known}</span>
        <span><i style="background:var(--accent)"></i>powtarzane ${counts.review}</span>
        <span><i style="background:var(--warn)"></i>w nauce ${counts.learning}</span>
        <span><i style="background:var(--muted)"></i>zawieszone ${counts.suspended}</span>
        <span><i style="background:var(--border)"></i>nowe ${counts.new}</span>
      </div>
    </section>
    <section class="card">
      <h2>Odstępy między powtórkami</h2>
      ${buckets.map(([label], i) => `<div class="lvl" style="grid-template-columns:110px 1fr 44px"><span class="small">${label}</span><div class="bar"><div style="width:${(ivCounts[i] / ivMax) * 100}%"></div></div><span class="muted small">${ivCounts[i]}</span></div>`).join('')}
    </section>
    <section class="card">
      <h2>Poziomy</h2>
      ${LEVELS.map(l => {
        const all = WORDS.filter(w => w.level === l);
        const done = all.filter(w => ['mastered', 'known'].includes(status(w.id))).length;
        const p = all.length ? Math.round((done / all.length) * 100) : 0;
        return `<div class="lvl"><b>${l}</b><div class="bar"><div style="width:${p}%"></div></div><span class="muted small">${done}/${all.length}</span></div>`;
      }).join('')}
    </section>`;
};

/* ================= Ustawienia ================= */
ROUTES.settings = () => {
  const st = state.settings;
  view.innerHTML = `
    <header class="top">${backLink('#/home', 'Start')}<span class="muted small">Ustawienia</span></header>
    <section class="card">
      <h2>Nauka</h2>
      <div class="field"><label for="npd">Nowe słowa dziennie<br><span class="muted small">wpisz dowolną liczbę</span></label>
        <input id="npd" class="num" type="number" inputmode="numeric" min="0" step="1" value="${st.newPerDay}"></div>
      <div class="chips" style="margin-top:4px">${[10, 20, 50, 100, 200].map(n => `<button class="filter ${n === st.newPerDay ? 'on' : ''}" data-npd="${n}">${n}</button>`).join('')}</div>
      <div class="field"><label for="dir">Kierunek fiszek</label>
        <select id="dir">
          <option value="mix" ${st.direction === 'mix' ? 'selected' : ''}>Mieszany</option>
          <option value="en-pl" ${st.direction === 'en-pl' ? 'selected' : ''}>Angielski → polski</option>
          <option value="pl-en" ${st.direction === 'pl-en' ? 'selected' : ''}>Polski → angielski</option>
        </select></div>
    </section>
    <section class="card">
      <h2>Algorytm powtórek (FSRS)</h2>
      <div class="field"><label for="ret">Docelowa skuteczność<br><span class="muted small">wyżej = częstsze powtórki</span></label>
        <select id="ret">${[0.8, 0.85, 0.9, 0.93, 0.95].map(r => `<option value="${r}" ${Math.abs((st.retention || 0.9) - r) < 0.001 ? 'selected' : ''}>${Math.round(r * 100)}%</option>`).join('')}</select></div>
      <div class="field"><label for="lsteps">Kroki nauki (minuty)<br><span class="muted small">nowe słowa, np. „1 10”</span></label>
        <input id="lsteps" class="num" style="width:110px" value="${esc(st.learnSteps)}"></div>
      <div class="field"><label for="rsteps">Kroki po pomyłce (minuty)<br><span class="muted small">zapomniane słowa, np. „10”</span></label>
        <input id="rsteps" class="num" style="width:110px" value="${esc(st.relearnSteps)}"></div>
    </section>
    <section class="card">
      <h2>Fiszki</h2>
      <p class="muted small">Uczysz się: ${esc(studySummary())}</p>
      <div class="grid2"><a class="btn" href="#/pick">Wybierz fiszki</a><a class="btn" href="#/import">Import fiszek</a></div>
    </section>
    <section class="card">
      <h2>Wymowa lektora</h2>
      <div class="field"><label for="acc">Akcent</label>
        <select id="acc"><option value="en-GB" ${st.accent === 'en-GB' ? 'selected' : ''}>Brytyjski</option><option value="en-US" ${st.accent === 'en-US' ? 'selected' : ''}>Amerykański</option></select></div>
      <div class="field"><label for="rate">Tempo: <span id="rv">${st.rate.toFixed(2)}</span></label>
        <input id="rate" type="range" min="0.6" max="1.2" step="0.05" value="${st.rate}"></div>
      <label class="field"><span>Czytaj słowa automatycznie</span><input class="switch" type="checkbox" id="auto" ${st.autoSpeak ? 'checked' : ''}></label>
      <button class="btn block" data-say="Hello! This is how I sound.">${ICON_SPEAK} Test głosu</button>
    </section>
    <section class="card">
      <h2>Kopia zapasowa</h2>
      <p class="muted small">Postęp zapisuje się podwójnie (w dwóch niezależnych magazynach przeglądarki), a do tego aplikacja trzyma kopie z ostatnich 7 dni.
      Trwałe przechowywanie: <b>${storagePersisted === true ? 'włączone' : storagePersisted === false ? 'nie przyznane przez przeglądarkę' : 'nieznane'}</b>.
      Przed zmianą telefonu zrób eksport do pliku.</p>
      <div class="grid2"><button class="btn" id="exp">Eksportuj</button><button class="btn" id="imp">Importuj</button></div>
      <input type="file" id="file" accept="application/json,.json" hidden>
      <button class="btn block" id="reset" style="margin-top:12px;color:var(--bad)">Wyzeruj postęp</button>
    </section>
    <p class="muted small center">Słówek w bazie: ${WORDS.length} · zdań: ${SENTENCES.length}</p>`;
  const upd = () => { save(); };
  const setNpd = v => {
    const n = Math.max(0, Math.floor(Number(v) || 0));
    st.newPerDay = n; session = null; upd();
    $('#npd').value = n;
    $$('[data-npd]').forEach(b => b.classList.toggle('on', +b.dataset.npd === n));
  };
  $('#npd').onchange = e => setNpd(e.target.value);
  $$('[data-npd]').forEach(b => b.onclick = () => { setNpd(b.dataset.npd); toast(`Nowe słowa dziennie: ${b.dataset.npd}`); });
  $('#dir').onchange = e => { st.direction = e.target.value; upd(); };
  $('#ret').onchange = e => { st.retention = +e.target.value; upd(); toast('Zmieniono docelową skuteczność'); };
  $('#lsteps').onchange = e => { st.learnSteps = parseSteps(e.target.value, [1, 10]).join(' '); e.target.value = st.learnSteps; upd(); };
  $('#rsteps').onchange = e => { st.relearnSteps = parseSteps(e.target.value, [10]).join(' '); e.target.value = st.relearnSteps; upd(); };
  $('#acc').onchange = e => { st.accent = e.target.value; upd(); };
  $('#rate').oninput = e => { st.rate = +e.target.value; $('#rv').textContent = st.rate.toFixed(2); upd(); };
  $('#auto').onchange = e => { st.autoSpeak = e.target.checked; upd(); };
  $('#exp').onclick = () => {
    const blob = new Blob([JSON.stringify(Object.assign({}, state, { custom }))], { type: 'application/json' });
    const a = document.createElement('a');
    const d = new Date();
    a.href = URL.createObjectURL(blob);
    a.download = `inglisz-kopia-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('#imp').onclick = () => $('#file').click();
  $('#file').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || typeof data.cards !== 'object') throw new Error('bad');
        if (!confirm('Zastąpić obecny postęp danymi z pliku?')) return;
        if (data.custom && data.custom.decks) { custom = data.custom; saveCustom(); applyCustom(); }
        delete data.custom;
        state = normalizeState(data); session = null; save();
        toast('Kopia wczytana'); ROUTES.settings();
      } catch (err) { toast('To nie jest poprawny plik kopii'); }
    };
    r.readAsText(f);
  };
  $('#reset').onclick = () => {
    if (!confirm('Na pewno usunąć cały postęp? Tego nie da się cofnąć.')) return;
    state = normalizeState({ settings: state.settings });
    session = null; save(); toast('Postęp wyzerowany'); ROUTES.settings();
  };
};

/* ================= Start aplikacji ================= */
// Jednorazowa migracja kart ze starego algorytmu (SM-2) do FSRS.
for (const id of Object.keys(state.cards)) state.cards[id] = migrateCard(state.cards[id]);
render();
requestPersistence();
restoreCustomFromIdb().then(r => { if (r) render(); });
restoreFromIdb().then(restored => {
  if (restored) { session = null; render(); toast('Przywrócono postęp z kopii'); }
  else if (Object.keys(state.cards).length) save(); // uzupełnij kopię w IndexedDB
});
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
