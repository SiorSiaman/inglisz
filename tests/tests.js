// Testy automatyczne aplikacji. Uruchom: otwórz tests/tests.html przez lokalny serwer.
// Testy zapisują kopię Twojego postępu na początku i przywracają ją na końcu.
(async function () {
  const results = [];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const errors = [];
  window.addEventListener('error', e => errors.push(String(e.message)));
  const backup = { s: localStorage.getItem(STORE_KEY), c: localStorage.getItem(CUSTOM_KEY) };
  const backupState = JSON.stringify(state), backupCustom = JSON.stringify(custom);
  window.toast = () => {}; window.speak = () => {}; window.feedback = () => {};
  window.confirm = () => true; window.prompt = () => null;

  function fresh(extra = {}) {
    state = normalizeState(Object.assign({ onboarded: true }, extra));
    session = null; mix = null; grun = null;
  }
  async function test(name, fn) {
    const before = errors.length;
    try { fresh(); await fn(); if (errors.length > before) throw new Error('Błąd JS: ' + errors.slice(before).join('; ')); results.push({ name, ok: true }); }
    catch (e) { results.push({ name, ok: false, msg: e && e.message ? e.message : String(e) }); }
  }
  const assert = (c, m) => { if (!c) throw new Error(m || 'asercja nie przeszła'); };
  const eq = (a, b, m) => { if (a !== b) throw new Error(`${m || ''} oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)}`); };
  const go = async (hash) => { location.hash = hash; await sleep(30); if (location.hash !== hash) location.hash = hash; render(); await sleep(10); };

  /* ---------- Dane ---------- */
  await test('Słówka: kompletne pola, unikalne id, poprawne poziomy i kategorie', () => {
    const ids = new Set();
    for (const w of WORDS) {
      assert(w.en && w.pl, 'puste pole: ' + w.id);
      assert(LEVELS.includes(w.level), 'zły poziom: ' + w.id);
      assert(CATS[w.cat], 'zła kategoria: ' + w.id);
      assert(!ids.has(w.id), 'duplikat id: ' + w.id); ids.add(w.id);
    }
    assert(WORDS.length > 4000, 'za mało słów: ' + WORDS.length);
  });
  await test('Słówka: brak wulgaryzmów i imion w bazie', () => {
    const bad = ['fuck', 'shit', 'bitch', 'bob', 'mike', 'frank'];
    for (const b of bad) assert(!BY_ID.has(b), 'niepożądane słowo: ' + b);
  });
  await test('Słówka: przykłady zawierają tłumaczenie, gdy pochodzą z Tatoeby', () => {
    const core = WORDS.filter(w => w.cat === 'core' && w.ex);
    const missing = core.filter(w => !w.exPl).length;
    assert(missing / core.length < 0.01, 'brak tłumaczeń przykładów: ' + missing);
  });
  await test('Zdania: kompletne i z poziomem', () => {
    for (const s of SENTENCES) { assert(s.pl && s.en, 'puste zdanie'); assert(LEVELS.includes(s.level), 'poziom: ' + s.en); }
    assert(SENTENCES.length > 3000);
  });
  await test('Gramatyka: każde ćwiczenie poprawne strukturalnie', () => {
    let n = 0;
    for (const l of LESSONS) {
      assert(l.ex.length >= 55, l.id + ' ma za mało zadań: ' + l.ex.length);
      const seenQ = new Set();
      for (const ex of l.ex) {
        n++;
        const [t, q] = ex;
        assert(['c', 'g', 'f', 'o'].includes(t), 'typ');
        if (t === 'c') { assert(ex[3] >= 0 && ex[3] < ex[2].length, 'indeks ' + q); eq(blankCount(q), ex[2][ex[3]].split(' / ').length, 'luki w: ' + q); }
        if (t === 'g') assert(blankCount(q) > 0 && Array.isArray(ex[2]) && ex[2].length, 'luka: ' + q);
        if (t === 'f') assert(!answerOk(q, ex[2]), 'błędne zdanie akceptowane: ' + q);
        if (t === 'o') assert(typeof ex[2] === 'string' && tokenize(ex[2]).length >= 3, 'o: ' + q);
        const k = normAns(q); assert(!seenQ.has(k), 'duplikat w ' + l.id + ': ' + q); seenQ.add(k);
      }
    }
    assert(n > 1400);
  });

  /* ---------- Algorytm FSRS i kroki nauki ---------- */
  await test('FSRS: nowe słowo – kroki 1 min i 10 min, „Łatwe” od razu do powtórek', () => {
    const now = Date.now();
    const a = schedule(null, 1, now); eq(a.s, 'learning'); eq(Math.round((a.dueAt - now) / 60000), 1, 'Nie wiem');
    const g = schedule(null, 3, now); eq(g.s, 'learning'); eq(Math.round((g.dueAt - now) / 60000), 10, 'Dobrze');
    const e = schedule(null, 4, now); eq(e.s, 'review'); assert(e.iv >= 10, 'Łatwe iv ' + e.iv);
    const grad = schedule(g, 3, now); eq(grad.s, 'review'); assert(grad.iv >= 1 && grad.iv <= 6, 'ukończenie kroków iv ' + grad.iv);
  });
  await test('FSRS: w powtórkach Trudne < Dobrze < Łatwe, pomyłka → ponowna nauka', () => {
    const t = today();
    const c = { s: 'review', S: 10, D: 5, iv: 10, due: t, last: t - 10, reps: 3, lapses: 0, first: t - 30 };
    const h = schedule(c, 2), g = schedule(c, 3), e = schedule(c, 4), a = schedule(c, 1);
    assert(h.iv < g.iv && g.iv < e.iv, `${h.iv} ${g.iv} ${e.iv}`);
    eq(a.s, 'relearning'); eq(a.lapses, 1); assert(a.S < c.S, 'stabilność po pomyłce');
  });
  await test('FSRS: wyższa docelowa skuteczność skraca odstępy', () => {
    state.settings.retention = 0.8; const lo = ivFromS(20);
    state.settings.retention = 0.95; const hi = ivFromS(20);
    assert(hi < lo, `${hi} vs ${lo}`);
  });
  await test('Migracja kart ze starego formatu (SM-2)', () => {
    const t = today();
    const k = migrateCard({ s: 'known', iv: 60, ef: 2.7, reps: 3, first: t, due: t + 40 });
    assert(k.known && k.s === 'review' && k.S === 60);
    const r = migrateCard({ s: 'review', iv: 10, ef: 2.5, reps: 3, due: t });
    assert(r.S === 10 && r.D > 1 && r.D < 10);
    const l = migrateCard({ s: 'learning', iv: 0, reps: 0, due: t });
    eq(l.s, 'relearning');
  });
  await test('Własne kroki nauki z ustawień', () => {
    state.settings.learnSteps = '2 15 60';
    const now = Date.now();
    const a = schedule(null, 3, now); eq(Math.round((a.dueAt - now) / 60000), 15);
    const b = schedule(a, 3, now); eq(Math.round((b.dueAt - now) / 60000), 60);
  });

  /* ---------- Sesja fiszek ---------- */
  await test('Sesja: limit nowych słów i filtr kategorii + poziomów', () => {
    state.settings.newPerDay = 7;
    const st = study(); Object.keys(CATS).forEach(k => st.cats[k] = k === 'telecom'); LEVELS.forEach(l => st.levels[l] = l === 'B2');
    const s = buildSession();
    eq(s.queue.length, 7);
    assert(s.queue.every(q => BY_ID.get(q.id).cat === 'telecom' && BY_ID.get(q.id).level === 'B2'));
  });
  await test('Sesja: „Znam” nie zabiera limitu i dokłada nowe słowo; Cofnij przywraca', async () => {
    state.settings.newPerDay = 3;
    await go('#/learn');
    const first = session.cur.id;
    answerKnown();
    eq(remaining(session), 3, 'po Znam');
    assert(state.cards[first].known);
    undo();
    eq(session.cur.id, first); assert(!state.cards[first], 'karta usunięta po cofnięciu');
  });
  await test('Sesja: „Nie wiem” → karta wraca w nauce, ekran oczekiwania po wyczerpaniu kolejki', async () => {
    state.settings.newPerDay = 1;
    await go('#/learn');
    const id = session.cur.id;
    reveal(); answer(0);
    eq(state.cards[id].s, 'learning');
    // Jedyna karta w nauce wraca od razu (nauka z wyprzedzeniem do 20 min, jak w Anki).
    eq(session.cur && session.cur.id, id, 'powrót karty');
    session.learn.push({ id, dueAt: Date.now() + 30 * 60000 }); // > 20 min
    session.cur = null; showCard();
    assert(view.textContent.includes('Następna karta za'), 'ekran oczekiwania');
    $('#now').click();
    assert(session.cur, 'Pokaż teraz');
  });
  await test('Sesja: odłożenie i zawieszenie wykluczają kartę', async () => {
    state.settings.newPerDay = 2;
    await go('#/learn');
    const a = session.cur.id; reveal(); setAside('bury');
    const b = session.cur.id; reveal(); setAside('suspend');
    assert(isBlocked(a) && isBlocked(b));
    const s2 = buildSession();
    assert(!s2.queue.some(q => q.id === a || q.id === b));
  });
  await test('Tryb pisania: poprawna odpowiedź podpowiada „Dobrze”, literówka „Trudne”', async () => {
    state.settings.typeAnswer = true; state.settings.direction = 'pl-en'; state.settings.newPerDay = 2;
    await go('#/learn');
    const w = BY_ID.get(session.cur.id);
    $('#typein').value = w.en; reveal();
    assert($('.grades .suggest').dataset.g === '2', 'sugestia dobrze');
    answer(2);
    const w2 = BY_ID.get(session.cur.id);
    $('#typein').value = w2.en.length > 3 ? w2.en.slice(0, -1) + 'x' : 'qqqq'; reveal();
    assert(['1', '0'].includes($('.grades .suggest').dataset.g));
  });
  await test('Statystyki sesji na ekranie końcowym', async () => {
    state.settings.newPerDay = 2;
    await go('#/learn');
    reveal(); answer(3); reveal(); answer(3);
    assert(view.textContent.includes('pamiętane'), 'podsumowanie');
  });

  /* ---------- Import i talie ---------- */
  await test('Import: rozpoznaje separatory, cudzysłowy CSV i HTML', () => {
    eq(parseTextCards('a\tb\nc\td').length, 2);
    eq(parseTextCards('latency - opóźnienie')[0][1], 'opóźnienie');
    eq(parseTextCards('x;y\nz;w')[1][0], 'z');
    eq(parseTextCards('"hello, world","cześć, świecie"')[0][1], 'cześć, świecie');
    eq(parseTextCards('<b>cat</b>\tkot&nbsp;domowy [sound:a.mp3]')[0][1], 'kot domowy');
    eq(parseTextCards('#komentarz\na\tb').length, 1);
  });
  await test('Import: wykrywa kolumnę polską i pomija duplikaty', async () => {
    const oldCustom = custom; custom = { decks: {} }; applyCustom();
    startDraft(parseTextCards('opóźnienie - latency\nnowe słowo - brandnewword'), 'T');
    eq(importDraft.colEn, 1, 'zamiana kolumn');
    commitImport();
    const d = Object.values(custom.decks)[0];
    eq(d.words.length, 1, 'latency to duplikat'); eq(d.words[0].en, 'brandnewword');
    custom = oldCustom; saveCustom(); applyCustom();
  });
  await test('Import: usunięcie talii usuwa jej karty', async () => {
    const oldCustom = custom; custom = { decks: {} }; applyCustom();
    startDraft([['zzqword', 'testowe']], 'Del'); commitImport();
    const id = Object.keys(custom.decks)[0];
    state.cards[id + ':zzqword'] = schedule(null, 3);
    await go('#/deck/' + id);
    $('#ddelete').click();
    assert(!custom.decks[id] && !state.cards[id + ':zzqword']);
    custom = oldCustom; saveCustom(); applyCustom();
  });

  /* ---------- Porównywanie odpowiedzi ---------- */
  await test('Sprawdzanie odpowiedzi: skróty, apostrofy, wielkość liter', () => {
    assert(answerOk("I haven't finished", ['I have not finished.']));
    assert(answerOk('Ive finished', ["I've finished"]));
    assert(answerOk('DONT', ["don't"]));
    assert(!answerOk('I go', ['I went']));
  });
  await test('Dyktando: wynik i oznaczenie brakujących słów', () => {
    const d = diffWords('She is very proud of her daughter.', 'she is proud of her daughter');
    assert(d.score >= 80 && d.score < 100);
    assert(d.words.find(x => x.w === 'very' && !x.ok));
    eq(diffWords('I have 5 cats.', 'i have five cats').score, 100);
  });
  await test('Odmiana polska', () => {
    eq(nFiszek(1), '1 fiszka'); eq(nFiszek(3), '3 fiszki'); eq(nFiszek(12), '12 fiszek'); eq(nFiszek(22), '22 fiszki'); eq(nSlow(5), '5 słów');
  });

  /* ---------- Seria, cel, zamrożenia ---------- */
  await test('Seria liczy kolejne dni i zamrożenie ratuje opuszczony dzień', () => {
    const t = today();
    for (let d = t - 5; d <= t - 2; d++) state.log[d] = { r: 5, n: 0, x: 0, ok: 5 };
    eq(streak(), 0, 'wczoraj bez nauki = seria przerwana');
    state.freezes = 1;
    applyFreezes();
    eq(state.freezes, 0); assert(state.freezeDays[t - 1]);
    eq(streak(), 4, 'seria utrzymana');
  });
  await test('Dzienny cel liczy tylko nauczone nowe słowa (nie kliknięcia, „Znam” ani ćwiczenia)', async () => {
    state.settings.newPerDay = 2;
    const t = today();
    const [w1, w2, w3] = orderNew(newAvailable().pool).slice(0, 3);
    for (let i = 0; i < 40; i++) logActivity('ex', true);
    eq(learnedToday(), 0, 'ćwiczenia nie zaliczają celu');
    grade(w1.id, 0); grade(w1.id, 0); grade(w1.id, 0);
    eq(state.cards[w1.id].s, 'learning'); eq(learnedToday(), 0, '„Nie wiem” nie zalicza');
    markKnown(w3.id, 60);
    eq(learnedToday(), 0, '„Znam” nie zalicza');
    eq(goalTarget(), 2);
    grade(w1.id, 3);
    eq(state.cards[w1.id].s, 'review'); eq(learnedToday(), 1, 'nauczone po przejściu kroków');
    await sleep(10);
    assert(!goalDone() && !state.goalDays[t], 'cel jeszcze nieosiągnięty po 1 z 2');
    grade(w2.id, 3);
    await sleep(10);
    assert(goalDone(), 'cel osiągnięty po 2 z 2'); eq(state.goalDays[t], 2);
    grade(w1.id, 0); grade(w1.id, 3);
    eq(learnedToday(), 2, 'ponowne nauczenie zapomnianego słowa nie liczy się drugi raz');
    state.extraNew = { day: t, n: 10 };
    eq(goalTarget(), 12, 'kolejna partia podnosi cel na dziś');
    assert(!goalDone());
    await go('#/home');
    assert(view.textContent.includes('Nauczone dziś') && view.textContent.includes('2 / 12'), 'pierścień na ekranie Start');
  });
  await test('Koniec sesji po celu: proponuje kolejną partię', async () => {
    state.settings.newPerDay = 1;
    const w = orderNew(newAvailable().pool)[0];
    grade(w.id, 3);
    await sleep(10);
    session = null;
    state.settings.newPerDay = 1;
    await go('#/learn');
    assert(view.textContent.includes('Dzienna partia nauczona'), 'nagłówek celu, ekran: ' + view.textContent.slice(0, 120));
    assert(view.textContent.includes('Ucz się kolejnej partii') && $('[data-more="30"]'), 'przyciski kolejnej partii');
  });
  await test('Zamrożenie serii przyznawane co 7 dni nauki', async () => {
    const t = today();
    for (let d = t - 6; d <= t - 1; d++) state.log[d] = { r: 5, n: 0, x: 0, ok: 5 };
    logActivity('ex', true);
    await sleep(10);
    eq(state.freezes, 1); eq(state.freezeEarned, t);
    logActivity('ex', true); await sleep(10);
    eq(state.freezes, 1, 'tylko raz dziennie');
  });

  /* ---------- Ekrany ---------- */
  const routes = ['#/home', '#/welcome', '#/learn', '#/pick', '#/practice', '#/build', '#/listen', '#/quiz', '#/placement', '#/placement/B1',
    '#/words', '#/decks', '#/deck/telecom', '#/stats', '#/settings', '#/import', '#/grammar', '#/glesson/articles', '#/gaps', '#/dictation',
    '#/pairs', '#/mix', '#/speak'];
  for (const r of routes) {
    await test('Ekran ' + r + ' renderuje się bez błędów', async () => {
      await go(r);
      assert(view.innerHTML.length > 100, 'pusty ekran');
      assert(!/undefined|NaN|\[object Object\]/.test(view.textContent), 'podejrzany tekst: ' + (view.textContent.match(/.{0,30}(undefined|NaN|\[object Object\]).{0,30}/) || [''])[0]);
    });
  }

  /* ---------- Ćwiczenia od początku do końca ---------- */
  await test('Ułóż zdanie: poprawne ułożenie = sukces', async () => {
    await go('#/build');
    const s = SENTENCES.find(x => x.pl === $('.prompt').textContent);
    for (const t of tokenize(s.en)) [...document.querySelectorAll('#bank .chip:not(.used)')].find(c => c.textContent === t).click();
    $('#check').click();
    assert($('#fb .feedback.ok'));
  });
  await test('Quiz: 10 pytań do wyniku', async () => {
    await go('#/quiz');
    for (let i = 0; i < 10; i++) { const w = quiz.qs[quiz.i]; [...document.querySelectorAll('.option')].find(o => o.dataset.id === w.id).click(); $('#next').click(); }
    assert(view.textContent.includes('Wynik: 10 / 10'));
  });
  await test('Dopasuj pary: komplet bez błędów', async () => {
    await go('#/pairs');
    for (const b of [...document.querySelectorAll('.pair[data-side="en"]')]) {
      b.click(); document.querySelector(`.pair[data-side="pl"][data-id="${CSS.escape(b.dataset.id)}"]`).click();
    }
    assert($('#pfb .feedback.ok'), 'bezbłędnie');
  });
  await test('Uzupełnij lukę: poprawna odpowiedź', async () => {
    await go('#/gaps');
    const p = $('.prompt').textContent;
    const w = practicePool(3, 14).filter(gapFor).find(x => { const g = gapFor(x); return p === g.before + g.answer.replace(/[^ ]/g, '•') + g.after; });
    $('#gapin').value = gapFor(w).answer; $('#gok').click();
    assert($('#gapfb .feedback.ok'));
  });
  await test('Trening mieszany: 5 zadań do podsumowania', async () => {
    await go('#/mix');
    $('[data-mt="5"]').click();
    for (let k = 0; k < 40 && mix; k++) {
      await sleep(20);
      const h = location.hash;
      if (h === '#/pairs') { for (const b of [...document.querySelectorAll('.pair[data-side="en"]:not(.done)')]) { b.click(); document.querySelector(`.pair[data-side="pl"][data-id="${CSS.escape(b.dataset.id)}"]`).click(); } $('#pnext').click(); }
      else if (h === '#/gaps') { $('#gapin').value = 'x'; $('#gok').click(); $('#gok').click(); }
      else if (h === '#/dictation') { $('#dskip').click(); $('#dok').click(); }
      else if (h === '#/build' || h === '#/listen') { $('#skip').click(); }
      else if (h === '#/gpractice') {
        const ex = LESSON_BY_ID.get(grun.items[0].lid).ex[grun.items[0].i];
        if (ex[0] === 'c') $(`.option[data-k="${ex[3]}"]`).click();
        else if (ex[0] === 'o') { $('#gcheck').click(); toks: for (const t of tokenize(ex[2])) [...document.querySelectorAll('#gbank .chip:not(.used)')].find(c => c.textContent === t).click(); $('#gcheck').click(); }
        else { $('#gin').value = ex[2][0]; $('#gcheck').click(); }
        $('#gcheck').click();
      }
    }
    await sleep(20);
    assert(view.textContent.includes('Trening ukończony'), 'brak podsumowania, ekran: ' + location.hash);
  });
  await test('Gramatyka: sesja 12 zadań, kolejne sesje bez powtórek', async () => {
    const ids = [];
    for (let s = 0; s < 2; s++) {
      startGrammarRun('present-perfect'); await sleep(20);
      while (grun && grun.pos < grun.items.length) {
        const { lid, i } = grun.items[grun.pos]; ids.push(i);
        const ex = LESSON_BY_ID.get(lid).ex[i];
        if (ex[0] === 'c') $(`.option[data-k="${ex[3]}"]`).click();
        else if (ex[0] === 'o') { for (const t of tokenize(ex[2])) [...document.querySelectorAll('#gbank .chip:not(.used)')].find(c => c.textContent === t).click(); $('#gcheck').click(); }
        else { $('#gin').value = ex[2][0]; $('#gcheck').click(); }
        assert($('#gfb .feedback.ok'), 'poprawna odpowiedź odrzucona: ' + ex[1]);
        $('#gcheck').click();
      }
    }
    eq(ids.length, 24); eq(new Set(ids).size, 24, 'powtórki między sesjami');
  });

  await test('Statystyki ćwiczeń: każdy rodzaj zapisuje wynik i pokazuje się w Postępach', async () => {
    // Ułóż zdanie (dobrze), quiz (10 dobrze), pary (dobrze), luka (źle), gramatyka (1 dobrze)
    await go('#/build');
    const s = SENTENCES.find(x => x.pl === $('.prompt').textContent);
    for (const t of tokenize(s.en)) [...document.querySelectorAll('#bank .chip:not(.used)')].find(c => c.textContent === t).click();
    $('#check').click();
    await go('#/quiz');
    for (let i = 0; i < 10; i++) { const w = quiz.qs[quiz.i]; [...document.querySelectorAll('.option')].find(o => o.dataset.id === w.id).click(); $('#next').click(); }
    await go('#/pairs');
    for (const b of [...document.querySelectorAll('.pair[data-side="en"]')]) { b.click(); document.querySelector(`.pair[data-side="pl"][data-id="${CSS.escape(b.dataset.id)}"]`).click(); }
    await go('#/gaps');
    $('#gapin').value = 'zzz'; $('#gok').click();
    startGrammarRun('present-perfect'); await sleep(20);
    const { lid, i } = grun.items[0]; const ex = LESSON_BY_ID.get(lid).ex[i];
    if (ex[0] === 'c') $(`.option[data-k="${ex[3]}"]`).click();
    else if (ex[0] === 'o') { for (const t of tokenize(ex[2])) [...document.querySelectorAll('#gbank .chip:not(.used)')].find(c => c.textContent === t).click(); $('#gcheck').click(); }
    else { $('#gin').value = ex[2][0]; $('#gcheck').click(); }
    grun = null;
    const xt = state.log[today()].xt;
    eq(xt.build.n, 1, 'ułóż'); eq(xt.build.ok, 1);
    eq(xt.quiz.n, 10, 'quiz (bez dodatkowego wpisu na końcu)'); eq(xt.quiz.ok, 10);
    eq(xt.pairs.n, 1, 'pary'); eq(xt.pairs.ok, 1);
    eq(xt.gaps.n, 1, 'luka'); eq(xt.gaps.ok, 0);
    eq(xt.grammar.n, 1, 'gramatyka'); eq(xt.grammar.ok, 1);
    eq(state.log[today()].x, 14, 'suma ćwiczeń');
    assert(Object.values(xt).every(v => v.t >= 0 && v.t <= 120000 * v.n), 'czas w granicach');
    await go('#/stats');
    const tbl = $('.ex-table');
    assert(tbl, 'brak tabeli ćwiczeń');
    for (const name of ['Ułóż zdanie', 'Quiz', 'Dopasuj pary', 'Uzupełnij lukę', 'Gramatyka']) assert(tbl.textContent.includes(name), 'brak wiersza ' + name);
    assert(!tbl.textContent.includes('Wymowa'), 'wymowa ukryta');
    assert(view.textContent.includes('93%'), 'skuteczność 13/14');
  });

  await test('Eksport kopii zapisuje plik JSON z całym postępem', async () => {
    state.cards.house = { s: 'review', S: 5, D: 5, iv: 5, reps: 2, lapses: 0, first: today(), last: today(), due: today() + 5 };
    const clicks = [];
    const origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () { clicks.push({ name: this.download, href: this.href }); };
    try {
      await go('#/settings');
      $('#exp').click(); await sleep(50);
    } finally { HTMLAnchorElement.prototype.click = origClick; }
    eq(clicks.length, 1, 'jedno pobranie');
    assert(/^inglisz-kopia-\d{4}-\d{2}-\d{2}\.json$/.test(clicks[0].name), 'nazwa pliku ' + clicks[0].name);
    const data = JSON.parse(await (await fetch(clicks[0].href)).text());
    assert(data.cards.house && data.custom, 'karty i talie w kopii');
  });
  await test('Platforma: wykrywanie iOS i trybu aplikacji nie psuje ekranu Start', async () => {
    assert(typeof IS_IOS === 'boolean' && typeof IS_STANDALONE === 'boolean');
    await go('#/home');
    assert(!!$('#ioshint') === (IS_IOS && !IS_STANDALONE), 'podpowiedź tylko na iPhonie w Safari');
  });

  await test('Lektor: wybiera najlepszy głos, pomija głosy-zabawki, pamięta wybór', async () => {
    const V = (name, lang, uri) => ({ name, lang, voiceURI: uri || name, localService: true });
    const list = [
      V('Albert', 'en-US', 'com.apple.speech.synthesis.voice.Albert'),
      V('Bubbles', 'en-US', 'com.apple.speech.synthesis.voice.Bubbles'),
      V('Fred', 'en-US', 'com.apple.speech.synthesis.voice.Fred'),
      V('Eddy (English (US))', 'en-US', 'com.apple.eloquence.en-US.Eddy'),
      V('Samantha', 'en-US', 'com.apple.voice.compact.en-US.Samantha'),
      V('Zoe', 'en-US', 'com.apple.voice.premium.en-US.Zoe'),
      V('Daniel', 'en-GB', 'com.apple.voice.compact.en-GB.Daniel'),
      V('Serena', 'en-GB', 'com.apple.voice.enhanced.en-GB.Serena'),
      V('Zosia', 'pl-PL', 'com.apple.voice.compact.pl-PL.Zosia'),
    ];
    state.settings.voicePick = {};
    state.settings.accent = 'en-US';
    eq(pickVoice(list).name, 'Zoe', 'Premium przed podstawowym');
    const us = voicesFor('en-US', list).map(v => v.name);
    assert(!us.includes('Albert') && !us.includes('Bubbles') && !us.includes('Fred'), 'bez głosów-zabawek: ' + us);
    eq(us[us.length - 1], 'Eddy (English (US))', 'robotyczny Eloquence na końcu');
    state.settings.accent = 'en-GB';
    eq(pickVoice(list).name, 'Serena', 'ulepszony przed podstawowym');
    state.settings.voicePick = { 'en-GB': 'com.apple.voice.compact.en-GB.Daniel' };
    eq(pickVoice(list).name, 'Daniel', 'wybór użytkownika ma pierwszeństwo');
    state.settings.voicePick = { 'en-GB': 'nieistniejacy' };
    eq(pickVoice(list).name, 'Serena', 'brak wybranego głosu → automatycznie');
    eq(pickVoice([V('Albert', 'en-US', 'com.apple.speech.synthesis.voice.Albert'), V('Karen', 'en-AU')]).name, 'Karen', 'inny angielski zamiast zabawki');
    state.settings.voicePick = {};
    state.settings.accent = 'en-US';
    await go('#/settings');
    assert($('#voice') && $('#voice').options[0].value === 'rec' && $('#voice').value === 'rec', 'domyślnie nagrany lektor');
    assert(!$('#acc'), 'bez wyboru akcentu');
    eq(normalizeState({ settings: { accent: 'en-GB' } }).settings.accent, 'en-US', 'tylko akcent amerykański');
  });
  await test('Nagrany lektor: klucz jak w make_audio.py, adres nagrania, głos telefonu na życzenie', async () => {
    eq(audioKey('Hello'), '63f0bfacf2c0'); eq(audioKey('  knowledge '), 'a7fc582d0cac');
    state.settings.accent = 'en-US'; state.settings.voicePick = {};
    const idx = await loadAudioIndex('en-US');
    assert(idx instanceof Set && idx.size > 0, 'indeks nagrań wczytany');
    const k = [...idx][0];
    audioIndex.us = new Set([audioKey('time')]);
    assert(recordingUrl('time').endsWith(`audio/us/${audioKey('time')}.mp3`), 'adres nagrania');
    eq(recordingUrl('zzz nieznane zdanie'), null, 'brak nagrania → głos telefonu');
    state.settings.voicePick = { 'en-US': 'sys' };
    eq(recordingUrl('time'), null, 'wybrany głos telefonu');
    state.settings.voicePick = {};
    audioIndex.us = idx;
    const r = await fetch(`${APP_BASE}audio/us/${k}.mp3`);
    assert(r.ok && (r.headers.get('content-type') || '').includes('audio'), 'plik nagrania dostępny');
  });

  /* ---------- Zapis ---------- */
  await test('Eksport/import stanu zachowuje dane', () => {
    state.cards.know = schedule(null, 4); state.edits.know = 'xx';
    const copy = normalizeState(JSON.parse(JSON.stringify(state)));
    assert(copy.cards.know && copy.edits.know === 'xx' && copy.settings.newPerDay === state.settings.newPerDay);
  });
  await test('Zapis do IndexedDB i odtworzenie', async () => {
    state.cards.know = schedule(null, 4); save(); await sleep(100);
    localStorage.removeItem(STORE_KEY); state = loadState();
    const r = await restoreFromIdb();
    assert(r && state.cards.know, 'nie odtworzono');
  });

  // Sprzątanie: przywróć dane użytkownika.
  if (backup.s) localStorage.setItem(STORE_KEY, backup.s); else localStorage.removeItem(STORE_KEY);
  if (backup.c) localStorage.setItem(CUSTOM_KEY, backup.c); else localStorage.removeItem(CUSTOM_KEY);
  state = normalizeState(JSON.parse(backupState)); custom = JSON.parse(backupCustom); applyCustom();
  try { await idb.set(STORE_KEY, backup.s || JSON.stringify(state)); } catch (e) { /* ignore */ }
  session = null; mix = null; grun = null;
  location.hash = '#/home';

  const failed = results.filter(r => !r.ok);
  window.__results = { total: results.length, failed: failed.length, failures: failed };
  const out = document.getElementById('results');
  if (out) out.innerHTML = `<h2>${results.length - failed.length} / ${results.length} testów zaliczonych</h2>` +
    results.map(r => `<div style="color:${r.ok ? 'green' : 'red'}">${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : ' — ' + r.msg}</div>`).join('');
})();
