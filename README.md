# Inglisz

Aplikacja do nauki angielskiego (PWA) od A1 do C1, instalowana na telefonie przez przeglądarkę. Działa offline.

**Aplikacja:** https://siorsiaman.github.io/inglisz/ (na Androidzie: Chrome → menu ⋮ → „Zainstaluj aplikację”).

## Funkcje
- **Fiszki** z algorytmem **FSRS-4.5** (jak w Anki), krokami nauki w minutach, regulowaną docelową skutecznością,
  cofaniem, „Znam, pomiń”, odkładaniem do jutra i zawieszaniem kart, trybem wpisywania odpowiedzi i skrótami klawiszowymi.
- **Wybór fiszek**: dowolne połączenie kategorii, własnych talii i poziomów A1–C1. Widok każdej talii z wyszukiwarką.
- **Baza ok. 5900 słów**: 5500 najczęstszych słów ogólnych z wymową IPA i przykładami z tłumaczeniem, plus talie
  tematyczne: telekomunikacja, IT, praca, podróże, phrasal verbs, kolokacje, słownictwo akademickie i biznesowe C1.
- **Gramatyka**: 24 lekcje A2–C1, ok. 1440 zadań (wybór, luka, poprawianie błędu, układanie zdania), sesje po 12 zadań,
  powtórka błędów.
- **Ćwiczenia**: trening mieszany, dopasuj pary, ułóż zdanie, ze słuchu, uzupełnij lukę, dyktando, quiz, test poziomu.
  Wymowa z mikrofonem jest ukryta (włącz w Ustawieniach).
- **Motywacja**: seria dni, dzienny cel, zamrożenia serii, dźwięki i wibracje, podsumowania sesji.
- **Postępy**: mapa aktywności, prognoza powtórek, czas nauki, skuteczność, odstępy, wyniki każdego rodzaju ćwiczeń.
- **Import**: talie Anki `.apkg`, eksport tekstowy Anki, CSV/TSV, wklejona lista; pomijanie duplikatów; eksport talii.
- **Zapis**: localStorage + IndexedDB, kopie z 7 dni, eksport/import kopii.

## Uruchomienie lokalne
```bash
python -m http.server 8123
```
Potem otwórz http://localhost:8123

## Testy
Otwórz http://localhost:8123/tests/tests.html. Testy (56) sprawdzają dane, algorytm, sesje, import, wszystkie ekrany
i ćwiczenia. Twój postęp jest zapisywany przed testami i przywracany po nich.

## Źródła danych i licencje
- **Tłumaczenia słownika ogólnego** (`data/dict.js`): FreeDict eng-pol 0.2.1, słownik Piotrowski+Saloni,
  treść na licencji [GNU FDL 1.2+](https://www.gnu.org/licenses/fdl-1.2.html). Część tłumaczeń poprawiona ręcznie (`tools/overrides.txt`).
- **Lista częstości słów**: [FrequencyWords](https://github.com/hermitdave/FrequencyWords) (OpenSubtitles 2018), licencja MIT.
- **Zdania przykładowe i do układania** (`data/tatoeba.js`, przykłady w `data/dict.js`): [Tatoeba](https://tatoeba.org),
  licencja [CC BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/).
- Słownictwo tematyczne, zdania z `data/sentences.js` i lekcje gramatyki: przygotowane dla tej aplikacji.

## Odtworzenie bazy
Pobierz pliki źródłowe (FreeDict `freedict-eng-pol-0.2.1.src.tar.xz`, `en_50k.txt`, z Tatoeby
`pol_sentences.tsv`, `pol-eng_links.tsv`, `eng_sentences.tsv`) do jednego folderu, rozpakuj i uruchom:
```bash
TARGET_WORDS=5500 python -I tools/build_data.py <folder_z_danymi> data
```

## Pliki
- `data/words.js`: słówka tematyczne, linia `angielski | polski | przykład`
- `data/dict.js`: słownik ogólny (generowany)
- `data/grammar*.js`: lekcje i zadania gramatyczne
- `app.js`: logika aplikacji, `styles.css`: wygląd
- `sw.js`: tryb offline. Po zmianach podbij wersję `CACHE`.
- `tests/`: testy automatyczne
