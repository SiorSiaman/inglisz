// Lekcje gramatyki. Typy ćwiczeń:
//  ['c', zdanie z ___, [opcje], indeks poprawnej, wyjaśnienie]   wybór
//  ['g', zdanie z ___ (podpowiedź), [poprawne odpowiedzi], wyjaśnienie]   uzupełnij
//  ['f', zdanie z błędem, [poprawne wersje], wyjaśnienie]   popraw błąd
//  ['o', zdanie po polsku, zdanie po angielsku, wyjaśnienie]   ułóż zdanie
const GRAMMAR = [
{
  id: 'present-simple-continuous', level: 'A2', title: 'Present Simple czy Present Continuous',
  intro: `
<p><b>Present Simple</b> – rzeczy stałe, nawyki, fakty, rozkłady: <i>I <b>work</b> in telecoms. The train <b>leaves</b> at 8.</i></p>
<p><b>Present Continuous</b> – coś trwa teraz lub tymczasowo, plany na najbliższy czas: <i>I'<b>m working</b> from home this week.</i></p>
<p><b>Czasowniki stanu</b> (know, like, want, need, believe, understand, belong, seem) zwykle nie mają formy -ing: <i>I <b>know</b>, a nie <s>I'm knowing</s>.</i></p>
<p class="tip">Typowy błąd Polaków: brak -s w 3. osobie: <i>he <b>works</b>, she <b>doesn't</b> know</i>.</p>`,
  ex: [
    ['c', 'I usually ___ to work by bus.', ['go', 'am going', 'goes'], 0, '„usually” oznacza nawyk, więc Present Simple.'],
    ['g', 'Look! It ___ (snow).', ['is snowing', "'s snowing"], 'Coś dzieje się w tej chwili, więc Present Continuous.'],
    ['c', 'She ___ coffee. She prefers tea.', ["doesn't like", "isn't liking", "don't like"], 0, '„like” to czasownik stanu, a w 3. osobie mamy doesn\'t.'],
    ['f', 'I am knowing the answer.', ['I know the answer.'], '„know” to czasownik stanu – bez formy -ing.'],
    ['g', 'Our team ___ (work) on a new project this month.', ['is working', "'s working"], 'Sytuacja tymczasowa („this month”), więc Present Continuous.'],
    ['f', 'He work in a big company.', ['He works in a big company.'], 'W 3. osobie liczby pojedynczej dodajemy -s.'],
    ['c', 'The meeting ___ at 10 every Monday.', ['starts', 'is starting', 'start'], 0, 'Stały harmonogram, więc Present Simple.'],
    ['g', 'What ___ you ___ (do) tonight? – I\'m meeting friends.', ['are doing', 'are you doing'], 'Plan na najbliższy czas, więc Present Continuous.'],
    ['o', 'Teraz rozmawiam z klientem.', "I'm talking to a client now.", 'Czynność trwająca teraz.'],
    ['f', 'Do you understanding me?', ['Do you understand me?'], 'Po „do” stoi forma podstawowa czasownika.'],
  ],
},
{
  id: 'past-simple', level: 'A2', title: 'Past Simple i czasowniki nieregularne',
  intro: `
<p><b>Past Simple</b> – zakończone zdarzenie w przeszłości, często z określeniem czasu: <i>yesterday, last week, in 2019, two days ago</i>.</p>
<p>Regularne: <i>work → work<b>ed</b></i>. Nieregularne trzeba znać: <i>go → went, see → saw, buy → bought, take → took, send → sent</i>.</p>
<p>Pytania i przeczenia z <b>did</b> + forma podstawowa: <i>Did you <b>go</b>? I didn't <b>see</b> it.</i></p>
<p class="tip">Błąd: <s>I didn't went</s> → <i>I didn't <b>go</b></i>. Po „did” zawsze forma podstawowa.</p>`,
  ex: [
    ['g', 'I ___ (send) you the report yesterday.', ['sent'], 'send – sent – sent.'],
    ['f', "I didn't went to the meeting.", ["I didn't go to the meeting.", 'I did not go to the meeting.'], 'Po „didn\'t” stoi forma podstawowa.'],
    ['c', 'We ___ the contract last Friday.', ['signed', 'have signed', 'sign'], 0, 'Konkretny czas w przeszłości („last Friday”), więc Past Simple.'],
    ['g', 'She ___ (buy) a new laptop two days ago.', ['bought'], 'buy – bought – bought.'],
    ['g', 'When ___ you ___ (start) this job?', ['did start', 'did you start'], 'Pytanie w Past Simple: did + forma podstawowa.'],
    ['c', 'They ___ to Spain in 2022.', ['went', 'gone', 'have gone'], 0, 'go – went – gone. W Past Simple: went.'],
    ['f', 'Did you saw the email?', ['Did you see the email?'], 'Po „did” forma podstawowa: see.'],
    ['g', 'The engineer ___ (find) the problem quickly.', ['found'], 'find – found – found.'],
    ['o', 'Wczoraj nie miałem czasu.', "I didn't have time yesterday.", 'Przeczenie: didn\'t + have.'],
    ['g', 'I ___ (think) it was a good idea.', ['thought'], 'think – thought – thought.'],
  ],
},
{
  id: 'present-perfect', level: 'B1', title: 'Present Perfect czy Past Simple',
  intro: `
<p><b>Present Perfect</b> (have/has + III forma) łączy przeszłość z teraźniejszością: doświadczenie, skutek widoczny teraz, okres, który trwa.</p>
<p><i>I'<b>ve worked</b> here <b>for</b> five years.</i> (nadal pracuję) · <i>I'<b>ve</b> never <b>been</b> to Japan.</i> · <i>Have you <b>finished</b> yet?</i></p>
<p><b>Past Simple</b> – zakończony czas w przeszłości: <i>I <b>worked</b> there in 2018.</i></p>
<p>Sygnały Present Perfect: <i>ever, never, already, yet, just, so far, since, for, this week</i>. Sygnały Past Simple: <i>yesterday, ago, last…, in 2019, when…</i></p>
<p class="tip">Najczęstszy błąd Polaków: <s>I work here since 2020</s> → <i>I'<b>ve worked</b> here <b>since</b> 2020</i>. Po polsku mówimy w czasie teraźniejszym, po angielsku nie.</p>`,
  ex: [
    ['c', 'I ___ here since 2020.', ['have worked', 'work', 'worked'], 0, '„since” + sytuacja trwająca do teraz, więc Present Perfect.'],
    ['c', 'I ___ him last week.', ['saw', 'have seen', 'see'], 0, '„last week” to zakończony czas, więc Past Simple.'],
    ['f', 'I know him for ten years.', ["I've known him for ten years.", 'I have known him for ten years.'], 'Stan trwający do teraz + „for”, więc Present Perfect.'],
    ['g', '___ you ever ___ (be) to the USA?', ['have been', 'have you been'], 'Doświadczenie życiowe („ever”), więc Present Perfect.'],
    ['c', 'We ___ the update yet.', ["haven't installed", "didn't install", "don't install"], 0, '„yet” w przeczeniu, więc Present Perfect.'],
    ['g', 'The network ___ (be) down twice this week.', ['has been', "'s been"], 'Okres, który jeszcze trwa („this week”), więc Present Perfect.'],
    ['c', 'When ___ you ___ this company?', ['did / join', 'have / joined', 'do / join'], 0, 'Pytanie „when” dotyczy konkretnego momentu, więc Past Simple.'],
    ['f', 'Have you seen the match yesterday?', ['Did you see the match yesterday?'], '„yesterday” wymaga Past Simple.'],
    ['g', "I've just ___ (send) the invoice.", ['sent'], 'just + Present Perfect: have just sent.'],
    ['o', 'Jeszcze nie skończyłem raportu.', "I haven't finished the report yet.", 'yet na końcu zdania przeczącego.'],
  ],
},
{
  id: 'present-perfect-continuous', level: 'B1', title: 'Present Perfect Continuous',
  intro: `
<p><b>have/has been + -ing</b> – czynność, która trwa do teraz (albo właśnie się skończyła) i liczy się jej <b>długość</b>.</p>
<p><i>I'<b>ve been waiting</b> for an hour.</i> · <i>How long <b>have</b> you <b>been learning</b> English?</i> · <i>She's tired because she'<b>s been working</b> all day.</i></p>
<p>Present Perfect Simple – liczy się <b>wynik</b>: <i>I've written three emails.</i> Continuous – <b>proces</b>: <i>I've been writing emails all morning.</i></p>
<p class="tip">Po polsku: „Uczę się angielskiego od 5 lat” → <i>I'<b>ve been learning</b> English for 5 years</i>, nie <s>I learn</s>.</p>`,
  ex: [
    ['g', 'I ___ (wait) for the technician since 8 a.m.', ['have been waiting', "'ve been waiting"], 'Czynność trwa do teraz, liczy się czas.'],
    ['c', 'How long ___ English?', ['have you been learning', 'are you learning', 'do you learn'], 0, '„How long” + czynność trwająca do teraz.'],
    ['f', 'I learn English for five years.', ["I've been learning English for five years.", 'I have been learning English for five years.'], 'Czynność trwa od 5 lat do teraz.'],
    ['c', "I've ___ three reports today.", ['written', 'been writing', 'wrote'], 0, 'Liczy się wynik (trzy raporty), więc Present Perfect Simple.'],
    ['g', 'Her eyes are red. She ___ (cry).', ['has been crying', "'s been crying"], 'Widoczny skutek niedawnej czynności.'],
    ['c', 'They ___ on this project for months.', ['have been working', 'are working', 'work'], 0, 'Trwa od miesięcy do teraz.'],
    ['f', "I've been knowing her for years.", ["I've known her for years.", 'I have known her for years.'], 'Czasowniki stanu (know) nie mają formy continuous.'],
    ['o', 'Od rana naprawiamy tę awarię.', "We've been fixing this outage since the morning.", 'Proces trwający od rana.'],
  ],
},
{
  id: 'articles', level: 'B1', title: 'Przedimki: a / an / the / brak',
  intro: `
<p><b>a/an</b> – coś jednego, nieokreślonego, pierwszy raz: <i>I've got <b>a</b> problem. She's <b>an</b> engineer.</i> (zawody!)</p>
<p><b>the</b> – wiadomo, o co chodzi: już wspomniane, jedyne, konkretne: <i><b>The</b> problem is serious. <b>the</b> sun, <b>the</b> internet, <b>the</b> best.</i></p>
<p><b>brak</b> – ogólnie o rzeczach w liczbie mnogiej lub niepoliczalnych: <i><b>Engineers</b> earn well. I like <b>coffee</b>. <b>Life</b> is short.</i></p>
<p>Bez przedimka: większość krajów i miast (<i>Poland, Warsaw</i>), posiłki (<i>have lunch</i>), <i>go to work / at home / by car</i>.</p>
<p class="tip">Po polsku nie ma przedimków, dlatego to najczęstszy błąd Polaków. Zasada startowa: przed rzeczownikiem policzalnym w liczbie pojedynczej <b>zawsze</b> coś musi stać (a/the/my/this…).</p>`,
  ex: [
    ['c', 'She is ___ engineer.', ['an', 'a', '—'], 0, 'Zawód z a/an; „engineer” zaczyna się samogłoską w wymowie, więc an.'],
    ['c', "I've got ___ idea. ___ idea is simple.", ['an / The', 'the / An', 'an / An'], 0, 'Pierwsze wspomnienie: an; potem wiadomo jaki: the.'],
    ['c', '___ life is too short.', ['—', 'The', 'A'], 0, 'Ogólnie o pojęciu abstrakcyjnym, więc bez przedimka.'],
    ['f', 'He is best engineer in our team.', ['He is the best engineer in our team.', "He's the best engineer in our team."], 'Stopień najwyższy zawsze z the.'],
    ['c', 'We need ___ new router.', ['a', 'the', '—'], 0, 'Jeden, dowolny, pierwszy raz: a.'],
    ['c', 'Can you close ___ window, please?', ['the', 'a', '—'], 0, 'Wiadomo, o które okno chodzi: the.'],
    ['f', 'I usually go to the work by car.', ['I usually go to work by car.'], '„go to work” bez przedimka.'],
    ['c', '___ customers expect fast internet.', ['—', 'The', 'A'], 0, 'Klienci ogólnie, liczba mnoga: bez przedimka.'],
    ['c', "It's ___ honour to meet you.", ['an', 'a', 'the'], 0, '„honour” – nieme h, wymowa zaczyna się samogłoską, więc an.'],
    ['c', 'I found ___ information on ___ internet.', ['— / the', 'an / the', 'the / an'], 0, '„information” jest niepoliczalne (bez a), „the internet” zawsze z the.'],
    ['f', 'I have question.', ['I have a question.', "I've got a question."], 'Rzeczownik policzalny w liczbie pojedynczej musi mieć przedimek.'],
  ],
},
{
  id: 'future', level: 'B1', title: 'Przyszłość: will, going to, Present Continuous',
  intro: `
<p><b>will</b> – decyzja w chwili mówienia, obietnica, przewidywanie oparte na opinii: <i>I'<b>ll</b> call you back. I think it <b>will</b> work.</i></p>
<p><b>going to</b> – zamiar podjęty wcześniej, przewidywanie na podstawie dowodów: <i>We'<b>re going to</b> upgrade the network. Look at those clouds – it'<b>s going to</b> rain.</i></p>
<p><b>Present Continuous</b> – ustalone plany z datą i godziną: <i>I'<b>m meeting</b> the client on Monday.</i></p>
<p><b>Present Simple</b> – rozkłady: <i>The flight <b>leaves</b> at 6.</i></p>
<p class="tip">Po „when, as soon as, before, after, until, if” <b>nie</b> używamy will: <i>I'll call you when I <b>arrive</b></i>, nie <s>when I will arrive</s>.</p>`,
  ex: [
    ['c', 'The phone is ringing. – I ___ it.', ["'ll get", "'m going to get", 'get'], 0, 'Decyzja w chwili mówienia: will.'],
    ['c', "We've decided. We ___ move to a new office.", ["'re going to", "'ll", 'move'], 0, 'Zamiar podjęty wcześniej: going to.'],
    ['f', "I'll call you when I will arrive.", ["I'll call you when I arrive.", 'I will call you when I arrive.'], 'Po „when” w znaczeniu przyszłym: Present Simple.'],
    ['c', 'I ___ the client at 3 p.m. tomorrow. It\'s in my calendar.', ["'m meeting", "'ll meet", 'meet'], 0, 'Ustalony plan z godziną: Present Continuous.'],
    ['g', "Look at that queue! We ___ (miss) the flight.", ["'re going to miss", 'are going to miss'], 'Przewidywanie na podstawie tego, co widzimy: going to.'],
    ['c', 'Our train ___ at 7:15.', ['leaves', 'will leave', 'is going to leave'], 0, 'Rozkład jazdy: Present Simple.'],
    ['f', "Don't worry, I'm going to help you – I promise.", ["Don't worry, I'll help you – I promise.", "Don't worry, I will help you – I promise."], 'Obietnica: will.'],
    ['o', 'Zadzwonię do ciebie, jak tylko skończę.', "I'll call you as soon as I finish.", 'as soon as + Present Simple.'],
  ],
},
{
  id: 'comparatives', level: 'A2', title: 'Stopniowanie przymiotników',
  intro: `
<p>Krótkie przymiotniki: <i>fast → fast<b>er</b> → the fast<b>est</b>; big → bigger; easy → easier</i>.</p>
<p>Długie: <i>expensive → <b>more</b> expensive → the <b>most</b> expensive</i>.</p>
<p>Nieregularne: <i>good → better → the best; bad → worse → the worst; far → further</i>.</p>
<p>Porównanie: <i>faster <b>than</b></i> · <i><b>as</b> fast <b>as</b></i> · <i>not as fast as</i> · <i>the more…, the better</i>.</p>
<p class="tip">Błąd: <s>more better</s>, <s>more faster</s>. Albo -er, albo more – nigdy oba.</p>`,
  ex: [
    ['g', 'Fibre is ___ (fast) than copper.', ['faster'], 'Krótki przymiotnik: -er + than.'],
    ['f', 'This plan is more better.', ['This plan is better.'], 'good → better, bez more.'],
    ['g', 'It is the ___ (expensive) option.', ['most expensive'], 'Długi przymiotnik: the most.'],
    ['c', 'The new router is ___ the old one.', ['as good as', 'as good than', 'so good as'], 0, 'Równość: as … as.'],
    ['g', 'Today the network is ___ (bad) than yesterday.', ['worse'], 'bad → worse → the worst.'],
    ['c', 'The ___ we start, the sooner we finish.', ['earlier', 'earliest', 'more early'], 0, 'Konstrukcja the + stopień wyższy…, the + stopień wyższy.'],
    ['f', 'She is the most smart person in the team.', ['She is the smartest person in the team.', "She's the smartest person in the team."], 'smart jest krótki: the smartest.'],
    ['o', 'To jest najłatwiejsze rozwiązanie.', 'This is the easiest solution.', 'easy → easier → the easiest.'],
  ],
},
{
  id: 'quantifiers', level: 'A2', title: 'Policzalne i niepoliczalne: much, many, some, any',
  intro: `
<p><b>Policzalne</b> (one email, two emails): <i>many, a few, fewer</i>. <b>Niepoliczalne</b> (information, advice, money, equipment, news, feedback, software, traffic): <i>much, a little, less</i>.</p>
<p><b>a lot of</b> – z obydwoma, szczególnie w zdaniach twierdzących.</p>
<p><b>some</b> – zdania twierdzące i propozycje (<i>Would you like some coffee?</i>), <b>any</b> – pytania i przeczenia.</p>
<p class="tip">Polacy mówią <s>an information</s>, <s>advices</s>, <s>equipments</s>. Te słowa są po angielsku niepoliczalne: <i>a piece of information, some advice</i>.</p>`,
  ex: [
    ['c', 'How ___ time do we have?', ['much', 'many', 'a few'], 0, '„time” jest niepoliczalny: much.'],
    ['c', 'How ___ customers complained?', ['many', 'much', 'a little'], 0, '„customers” są policzalni: many.'],
    ['f', 'Can you give me an advice?', ['Can you give me some advice?', 'Can you give me a piece of advice?', 'Can you give me advice?'], '„advice” jest niepoliczalne.'],
    ['f', 'Thanks for the informations.', ['Thanks for the information.'], '„information” nie ma liczby mnogiej.'],
    ['c', "We don't have ___ spare parts.", ['any', 'some', 'much'], 0, 'Przeczenie: any.'],
    ['c', 'There is ___ traffic on the network today.', ['less', 'fewer', 'many'], 0, '„traffic” niepoliczalne: less.'],
    ['c', 'Would you like ___ tea?', ['some', 'any', 'many'], 0, 'Propozycja: some.'],
    ['f', 'We bought new equipments.', ['We bought new equipment.'], '„equipment” jest niepoliczalne.'],
    ['c', 'There were only ___ problems after the update.', ['a few', 'a little', 'much'], 0, '„problems” policzalne: a few.'],
  ],
},
{
  id: 'prepositions-time', level: 'A2', title: 'Przyimki czasu: in, on, at',
  intro: `
<p><b>at</b> – godziny i momenty: <i>at 5 o'clock, at night, at the weekend (BrE), at Christmas</i>.</p>
<p><b>on</b> – dni i daty: <i>on Monday, on 5 May, on my birthday, on Monday morning</i>.</p>
<p><b>in</b> – dłuższe okresy: <i>in May, in 2024, in the morning, in summer, in two weeks</i> (= za dwa tygodnie).</p>
<p>Bez przyimka: <i>last week, next Monday, this morning, every day, tomorrow</i>.</p>
<p class="tip">„Za tydzień” to <i><b>in</b> a week</i>, nie <s>after a week</s>.</p>`,
  ex: [
    ['c', 'The meeting is ___ Monday.', ['on', 'in', 'at'], 0, 'Dni tygodnia: on.'],
    ['c', 'I was born ___ 1990.', ['in', 'on', 'at'], 0, 'Lata: in.'],
    ['c', 'Call me ___ 3 p.m.', ['at', 'on', 'in'], 0, 'Godziny: at.'],
    ['f', "I'll be back after two weeks.", ["I'll be back in two weeks.", 'I will be back in two weeks.'], '„Za dwa tygodnie” = in two weeks.'],
    ['f', 'See you on next Monday.', ['See you next Monday.'], 'Z next/last/this nie używamy przyimka.'],
    ['c', 'We have maintenance ___ night.', ['at', 'in', 'on'], 0, 'at night (ale in the morning/evening).'],
    ['c', 'The office is closed ___ Christmas Day.', ['on', 'at', 'in'], 0, 'Konkretny dzień: on.'],
    ['c', "I'm usually tired ___ the evening.", ['in', 'at', 'on'], 0, 'in the morning / afternoon / evening.'],
  ],
},
{
  id: 'modals-obligation', level: 'B1', title: 'Obowiązek i rada: must, have to, should, don\'t have to',
  intro: `
<p><b>must</b> – obowiązek wynikający z mówiącego lub przepisów: <i>You <b>must</b> wear a helmet on site.</i></p>
<p><b>have to</b> – obowiązek z zewnątrz, także w przeszłości: <i>I <b>had to</b> work late yesterday.</i></p>
<p><b>mustn't</b> = nie wolno · <b>don't have to</b> = nie trzeba (ale można).</p>
<p><b>should / shouldn't</b> – rada: <i>You <b>should</b> restart the router.</i></p>
<p class="tip">Pułapka: <i>You <b>mustn't</b> come</i> (zakaz) ≠ <i>You <b>don't have to</b> come</i> (nie musisz).</p>`,
  ex: [
    ['c', 'You ___ smoke here. It\'s forbidden.', ["mustn't", "don't have to", "shouldn't to"], 0, 'Zakaz: mustn\'t.'],
    ['c', "It's Saturday, so I ___ get up early.", ["don't have to", "mustn't", "haven't"], 0, 'Brak obowiązku: don\'t have to.'],
    ['g', 'Yesterday I ___ (have to) stay late.', ['had to'], 'Przeszłość od must/have to: had to.'],
    ['f', 'You should to call the support.', ['You should call the support.', 'You should call support.'], 'Po should bez „to”.'],
    ['c', 'You look tired. You ___ take a break.', ['should', 'must not', "don't have to"], 0, 'Rada: should.'],
    ['f', 'Do I must sign this?', ['Do I have to sign this?', 'Must I sign this?'], 'Pytanie: Do I have to…? albo Must I…?'],
    ['o', 'Nie musisz mi odpisywać.', "You don't have to reply to me.", 'Brak obowiązku.'],
    ['c', 'All visitors ___ register at reception.', ['must', 'should to', 'have'], 0, 'Przepis, oficjalny obowiązek: must.'],
  ],
},
{
  id: 'conditionals-1-2', level: 'B1', title: 'Tryb warunkowy: first i second conditional',
  intro: `
<p><b>First conditional</b> – realna sytuacja w przyszłości: <i>If + Present Simple, will + czasownik</i>.<br><i>If the test <b>fails</b>, we'<b>ll</b> roll back.</i></p>
<p><b>Second conditional</b> – sytuacja nierealna lub mało prawdopodobna teraz: <i>If + Past Simple, would + czasownik</i>.<br><i>If I <b>had</b> more time, I <b>would</b> learn Spanish.</i></p>
<p>W second conditional poprawnie i elegancko: <i>If I <b>were</b> you…</i></p>
<p class="tip">Nigdy <s>If I will…</s> ani <s>If I would…</s> w części z „if”.</p>`,
  ex: [
    ['g', 'If it ___ (rain), we will stay at home.', ['rains'], 'First conditional: if + Present Simple.'],
    ['f', 'If I will have time, I will call you.', ['If I have time, I will call you.', "If I have time, I'll call you."], 'Po „if” bez will.'],
    ['c', 'If I ___ rich, I would travel the world.', ['were', 'am', 'will be'], 0, 'Second conditional: if + Past Simple (were).'],
    ['g', 'If you ___ (press) this button, the device restarts.', ['press'], 'Prawda ogólna (zero conditional): Present + Present.'],
    ['c', 'What would you do if you ___ your job?', ['lost', 'lose', 'will lose'], 0, 'Sytuacja hipotetyczna: Past Simple.'],
    ['f', 'If I would know the answer, I would tell you.', ['If I knew the answer, I would tell you.', "If I knew the answer, I'd tell you."], 'W części z if: Past Simple, nie would.'],
    ['c', 'If I ___ you, I would accept the offer.', ['were', 'am', 'be'], 0, 'If I were you – rada.'],
    ['o', 'Jeśli skończę wcześniej, zadzwonię do ciebie.', "If I finish early, I'll call you.", 'First conditional.'],
    ['o', 'Gdybym miał samochód, jeździłbym do pracy.', 'If I had a car, I would drive to work.', 'Second conditional.'],
  ],
},
{
  id: 'conditionals-3-mixed', level: 'B2', title: 'Third i mixed conditionals',
  intro: `
<p><b>Third conditional</b> – przeszłość, której nie da się zmienić: <i>If + Past Perfect, would have + III forma</i>.<br><i>If we <b>had tested</b> it, we <b>wouldn't have had</b> the outage.</i></p>
<p><b>Mixed</b> – warunek w przeszłości, skutek teraz: <i>If I <b>had studied</b> IT, I <b>would be</b> a programmer now.</i><br>
Albo cecha teraz, skutek w przeszłości: <i>If I <b>were</b> more careful, I <b>wouldn't have made</b> that mistake.</i></p>
<p class="tip">Skróty: <i>I'd have = I would have</i>; w mowie „would have” brzmi jak „would’ve”. Nie piszemy <s>would of</s>.</p>`,
  ex: [
    ['g', 'If I ___ (know), I would have helped you.', ['had known', "'d known"], 'Third conditional: if + Past Perfect.'],
    ['c', 'If we had left earlier, we ___ the train.', ["wouldn't have missed", "wouldn't miss", "didn't miss"], 0, 'Skutek w przeszłości: would have + III forma.'],
    ['f', 'If I would have seen it, I would have told you.', ['If I had seen it, I would have told you.', "If I'd seen it, I would have told you."], 'Po if: Past Perfect, nie would have.'],
    ['c', 'If I had taken that job, I ___ in London now.', ['would live', 'would have lived', 'will live'], 0, 'Mixed: przeszły warunek, skutek teraz.'],
    ['g', 'If she ___ (not / be) so busy, she would have come.', ["hadn't been", 'had not been', "wasn't", "weren't"], 'Third conditional (albo mixed, gdy chodzi o stałą cechę).'],
    ['f', 'If we had tested it, we would of found the bug.', ['If we had tested it, we would have found the bug.', "If we'd tested it, we would have found the bug."], '„would have”, nie „would of”.'],
    ['c', "If I spoke better English, I ___ that interview last year.", ['would have passed', 'would pass', 'passed'], 0, 'Mixed: cecha teraz, skutek w przeszłości.'],
    ['o', 'Gdybym wiedział o awarii, przyjechałbym wcześniej.', 'If I had known about the outage, I would have come earlier.', 'Third conditional.'],
  ],
},
{
  id: 'passive', level: 'B1', title: 'Strona bierna',
  intro: `
<p>Gdy ważniejsze jest <b>co się dzieje</b> niż kto to robi: <b>be + III forma</b>.</p>
<p><i>The network <b>is monitored</b> 24/7.</i> · <i>The cable <b>was damaged</b> yesterday.</i> · <i>The issue <b>has been fixed</b>.</i> · <i>It <b>will be installed</b> next week.</i> · <i>The site <b>is being upgraded</b>.</i></p>
<p>Wykonawca z <b>by</b>: <i>The bug was found <b>by</b> our tester.</i></p>
<p class="tip">W mailach technicznych strona bierna brzmi profesjonalnie: <i>The ticket <b>has been escalated</b>.</i></p>`,
  ex: [
    ['g', 'The router ___ (replace) yesterday.', ['was replaced'], 'Past Simple passive: was + III forma.'],
    ['g', 'The issue ___ already ___ (fix).', ['has been fixed', 'has already been fixed'], 'Present Perfect passive: has been + III forma.'],
    ['c', 'English ___ all over the world.', ['is spoken', 'speaks', 'is speaking'], 0, 'Present Simple passive.'],
    ['f', 'The new mast will build next month.', ['The new mast will be built next month.'], 'Przyszłość w stronie biernej: will be + III forma.'],
    ['c', 'The site ___ at the moment.', ['is being upgraded', 'is upgraded', 'upgrades'], 0, 'Teraz, w trakcie: is being + III forma.'],
    ['g', 'All data ___ (store) in the cloud.', ['is stored'], 'Fakt ogólny: is + III forma.'],
    ['f', 'The email was send to all clients.', ['The email was sent to all clients.'], 'III forma od send: sent.'],
    ['o', 'Zgłoszenie zostało eskalowane do drugiej linii.', 'The ticket has been escalated to the second line.', 'Present Perfect passive.'],
  ],
},
{
  id: 'reported-speech', level: 'B2', title: 'Mowa zależna',
  intro: `
<p>Gdy relacjonujemy czyjeś słowa po czasie, czas zwykle „cofa się”:</p>
<p><i>"I <b>am</b> busy." → He said (that) he <b>was</b> busy.</i><br><i>"We <b>will</b> fix it." → They said they <b>would</b> fix it.</i><br><i>"I <b>have</b> sent it." → She said she <b>had sent</b> it.</i></p>
<p><b>say</b> vs <b>tell</b>: <i>say (that)…</i>, ale <i>tell <b>someone</b> (that)…</i></p>
<p>Pytania: szyk zdania twierdzącego: <i>He asked where I <b>worked</b></i> (nie <s>where did I work</s>). Tak/nie: <i>She asked <b>if</b> I was ready.</i></p>
<p>Prośby i polecenia: <i>He asked me <b>to call</b> him. She told me <b>not to worry</b>.</i></p>`,
  ex: [
    ['c', 'She ___ me that she was tired.', ['told', 'said', 'spoke'], 0, 'tell + osoba.'],
    ['g', '"I am busy." → He said he ___ busy.', ['was'], 'am → was.'],
    ['g', '"We will call you." → They said they ___ call us.', ['would'], 'will → would.'],
    ['f', 'He asked me where did I live.', ['He asked me where I lived.'], 'W pytaniu zależnym szyk twierdzący, bez did.'],
    ['c', 'She asked ___ I could help her.', ['if', 'that', 'what'], 0, 'Pytanie tak/nie: if / whether.'],
    ['f', 'He said me that the system was down.', ['He told me that the system was down.', 'He said that the system was down.', 'He told me the system was down.'], 'say bez osoby; z osobą: tell me.'],
    ['g', '"Don\'t touch the cable." → He told me ___ the cable.', ['not to touch'], 'Zakaz: told someone not to + czasownik.'],
    ['o', 'Zapytał mnie, czy skończyłem raport.', 'He asked me if I had finished the report.', 'Pytanie tak/nie + cofnięcie czasu.'],
  ],
},
{
  id: 'modals-deduction', level: 'B2', title: 'Przypuszczenia: must, might, can\'t (have)',
  intro: `
<p>O teraźniejszości: <b>must</b> (na pewno tak), <b>might/may/could</b> (może), <b>can't</b> (na pewno nie).</p>
<p><i>He's not answering. He <b>must</b> be in a meeting.</i> · <i>That <b>can't</b> be true.</i></p>
<p>O przeszłości: <b>must/might/can't + have + III forma</b>: <i>The cable <b>must have been</b> cut.</i> · <i>She <b>might have forgotten</b>.</i> · <i>He <b>can't have seen</b> it.</i></p>
<p class="tip">Przeciwieństwo „must” w przypuszczeniach to <b>can't</b>, a nie <s>mustn't</s>.</p>`,
  ex: [
    ['c', "The lights are off. They ___ be at home.", ["can't", "mustn't", "don't have to"], 0, 'Pewność, że nie: can\'t.'],
    ['c', "He's been working for 12 hours. He ___ be exhausted.", ['must', 'can\'t', 'should to'], 0, 'Logiczny wniosek: must.'],
    ['g', 'The link is down. Someone ___ (must / cut) the cable.', ['must have cut'], 'Przypuszczenie o przeszłości: must have + III forma.'],
    ['f', "She mustn't be at work, her car is not here.", ["She can't be at work, her car is not here.", "She can't be at work, her car isn't here."], 'Pewność, że nie: can\'t.'],
    ['c', "I'm not sure where he is. He ___ be on holiday.", ['might', 'must', "can't"], 0, 'Niepewność: might.'],
    ['g', 'You ___ (can\'t / see) him yesterday – he was in Berlin.', ["can't have seen", 'cannot have seen'], 'Niemożliwe w przeszłości: can\'t have + III forma.'],
    ['f', 'He might forgot about the meeting.', ['He might have forgotten about the meeting.'], 'O przeszłości: might have + III forma.'],
    ['o', 'Musiałem zostawić telefon w biurze.', 'I must have left my phone in the office.', 'Wniosek o przeszłości.'],
  ],
},
{
  id: 'gerund-infinitive', level: 'B2', title: 'Gerund czy bezokolicznik',
  intro: `
<p><b>-ing</b> po: <i>enjoy, avoid, finish, mind, suggest, consider, keep, look forward to, be used to</i> oraz po przyimkach: <i>interested <b>in</b> learning</i>.</p>
<p><b>to + czasownik</b> po: <i>want, decide, plan, agree, refuse, manage, need, hope, offer, promise, would like</i>.</p>
<p>Zmiana znaczenia: <i>stop <b>to</b> call</i> (zatrzymać się, żeby zadzwonić) vs <i>stop <b>calling</b></i> (przestać dzwonić); <i>remember <b>to</b> send</i> (pamiętać, żeby wysłać) vs <i>remember <b>sending</b></i> (pamiętać, że się wysłało).</p>
<p class="tip">Bardzo częsty błąd w mailach: <s>I look forward to hear from you</s> → <i>I look forward to <b>hearing</b> from you.</i></p>`,
  ex: [
    ['f', 'I look forward to hear from you.', ['I look forward to hearing from you.'], '„look forward to” + -ing.'],
    ['c', 'We decided ___ the supplier.', ['to change', 'changing', 'change'], 0, 'decide + to.'],
    ['c', 'Would you mind ___ the window?', ['opening', 'to open', 'open'], 0, 'mind + -ing.'],
    ['g', 'He suggested ___ (take) a break.', ['taking'], 'suggest + -ing.'],
    ['c', "I'm interested in ___ more about 5G.", ['learning', 'to learn', 'learn'], 0, 'Po przyimku: -ing.'],
    ['f', 'She managed fixing the problem.', ['She managed to fix the problem.'], 'manage + to.'],
    ['c', 'Remember ___ the door when you leave.', ['to lock', 'locking', 'lock'], 0, 'Pamiętać, żeby coś zrobić: remember to.'],
    ['c', 'I stopped ___ coffee. Now I drink tea.', ['drinking', 'to drink', 'drink'], 0, 'Przestać coś robić: stop + -ing.'],
    ['o', 'Unikaj wysyłania dużych załączników.', 'Avoid sending large attachments.', 'avoid + -ing.'],
  ],
},
{
  id: 'relative-clauses', level: 'B2', title: 'Zdania względne: who, which, that, whose',
  intro: `
<p><b>who</b> – ludzie, <b>which</b> – rzeczy, <b>that</b> – ludzie i rzeczy (tylko w zdaniach definiujących), <b>whose</b> – czyj, <b>where</b> – gdzie.</p>
<p><b>Definiujące</b> (bez przecinków, informacja niezbędna): <i>The engineer <b>who</b> fixed it is new.</i> Gdy zaimek jest dopełnieniem, można go pominąć: <i>The router (that) we bought is fast.</i></p>
<p><b>Niedefiniujące</b> (z przecinkami, informacja dodatkowa, bez „that”): <i>Our CEO, <b>who</b> lives in Warsaw, visited the site.</i></p>`,
  ex: [
    ['c', 'The technician ___ came yesterday was very helpful.', ['who', 'which', 'whose'], 0, 'Osoba: who.'],
    ['c', 'This is the router ___ keeps crashing.', ['that', 'who', 'where'], 0, 'Rzecz w zdaniu definiującym: that / which.'],
    ['c', 'That\'s the colleague ___ laptop was stolen.', ['whose', 'who', 'which'], 0, 'Czyj: whose.'],
    ['f', 'Our office, that is in Kraków, is new.', ['Our office, which is in Kraków, is new.'], 'W zdaniu z przecinkami nie używamy that.'],
    ['c', 'The town ___ I grew up is small.', ['where', 'which', 'who'], 0, 'Miejsce: where.'],
    ['f', 'The man which called you is my boss.', ['The man who called you is my boss.', 'The man that called you is my boss.'], 'Osoba: who / that.'],
    ['o', 'To jest firma, dla której pracuję.', 'This is the company I work for.', 'Zaimek-dopełnienie można pominąć; przyimek na końcu.'],
    ['g', 'Warsaw, ___ is the capital, has great tech companies.', ['which'], 'Zdanie niedefiniujące o rzeczy: which.'],
  ],
},
{
  id: 'used-to', level: 'B2', title: 'used to, be used to, get used to',
  intro: `
<p><b>used to + czasownik</b> – kiedyś (a już nie): <i>I <b>used to</b> smoke.</i> Pytanie: <i>Did you <b>use to</b>…?</i></p>
<p><b>be used to + -ing / rzeczownik</b> – być przyzwyczajonym: <i>I'<b>m used to working</b> nights.</i></p>
<p><b>get used to + -ing / rzeczownik</b> – przyzwyczajać się: <i>You'll <b>get used to</b> the new system.</i></p>
<p class="tip">Po „be/get used to” stoi -ing: <s>I'm used to work</s> → <i>I'm used to <b>working</b></i>.</p>`,
  ex: [
    ['c', 'I ___ live in Gdańsk, but now I live in Warsaw.', ['used to', 'am used to', 'use to'], 0, 'Dawny stan, który się skończył: used to.'],
    ['f', "I'm used to work at night.", ["I'm used to working at night.", 'I am used to working at night.'], 'be used to + -ing.'],
    ['c', "Don't worry, you'll ___ the new software.", ['get used to', 'use to', 'used to'], 0, 'Proces przyzwyczajania: get used to.'],
    ['g', '___ you ___ (use to) play football?', ['did use to', 'did you use to'], 'Pytanie: Did you use to…?'],
    ['c', "She isn't ___ driving on the left.", ['used to', 'use to', 'using to'], 0, 'Nie jest przyzwyczajona: isn\'t used to.'],
    ['f', 'He is used to get up early.', ['He is used to getting up early.', "He's used to getting up early."], 'be used to + -ing.'],
    ['o', 'Kiedyś pracowałem w banku.', 'I used to work in a bank.', 'used to + czasownik.'],
  ],
},
{
  id: 'wish', level: 'B2', title: 'wish i if only',
  intro: `
<p>Żal dotyczący <b>teraz</b>: <i>wish + Past Simple</i>: <i>I <b>wish</b> I <b>had</b> more time.</i> (I wish I <b>were</b>… też poprawne)</p>
<p>Żal dotyczący <b>przeszłości</b>: <i>wish + Past Perfect</i>: <i>I <b>wish</b> I <b>had studied</b> harder.</i></p>
<p>Irytacja, chęć zmiany czyjegoś zachowania: <i>wish + would</i>: <i>I <b>wish</b> you <b>would</b> stop interrupting.</i></p>
<p><b>If only</b> = mocniejsze „wish”: <i>If only I <b>knew</b>!</i></p>`,
  ex: [
    ['g', 'I wish I ___ (have) a car.', ['had'], 'Teraz: wish + Past Simple.'],
    ['g', 'I wish I ___ (not / say) that yesterday.', ["hadn't said", 'had not said'], 'Przeszłość: wish + Past Perfect.'],
    ['f', 'I wish I would be taller.', ['I wish I were taller.', 'I wish I was taller.'], 'O sobie, o stanie: wish + Past Simple (were).'],
    ['c', 'I wish my neighbours ___ make so much noise.', ["wouldn't", "didn't have", "won't"], 0, 'Irytacja czyimś zachowaniem: wish + would.'],
    ['c', 'If only I ___ about it earlier!', ['had known', 'knew', 'would know'], 0, 'Żal o przeszłość: Past Perfect.'],
    ['o', 'Żałuję, że nie mówię lepiej po angielsku.', 'I wish I spoke better English.', 'Żal o teraźniejszość.'],
  ],
},
{
  id: 'narrative-tenses', level: 'B2', title: 'Czasy narracji: Past Continuous i Past Perfect',
  intro: `
<p><b>Past Continuous</b> – tło, czynność w trakcie: <i>I <b>was driving</b> to work when the phone rang.</i></p>
<p><b>Past Simple</b> – główne zdarzenia po kolei.</p>
<p><b>Past Perfect</b> (had + III forma) – coś, co stało się <b>wcześniej</b> niż inne zdarzenie w przeszłości: <i>When I arrived, the meeting <b>had</b> already <b>started</b>.</i></p>
<p class="tip">Porównaj: <i>When I arrived, they <b>left</b></i> (wyszli, gdy przyszedłem) vs <i>they <b>had left</b></i> (już ich nie było).</p>`,
  ex: [
    ['c', 'I ___ a shower when the alarm went off.', ['was having', 'had', 'have had'], 0, 'Czynność w trakcie przerwana innym zdarzeniem: Past Continuous.'],
    ['c', 'When we got to the station, the train ___.', ['had already left', 'already left', 'has already left'], 0, 'Wcześniej niż inne zdarzenie w przeszłości: Past Perfect.'],
    ['g', 'While I ___ (work), the power went out.', ['was working'], 'while + czynność w toku.'],
    ['f', 'I realised I forgot my badge.', ['I realised I had forgotten my badge.', "I realised I'd forgotten my badge."], 'Zapomniałem wcześniej, niż zauważyłem: Past Perfect.'],
    ['c', 'What ___ you ___ at 8 p.m. yesterday?', ['were / doing', 'did / do', 'had / done'], 0, 'Czynność w toku w danym momencie przeszłym.'],
    ['o', 'Kiedy przyjechałem, technik już naprawił awarię.', 'When I arrived, the technician had already fixed the fault.', 'Past Perfect dla wcześniejszego zdarzenia.'],
  ],
},
{
  id: 'causative', level: 'B2', title: 'have / get something done',
  intro: `
<p>Gdy ktoś robi coś <b>dla nas</b> (zlecamy to): <b>have/get + rzecz + III forma</b>.</p>
<p><i>I <b>had</b> my car <b>repaired</b>.</i> (mechanik naprawił) · <i>We're <b>getting</b> the office <b>painted</b>.</i> · <i>You should <b>get</b> your eyes <b>tested</b>.</i></p>
<p>Także o nieprzyjemnych zdarzeniach: <i>He <b>had</b> his phone <b>stolen</b>.</i></p>
<p class="tip">Po polsku: „Obciąłem włosy” (u fryzjera) → <i>I <b>had</b> my hair <b>cut</b></i>, a nie <s>I cut my hair</s> (sam je obciąłem).</p>`,
  ex: [
    ['c', 'I ___ my hair cut yesterday.', ['had', 'did', 'made'], 0, 'Zlecona usługa: have + rzecz + III forma.'],
    ['g', 'We need to get the router ___ (replace).', ['replaced'], 'get + rzecz + III forma.'],
    ['f', 'I must repair my car at the garage.', ['I must have my car repaired at the garage.', 'I must get my car repaired at the garage.'], 'Robi to warsztat: have/get my car repaired.'],
    ['c', 'She had her bag ___ on the train.', ['stolen', 'stole', 'steal'], 0, 'Nieprzyjemne zdarzenie: had + rzecz + III forma.'],
    ['o', 'Muszę sprawdzić wzrok.', 'I need to have my eyes tested.', 'Usługa wykonywana przez kogoś innego.'],
  ],
},
{
  id: 'indirect-questions', level: 'B2', title: 'Pytania pośrednie i question tags',
  intro: `
<p><b>Pytania pośrednie</b> są uprzejmiejsze – świetne w pracy. Po wstępie szyk jak w zdaniu twierdzącym:</p>
<p><i>Where <b>is</b> the server room? → Could you tell me where the server room <b>is</b>?</i><br><i>When <b>does</b> it start? → Do you know when it <b>starts</b>?</i><br><i>Is it ready? → I was wondering <b>if</b> it was ready.</i></p>
<p><b>Question tags</b> – „prawda?”: zdanie twierdzące → przeczący tag i odwrotnie: <i>It's working, <b>isn't it</b>? You didn't call, <b>did you</b>?</i></p>`,
  ex: [
    ['f', 'Could you tell me where is the meeting room?', ['Could you tell me where the meeting room is?'], 'W pytaniu pośrednim szyk twierdzący.'],
    ['c', 'Do you know what time ___?', ['the shop opens', 'does the shop open', 'opens the shop'], 0, 'Szyk twierdzący, bez does.'],
    ['c', "You're from Kraków, ___?", ["aren't you", 'are you', "don't you"], 0, 'Twierdzenie z „are” → aren\'t you.'],
    ['c', "She didn't send the report, ___?", ['did she', "didn't she", 'does she'], 0, 'Przeczenie → twierdzący tag.'],
    ['g', 'I was wondering ___ you could help me.', ['if', 'whether'], 'Pytanie tak/nie w formie pośredniej: if / whether.'],
    ['f', 'Do you know when does the train leave?', ['Do you know when the train leaves?'], 'Bez does, szyk twierdzący.'],
    ['c', "Let's take a break, ___?", ['shall we', "don't we", 'will we'], 0, 'Po „Let\'s” tag: shall we.'],
    ['o', 'Czy mógłbyś mi powiedzieć, ile to kosztuje?', 'Could you tell me how much it costs?', 'Pytanie pośrednie.'],
  ],
},
{
  id: 'future-perfect-continuous', level: 'B2', title: 'Future Continuous i Future Perfect',
  intro: `
<p><b>Future Continuous</b> (will be + -ing) – czynność w toku w danym momencie w przyszłości: <i>This time tomorrow I'<b>ll be flying</b> to London.</i> Także uprzejme pytanie o plany: <i><b>Will</b> you <b>be using</b> the room later?</i></p>
<p><b>Future Perfect</b> (will have + III forma) – coś będzie zakończone przed jakimś momentem: <i>By Friday we'<b>ll have finished</b> the rollout.</i></p>
<p>Sygnał Future Perfect: <i>by + czas</i> (by Monday, by the end of the year).</p>`,
  ex: [
    ['c', 'By the end of the year, we ___ 100 new sites.', ['will have built', 'will be building', 'build'], 0, '„by + czas” → Future Perfect.'],
    ['c', "Don't call me at 9 – I ___ a presentation.", ["'ll be giving", "'ll have given", 'give'], 0, 'W toku w danym momencie przyszłym: Future Continuous.'],
    ['g', 'By the time you arrive, I ___ (finish) the report.', ['will have finished', "'ll have finished"], 'Zakończone przed momentem w przyszłości.'],
    ['g', 'This time next week I ___ (lie) on a beach.', ['will be lying', "'ll be lying"], 'Czynność w toku w przyszłości.'],
    ['f', 'By Monday I will finish all the tests.', ['By Monday I will have finished all the tests.', "By Monday I'll have finished all the tests."], '„by Monday” → Future Perfect.'],
    ['o', 'Do piątku wdrożymy aktualizację.', 'By Friday we will have deployed the update.', 'Future Perfect z by.'],
  ],
},
{
  id: 'inversion', level: 'C1', title: 'Inwersja dla podkreślenia',
  intro: `
<p>W stylu formalnym, po wyrażeniach przeczących lub ograniczających na początku zdania, zamieniamy szyk jak w pytaniu:</p>
<p><i><b>Never have I</b> seen such a fast network.</i> · <i><b>Not only did</b> it fail, but it also deleted the data.</i> · <i><b>Rarely do</b> we get such feedback.</i> · <i><b>Only then did</b> I realise…</i> · <i><b>No sooner had</b> we arrived <b>than</b> it started to rain.</i></p>
<p>Inwersja w warunkach (formalnie): <i><b>Had I</b> known = If I had known; <b>Should you</b> need help = If you need help.</i></p>`,
  ex: [
    ['c', 'Never ___ such a mess.', ['have I seen', 'I have seen', 'I saw'], 0, 'Po „Never” na początku: inwersja.'],
    ['c', 'Not only ___ late, but he also forgot the documents.', ['was he', 'he was', 'he is'], 0, 'Not only + inwersja.'],
    ['f', 'Rarely we get complaints about coverage.', ['Rarely do we get complaints about coverage.'], 'Po „Rarely” na początku: do + podmiot.'],
    ['c', '___ you need any help, please contact us.', ['Should', 'If should', 'Would'], 0, 'Formalnie: Should you… = If you…'],
    ['c', '___ I known, I would have helped.', ['Had', 'If', 'Have'], 0, 'Had I known = If I had known.'],
    ['o', 'Dopiero wtedy zrozumiałem problem.', 'Only then did I understand the problem.', 'Only then + did + podmiot.'],
  ],
},
];
