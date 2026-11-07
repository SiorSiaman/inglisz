"""Generuje nagrania lektora (Kokoro TTS, licencja Apache 2.0) dla słów, przykładów i zdań.

Użycie:  python tools/make_audio.py us [words|ex|sent|all]
Wymaga: pip install kokoro-onnx soundfile lameenc  oraz plików kokoro-v1.0.onnx i voices-v1.0.bin
(https://github.com/thewh1teagle/kokoro-onnx/releases) w katalogu KOKORO_DIR.
Pliki: audio/us/<klucz>.mp3, lista dostępnych nagrań: audio/us.txt.
Klucz = pierwsze 12 znaków szesnastkowych FNV-1a 64 z tekstu w UTF-8 (to samo liczy app.js: audioKey).
Skrypt można przerwać i uruchomić ponownie: istniejące pliki są pomijane.
"""
import os, re, sys, time
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KOKORO_DIR = os.environ.get('KOKORO_DIR', r'C:\Users\User\inglisz-tts')
VOICES = {'us': ('af_heart', 'en-us')}  # aplikacja uczy tylko angielskiego amerykańskiego


def norm(t):
    return re.sub(r'\s+', ' ', (t or '').strip())


def audio_key(text):
    h = 0xcbf29ce484222325
    for b in norm(text).encode('utf-8'):
        h ^= b
        h = (h * 0x100000001b3) & 0xFFFFFFFFFFFFFFFF
    return f'{h:016x}'[:12]


def rows(path):
    s = open(os.path.join(ROOT, 'data', path), encoding='utf-8').read()
    for block in re.findall(r'`([^`]*)`', s):
        for line in block.split('\n'):
            line = line.strip()
            if line and not line.startswith('//') and '|' in line:
                yield [x.strip() for x in line.split('|')]


def texts(kind):
    out = []
    if kind == 'words':
        out = [r[0] for f in ('words.js', 'dict.js') for r in rows(f)]
    elif kind == 'ex':
        out = [r[2] for f in ('words.js', 'dict.js') for r in rows(f) if len(r) > 2]
    elif kind == 'sent':
        out = [r[1] for f in ('sentences.js', 'tatoeba.js') for r in rows(f) if len(r) > 1]
    seen, res = set(), []
    for t in map(norm, out):
        if t and t not in seen:
            seen.add(t); res.append(t)
    return res


def to_mp3(a, sr):
    # obetnij ciszę na brzegach, zostaw 60 ms
    idx = np.where(np.abs(a) > 0.01)[0]
    if len(idx):
        pad = int(0.06 * sr)
        a = a[max(0, idx[0] - pad):idx[-1] + pad]
    pcm = (np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()
    import lameenc
    enc = lameenc.Encoder()
    enc.set_bit_rate(40); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
    return enc.encode(pcm) + enc.flush()


def main():
    acc = sys.argv[1]
    kinds = ['words', 'ex', 'sent'] if len(sys.argv) < 3 or sys.argv[2] == 'all' else [sys.argv[2]]
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(KOKORO_DIR, 'kokoro-v1.0.onnx'), os.path.join(KOKORO_DIR, 'voices-v1.0.bin'))
    voice, lang = VOICES[acc]
    outdir = os.path.join(ROOT, 'audio', acc)
    os.makedirs(outdir, exist_ok=True)
    for kind in kinds:
        items = texts(kind)
        t0, done = time.time(), 0
        for i, text in enumerate(items):
            f = os.path.join(outdir, audio_key(text) + '.mp3')
            if os.path.exists(f):
                continue
            try:
                a, sr = k.create(text, voice=voice, speed=1.0, lang=lang)
                data = to_mp3(a, sr)
                open(f + '.tmp', 'wb').write(data); os.replace(f + '.tmp', f)
            except Exception as e:
                print('BŁĄD', repr(text), e, flush=True)
            done += 1
            if done % 200 == 0:
                rate = done / (time.time() - t0)
                print(f'{acc} {kind}: {i + 1}/{len(items)}, {rate:.1f}/s, zostało ~{(len(items) - i) / rate / 60:.0f} min', flush=True)
                write_index(acc)
        print(f'{acc} {kind}: gotowe ({len(items)})', flush=True)
        write_index(acc)


def write_index(acc):
    d = os.path.join(ROOT, 'audio', acc)
    keys = sorted(f[:-4] for f in os.listdir(d) if f.endswith('.mp3'))
    open(os.path.join(ROOT, 'audio', acc + '.txt'), 'w', encoding='utf-8', newline='\n').write('\n'.join(keys) + '\n')


if __name__ == '__main__':
    main()
