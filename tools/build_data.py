"""Buduje data/dict.js i data/tatoeba.js z otwartych źródeł.

Użycie:  python -I tools/build_data.py <folder_z_pobranymi_plikami> <folder_wyjściowy>

Źródła (pobierane osobno, nie są w repozytorium):
  - FreeDict eng-pol 0.2.1 (Piotrowski+Saloni), treść na licencji GNU FDL 1.2+
  - FrequencyWords en_50k.txt (OpenSubtitles 2018), licencja MIT
  - Tatoeba: pol_sentences.tsv, pol-eng_links.tsv, eng_sentences.tsv, licencja CC BY 2.0 FR
"""
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

SRC, OUT = sys.argv[1], sys.argv[2]
NS = {'t': 'http://www.tei-c.org/ns/1.0'}
TARGET_WORDS = int(os.environ.get('TARGET_WORDS', '4000'))
TARGET_SENTENCES = int(os.environ.get('TARGET_SENTENCES', '3000'))

SKIP_LABELS = {'lit', 'old', 'arch', 'archaic', 'obs', 'rare', 'dial', 'vulg', 'poet', 'bibl', 'hist', 'sl', 'pej', 'liter'}

STOP = set("""
a an the and or but if of to in on at by for with from as is are am be was were been being do does did done have has had
i you he she it we they me him her us them my your his its our their mine yours hers ours theirs this that these those
there here what which who whom whose when where why how not no yes so than then too very just also only oh ah hey okay ok
uh um yeah gonna wanna gotta s t ll d m re ve don can will shall may might must would could should let let's
""".split())

IRREGULAR = set("""
was were been went gone did done had made said got gotten took taken came saw seen knew known thought told gave given found
left felt kept brought began begun ran sat stood heard held meant met paid put read sent spent understood won wrote written
became bought caught chose chosen drew drawn drank drunk drove driven ate eaten fell fallen flew flown forgot forgotten
froze frozen grew grown hid hidden hung hurt lay laid led lent lost rode ridden rang rung rose risen sang sung sank sunk
shook shaken shot shut slept slid spoke spoken stole stolen struck swam swum swore sworn taught tore torn threw thrown
woke woken wore worn broke broken built burnt dealt dug fed fought forgave forgiven hit lit sold shone sought stuck stung
swept swung bent bet bit bitten bled bred bound cast cost crept fled flung knelt leapt sped spun spat split spread strode
wept wound withdrew withdrawn men women children feet teeth mice geese people's
""".split())


PROFANITY = set("""
fuck fucking fucked fucker shit shitty damn goddamn bitch bastard ass asshole crap dick cock pussy whore slut piss pissed
bloody hell nigger fag faggot cunt bullshit motherfucker screw sexy sex
brothel rapist semen nipple intercourse pornography boob tit prostitution anal orgasm erotic retarded midget imbecile
sissy gypsy ko woof moo hurrah hurray shush phew scram quack holler chug tart hag puss sod pong boobs horny pervert
whore hooker stripper suicide
""".split())

NAMES = set("""
bob bobby mike frank joe ted jimmy nick sam ben tom harry jerry ken chuck pete hank gus max dan don eve kitty ma pa
jack jill bill billy will rob robin pat sue grace mark ray rose june april may art carol dawn faith hope joy ruby
""".split()) - {'bill', 'will', 'mark', 'may', 'hope', 'art', 'rose', 'ray', 'joy', 'faith'}

ING_ED_KEEP = set("""
meeting building morning evening interesting boring exciting amazing surprising tired worried bored excited interested
married used feeling painting wedding beginning ending training shopping nothing something everything anything thing
ceiling clothing understanding setting opening warning advertising engineering marketing recording booking parking
reading writing learning spending funding heating landing housing rating ranking frightened scared surprised pleased
annoyed confused embarrassed disappointed satisfied crowded advanced detailed experienced qualified skilled limited
related required expected planned united asked
""".split())


def text(el):
    return ' '.join(''.join(el.itertext()).split()) if el is not None else ''


