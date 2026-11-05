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

## Pliki
- `data/words.js`: słówka, linia `angielski | polski | przykład`
- `data/sentences.js`: zdania, linia `polski | angielski | kategoria`
- `app.js`: logika aplikacji
- `sw.js`: tryb offline. Po zmianach podbij wersję `CACHE`.
