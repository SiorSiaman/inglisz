# Inglisz

Aplikacja do nauki angielskiego (PWA), którą można zainstalować na telefonie przez przeglądarkę.

## Co jest w środku (etap 1)
- **Fiszki z powtórkami** (uproszczony algorytm SM-2): ocena Nie wiem / Trudne / Dobrze / Łatwe.
- **Baza słówek** od A1 do C1 oraz kategorie: phrasal verbs, kolokacje i idiomy, praca i biznes, telekomunikacja, podróże.
- **Ułóż zdanie**: tłumaczenie z polskiego z klocków.
- **Ze słuchu**: posłuchaj zdania i ułóż je.
- **Quiz**: 4 odpowiedzi, oba kierunki.
- **Test poziomu**: oznaczasz znane słowa, reszta trafia do nauki.
- **Postępy**: seria dni, wykres 14 dni, postęp według poziomów.
- **Lektor**: wbudowana synteza mowy (akcent brytyjski lub amerykański, regulowane tempo).
- **Tryb offline** i kopia zapasowa postępu (eksport/import JSON).

## Uruchomienie lokalne
```bash
python -m http.server 8123
```
Potem otwórz http://localhost:8123

## Źródła danych i licencje
- **Tłumaczenia słownika ogólnego** (`data/dict.js`): FreeDict eng-pol 0.2.1, słownik Piotrowski+Saloni,
  treść na licencji [GNU FDL 1.2+](https://www.gnu.org/licenses/fdl-1.2.html). Część tłumaczeń poprawiona ręcznie (`tools/overrides.txt`).
- **Lista częstości słów**: [FrequencyWords](https://github.com/hermitdave/FrequencyWords) (OpenSubtitles 2018), licencja MIT.
- **Zdania przykładowe i do układania** (`data/tatoeba.js`, przykłady w `data/dict.js`): [Tatoeba](https://tatoeba.org),
  licencja [CC BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/).
- Słownictwo tematyczne (`data/words.js`, `data/sentences.js`): przygotowane ręcznie dla tej aplikacji.

## Odtworzenie bazy
Pobierz pliki źródłowe (FreeDict `freedict-eng-pol-0.2.1.src.tar.xz`, `en_50k.txt`, z Tatoeby
`pol_sentences.tsv`, `pol-eng_links.tsv`, `eng_sentences.tsv`) do jednego folderu, rozpakuj i uruchom:
```bash
python -I tools/build_data.py <folder_z_danymi> data
```

## Pliki
- `data/words.js`: słówka, linia `angielski | polski | przykład`
- `data/sentences.js`: zdania, linia `polski | angielski | kategoria`
- `app.js`: logika aplikacji
- `sw.js`: tryb offline. Po zmianach podbij wersję `CACHE`.