# ---------- 1. Słownik FreeDict ----------
dic = {}
letters = os.path.join(SRC, 'eng-pol', 'letters')
for fn in sorted(os.listdir(letters)):
    root = ET.parse(os.path.join(letters, fn)).getroot()
    for entry in root.iter('{%s}entry' % NS['t']):
        orth_el = entry.find('t:form/t:orth', NS)
        if orth_el is None:
            continue
        orth = text(orth_el)
        if not orth or orth[0].isupper() or '.' in orth:
            continue
        pron = text(entry.find('t:form/t:pron', NS))
        groups = []
        top_senses = entry.findall('t:sense', NS)
        for s0 in top_senses:
            pos = text(s0.find('t:gramGrp/t:pos', NS)) or text(entry.find('t:gramGrp/t:pos', NS))
            s1s = s0.findall('t:sense', NS) or [s0]
            for s1 in s1s:
                labels = {text(u).strip('.').lower() for u in s1.findall('t:usg[@type="label"]', NS)}
                if labels & SKIP_LABELS:
                    continue
                quotes = []
                # Tylko bezpośrednie tłumaczenia sensu, bez kolokacji, idiomów i przykładów.
                direct = [c for sn in s1.iter('{%s}sense' % NS['t']) for c in sn.findall('t:cit', NS)]
                for cit in direct:
                    if cit.get('type') != 'trans':
                        continue
                    q = text(cit.find('t:quote', NS)).strip(' ,;')
                    hint = text(cit.find('t:usg[@type="hint"]', NS))
                    if q and len(q) <= 40:
                        quotes.append(q + (f' ({hint})' if hint and len(hint) < 25 else ''))
                if quotes:
                    groups.append((pos, quotes))
        if not groups:
            continue
        d = dic.setdefault(orth.lower(), {'pron': pron, 'groups': [], 'pos': set()})
        d['groups'].extend(groups)
        d['pos'].update(p for p, _ in groups if p)
        if not d['pron'] and pron:
            d['pron'] = pron
print('Haseł w słowniku:', len(dic))


def translation(d):
    """Krótkie tłumaczenie: najważniejsze znaczenia, maks. 4 odpowiedniki."""
    out, seen_pos = [], []
    for pos, quotes in d['groups']:
        first_pos = not seen_pos or pos == seen_pos[0]
        if first_pos and len(out) >= 3:
            continue
        if not first_pos and (len(seen_pos) >= 2 and pos not in seen_pos or pos in seen_pos):
            continue
        if pos not in seen_pos:
            seen_pos.append(pos)
        for q in quotes[: (2 if first_pos else 1)]:
            if q not in out:
                out.append(q)
    return ', '.join(out[:3])


OVERRIDES = {}
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'overrides.txt'), encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '|' in line:
            k, v = (s.strip() for s in line.split('|', 1))
            OVERRIDES[k] = v


def final_translation(w):
    return OVERRIDES.get(w) or translation(dic[w])


# ---------- 2. Lista częstości ----------
freq = []
with open(os.path.join(SRC, 'en_50k.txt'), encoding='utf-8') as f:
    for line in f:
        parts = line.split()
        if len(parts) == 2 and re.fullmatch(r"[a-z][a-z'-]*", parts[0]):
            freq.append(parts[0])
rank = {w: i for i, w in enumerate(freq)}


def is_inflection(w):
    if w in IRREGULAR:
        return True
    if w in ING_ED_KEEP:
        return False
    for suf, add in (('ing', ''), ('ing', 'e'), ('ed', ''), ('ed', 'e'), ('ied', 'y')):
        if w.endswith(suf) and w[: -len(suf)] + add in dic:
            return True
    d = dic[w]
    own = d['pos'] & {'N', 'Adj', 'Adv'}
    for suf, add in (('ies', 'y'), ('es', ''), ('s', ''), ('ied', 'y'), ('ed', ''), ('ed', 'e'), ('ing', ''), ('ing', 'e'), ('er', ''), ('est', '')):
        if w.endswith(suf) and len(w) > len(suf) + 2:
            base = w[: -len(suf)] + add
            if base in dic and rank.get(base, 10 ** 9) < rank.get(w, 10 ** 9):
                if suf in ('s', 'es', 'ies'):
                    return True
                if suf in ('ed', 'ied', 'ing', 'er', 'est') and not own:
                    return True
                if len(base) > 2 and base[-1] == base[-2] is False:
                    pass
    # podwojona spółgłoska: stopped, running
    m = re.fullmatch(r'(.+?)([bdgklmnprt])\2(ed|ing)', w)
    if m and m.group(1) + m.group(2) in dic and not own:
        return True
    return False


selected = []
for w in freq:
    if w in STOP or w in PROFANITY or w in NAMES or w not in dic or len(w) < 2:
        continue
    if OVERRIDES.get(w) == '-' or (w not in OVERRIDES and is_inflection(w)):
        continue
    tr = final_translation(w)
    if not tr:
        continue
    selected.append(w)
    if len(selected) >= TARGET_WORDS:
        break
print('Wybranych słów:', len(selected))

# ---------- 3. Tatoeba ----------
links = {}
with open(os.path.join(SRC, 'pol-eng_links.tsv'), encoding='utf-8') as f:
    for line in f:
        a, b = line.rstrip('\n').split('\t')[:2]
        links.setdefault(b, a)  # eng_id -> pol_id (pierwsze tłumaczenie)
