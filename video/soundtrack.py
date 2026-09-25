"""Bande-son synthétisée de la vidéo (numpy uniquement).

Musique électro à 120 BPM (la mineur) + bruitages placés sur les repères exportés par la timeline
(out/cues.json : whoosh, impact, click, tick, pop…).
Usage : python3 soundtrack.py out/cues.json out/soundtrack.wav
"""
import json
import sys
import wave

import numpy as np

SR = 48000
BEAT = 0.5  # 120 BPM
rng = np.random.default_rng(7)

cues_file, out_file = sys.argv[1], sys.argv[2]
data = json.load(open(cues_file))
DUR = float(data['duration'])
CUES = data['cues']
N = int(DUR * SR) + SR

music = np.zeros((N, 2))   # passe par le sidechain
drums = np.zeros((N, 2))
sfx = np.zeros((N, 2))
send = np.zeros((N, 2))    # vers la réverbération


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def add(buf, t0, sig, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(sig), 0] += sig * gain * l * 1.414
    buf[i:i + len(sig), 1] += sig * gain * r * 1.414


def fft_filter(x, lo=0.0, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = (f >= lo) & (f <= (hi or SR))
    return np.fft.irfft(X * m, len(x))


def noise(d):
    return rng.standard_normal(int(d * SR))


def saw(freq, t, harm=8):
    s = np.zeros_like(t)
    for k in range(1, harm + 1):
        if freq * k > 16000:
            break
        s += np.sin(2 * np.pi * freq * k * t) / k
    return s * 0.6


# ---------------- Instruments ----------------
def kick():
    t = t_axis(0.45)
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.16) + 0.3 * noise(0.45) * np.exp(-t / 0.004)


def snare():
    t = t_axis(0.3)
    n = fft_filter(noise(0.3), 900, 9000) * np.exp(-t / 0.07)
    return 0.8 * n + 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)


def hat(open_=False):
    d = 0.2 if open_ else 0.06
    t = t_axis(d)
    return fft_filter(noise(d), 7000) * np.exp(-t / (0.06 if open_ else 0.015))


def whoosh(d=0.6, up=True):
    t = t_axis(d)
    n = noise(d)
    lo, hi = fft_filter(n, 200, 1500), fft_filter(n, 2500, 12000)
    x = t / d if up else 1 - t / d
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return (lo * (1 - x) + hi * x) * env


def riser(d):
    t = t_axis(d)
    n = noise(d)
    hi = fft_filter(n, 3000, 14000)
    mid = fft_filter(n, 400, 3000)
    x = (t / d) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * x) / SR) * 0.25
    return (mid * (1 - x) + hi * x + tone) * x


def impact():
    t = t_axis(2.0)
    f = 32 + 90 * np.exp(-t / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.6)
    crack = fft_filter(noise(2.0), 1500, 12000) * np.exp(-t / 0.05)
    return boom * 1.2 + crack * 0.7


def click():
    t = t_axis(0.05)
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.006) + fft_filter(noise(0.05), 3000) * np.exp(-t / 0.003) * 0.5


def tick():
    t = t_axis(0.12)
    return np.sin(2 * np.pi * 1760 * t) * np.exp(-t / 0.025)


def pop():
    t = t_axis(0.18)
    f = 500 + 900 * (1 - np.exp(-t / 0.03))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05)


def ding():
    t = t_axis(1.2)
    a = np.sin(2 * np.pi * 1318.5 * t) * np.exp(-t / 0.35)
    b = np.zeros_like(t)
    k = int(0.09 * SR)
    b[k:] = np.sin(2 * np.pi * 1975.5 * t[: len(t) - k]) * np.exp(-t[: len(t) - k] / 0.45)
    return 0.5 * a + 0.5 * b


def alarm():
    t = t_axis(0.9)
    sq = np.sign(np.sin(2 * np.pi * np.where(t % 0.3 < 0.15, 880, 660) * t))
    env = ((t % 0.3) < 0.24) * np.exp(-t / 0.8)
    return fft_filter(sq * env, 0, 5000) * 0.5


# ---------------- Musique ----------------
# Progression Am – F – C – G, une mesure (2 s) par accord
CHORDS = [
    (55.0, [220.0, 261.63, 329.63]),
    (43.65, [174.61, 220.0, 261.63]),
    (65.41, [196.0, 261.63, 329.63]),
    (49.0, [196.0, 246.94, 293.66]),
]
BAR = 4 * BEAT
MUSIC_END = 81.0
DROP = (38.5, 42.0)  # « partie trouvée » : la batterie se coupe, tension, puis retour