pol = {}
with open(os.path.join(SRC, 'pol_sentences.tsv'), encoding='utf-8') as f:
    for line in f:
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3:
            pol[p[0]] = p[2]
pairs = []
with open(os.path.join(SRC, 'eng_sentences.tsv'), encoding='utf-8') as f:
    for line in f:
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3 and p[0] in links and links[p[0]] in pol:
            en, pl = p[2].strip(), pol[links[p[0]]].strip()
            if '|' in en or '|' in pl or len(en) > 90 or len(pl) > 110:
                continue
            pairs.append((en, pl))
print('Par zdań:', len(pairs))

tok_re = re.compile(r"[A-Za-z']+")
BAD = re.compile(r"\b(kill|killed|murder|suicide|sex|naked|drunk|gun|die|dead|hate|stupid|idiot)\b", re.I)
index = {}
pair_tokens = []
for i, (en, pl) in enumerate(pairs):
    toks = [t.lower() for t in tok_re.findall(en)]
    pair_tokens.append(toks)
    if BAD.search(en):
        continue
    for t in set(toks):
        index.setdefault(t, []).append(i)

sel_rank = {w: i for i, w in enumerate(selected)}


def difficulty(toks):
    r = [rank.get(t, 60000) for t in toks if t not in STOP]
    return max(r) if r else 0


def pick_example(w):
    cands = index.get(w, [])
    best, best_score = None, None
    for i in cands:
        n = len(pair_tokens[i])
        if n < 4 or n > 11:
            continue
        score = abs(n - 7) + difficulty(pair_tokens[i]) / 4000
        if best is None or score < best_score:
            best, best_score = i, score
    return best


used_pairs = set()
LEVEL_CUTS = [(600, 'A1'), (1400, 'A2'), (2300, 'B1'), (3200, 'B2'), (10 ** 9, 'C1')]


def level_of(i):
    for cut, lvl in LEVEL_CUTS:
        if i < cut:
            return lvl


lines = {lvl: [] for _, lvl in LEVEL_CUTS}
for i, w in enumerate(selected):
    d = dic[w]
    ex = pick_example(w)
    en_ex, pl_ex = ('', '')
    if ex is not None:
        en_ex, pl_ex = pairs[ex]
        used_pairs.add(ex)
    lines[level_of(i)].append(' | '.join([w, final_translation(w), en_ex, pl_ex, d['pron']]))

os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, 'dict.js'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('// Wygenerowane przez tools/build_data.py. Nie edytuj ręcznie, popraw w data/fixes.js.\n')
    f.write('// Tłumaczenia: FreeDict eng-pol (Piotrowski+Saloni), GNU FDL 1.2+. Przykłady: Tatoeba, CC BY 2.0 FR.\n')
    f.write('// Format: angielski | polski | przykład EN | przykład PL | wymowa IPA\n')
    f.write('const DICT_PACKS = [\n')
    for _, lvl in LEVEL_CUTS:
        body = '\n'.join(lines[lvl]).replace('\\', '\\\\').replace('`', "'").replace('${', '$ {')
        f.write("{ cat: 'core', level: %s, items: `\n%s\n` },\n" % (json.dumps(lvl), body))
    f.write('];\n')

# ---------- 4. Zdania do układania ----------
sent = []
seen_en = set()
for i, (en, pl) in enumerate(pairs):
    toks = pair_tokens[i]
    if len(toks) < 4 or len(toks) > 10 or BAD.search(en) or en in seen_en:
        continue
    if not re.fullmatch(r"[A-Za-z0-9' ,.?!-]+", en):
        continue
    dif = difficulty(toks)
    if dif > 9000:
        continue
    seen_en.add(en)
    sent.append((dif, pl, en))
sent.sort()
step = max(1, len(sent) // TARGET_SENTENCES)
chosen = sent[::step][:TARGET_SENTENCES]
with open(os.path.join(OUT, 'tatoeba.js'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('// Zdania z projektu Tatoeba (tatoeba.org), licencja CC BY 2.0 FR. Wygenerowane przez tools/build_data.py.\n')
    f.write('// Format: polski | angielski | poziom\n')
    f.write('const TATOEBA_DATA = `\n')
    for dif, pl, en in chosen:
        lvl = 'A1' if dif < 600 else 'A2' if dif < 1400 else 'B1' if dif < 2300 else 'B2' if dif < 3200 else 'C1'
        f.write(' | '.join([pl, en, lvl]).replace('`', "'").replace('${', '$ {') + '\n')
    f.write('`;\n')
print('Zdań do układania:', len(chosen))
print('Słów z przykładem:', sum(1 for lvl in lines for l in lines[lvl] if l.split(' | ')[2]))