# Nappe (tout le long, fondu à la fin)
for bi in range(int(DUR / BAR) + 1):
    t0 = bi * BAR
    root, notes = CHORDS[bi % 4]
    t = t_axis(BAR + 0.3)
    env = np.minimum(1, t / 0.4) * np.minimum(1, np.maximum(0, (BAR + 0.3 - t) / 0.3))
    for side, det in ((-0.6, 0.997), (0.6, 1.003)):
        s = sum(saw(n * det, t, 6) for n in notes) * env
        add(music, t0, s, 0.05, side)
        add(send, t0, s, 0.03, side)

# Basse (croches) à partir de l'accroche
for bi in range(int(5.5 / BAR), int(MUSIC_END / BAR) + 1):
    root = CHORDS[bi % 4][0]
    for e in range(8):
        tt = bi * BAR + e * BEAT / 2
        if tt < 5.5 or tt >= MUSIC_END or DROP[0] <= tt < DROP[1]:
            continue
        t = t_axis(BEAT / 2)
        f = root * (2 if e % 2 else 1)
        s = (np.sin(2 * np.pi * f * t) + 0.35 * saw(f, t, 5)) * np.exp(-t / 0.18) * np.minimum(1, t / 0.004)
        add(music, tt, s, 0.32)

# Batterie
kick_times = []
k = kick()
for i in range(int(5.5 / BEAT), int(MUSIC_END / BEAT)):
    tt = i * BEAT
    if DROP[0] <= tt < DROP[1]:
        continue
    add(drums, tt, k, 0.75)
    kick_times.append(tt)
    beat_in_bar = i % 4
    if tt >= 10 and beat_in_bar in (1, 3):
        add(drums, tt, snare(), 0.45)
        add(send, tt, snare(), 0.12)
    if tt >= 10:
        add(drums, tt + BEAT / 2, hat(open_=(i % 8 == 7)), 0.22, 0.3)
    if tt >= 22:
        add(drums, tt + BEAT / 4, hat(), 0.08, -0.3)
        add(drums, tt + 3 * BEAT / 4, hat(), 0.08, -0.3)

# Montée pendant la « partie trouvée »
add(sfx, 39.7, riser(2.3), 0.35)

# Sidechain : la musique « respire » sur chaque grosse caisse
duck = np.ones(N)
dt = t_axis(0.3)
shape = 1 - 0.65 * np.exp(-dt / 0.09)
for tt in kick_times:
    i = int(tt * SR)
    j = min(N, i + len(shape))
    duck[i:j] = np.minimum(duck[i:j], shape[: j - i])
music *= duck[:, None]

# ---------------- Bruitages sur les repères ----------------
SFX = {
    'whoosh': (lambda: whoosh(0.55), 0.35, 0.6),
    'whoosh-small': (lambda: whoosh(0.4, up=False), 0.25, 0.3),
    'riser': (lambda: riser(0.65), 0.35, 0.2),
    'impact': (impact, 0.6, 0.35),
    'hit': (lambda: impact()[: int(0.5 * SR)], 0.55, 0.15),
    'click': (click, 0.35, 0.05),
    'tick': (tick, 0.14, 0.1),
    'pop': (pop, 0.2, 0.1),
    'ding': (ding, 0.25, 0.3),
    'alarm': (alarm, 0.3, 0.2),
}
for i, c in enumerate(CUES):
    make, g, rv = SFX.get(c['kind'], (tick, 0.1, 0.0))
    s = make()
    pan = ((i * 37) % 11 - 5) / 12
    add(sfx, c['t'], s, g, pan)
    add(send, c['t'], s, g * rv, -pan)

# ---------------- Réverbération (convolution FFT) ----------------
ir_t = t_axis(1.8)
mix = music + drums + sfx
for ch in range(2):
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.45)
    ir = fft_filter(ir, 150, 7000)
    ir /= np.sqrt(np.sum(ir ** 2))
    L = N + len(ir)
    n = 1 << (L - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(send[:, ch], n) * np.fft.rfft(ir, n), n)[:N]
    mix[:, ch] += wet * 0.6

# Fondu d'entrée et de sortie, limitation douce
t = np.arange(N) / SR
fade = np.clip(t / 0.3, 0, 1) * np.clip((DUR - t) / 2.0, 0, 1)
mix *= fade[:, None]
mix = np.tanh(mix * 1.1)
mix /= np.max(np.abs(mix)) / 0.89
mix = mix[: int(DUR * SR)]

pcm = (mix * 32767).astype('<i2')
with wave.open(out_file, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f'Bande-son : {DUR:.1f} s, {len(CUES)} bruitages → {out_file}')
