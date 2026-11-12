// Site vitrine : vidéo du premier écran, parcours d’installation, dernière version
(() => {
  'use strict';
  window.pgReady = true;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NBSP = String.fromCharCode(160);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v) => Math.min(1, Math.max(0, v));

  // Mêmes instants que .github/media/video/scenario.js ; après 35,2 s la vidéo revient à l’accueil avant de boucler
  const CHAPTERS = [
    { name: 'Accueil', start: 0, end: 3.2 },
    { name: 'Boutique', start: 3.2, end: 11 },
    { name: 'Résolution étirée', start: 11, end: 20 },
    { name: 'Partie en direct', start: 20, end: 27.6 },
    { name: 'Statistiques', start: 27.6, end: 35.2 },
  ];
  const chapterAt = (t) => {
    for (let i = 0; i < CHAPTERS.length; i++) {
      const c = CHAPTERS[i];
      if (t >= c.start && t < c.end) return { index: i, frac: (t - c.start) / (c.end - c.start) };
    }
    return { index: 0, frac: 0 };
  };

  /* ---------- Premier écran : la vidéo plein cadre recule jusqu’à son cadre ---------- */
  const hero = document.querySelector('[data-hero]');
  const screen = document.querySelector('[data-screen]');
  const scrim = document.querySelector('[data-scrim]');
  const copy = document.querySelector('[data-copy]');
  const bar = document.querySelector('[data-bar]');
  const barCta = bar.querySelector('.bar-cta');
  const ctaEls = [...document.querySelectorAll('[data-cta]')];

  // Taille du cadre final : la vidéo entière, entre la barre et les contrôles
  let W = 0, H = 0, s0 = 1, ty0 = 0;
  const room = () => Number(getComputedStyle(hero).getPropertyValue('--room')) || 220;
  const measureHero = () => {
    const vw = innerWidth, vh = innerHeight;
    W = Math.min(1280, vw - 2 * Math.max(20, Math.min(56, vw * 0.04)), (vh - room()) * 16 / 9);
    H = W * 9 / 16;
    screen.style.setProperty('--w', W + 'px');
    // Plein cadre au départ (un peu plus pour cacher les coins), plafonné en portrait
    s0 = Math.min(Math.max(vw / W, vh / H) * 1.04, vw < vh ? 2.1 : 3);
    // En portrait la vidéo ne couvre pas l’écran : on la cale en haut, sous la barre
    ty0 = H * s0 < vh ? (H * s0 - vh) / 2 + 64 : 0;
    renderHero();
  };
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  function renderHero() {
    const r = hero.getBoundingClientRect();
    const dist = hero.offsetHeight - innerHeight;
    const p = reduceMotion || dist <= 0 ? 0 : clamp(-r.top / dist);
    const z = ease(clamp(p / 0.85));
    screen.style.setProperty('--s', (s0 + (1 - s0) * z).toFixed(4));
    screen.style.setProperty('--ty', (ty0 * (1 - z)).toFixed(1) + 'px');
    const fadeOut = clamp(p / 0.32);
    copy.style.opacity = String(1 - fadeOut);
    copy.style.transform = `translateY(${(-48 * fadeOut).toFixed(1)}px)`;
    copy.style.visibility = fadeOut >= 1 ? 'hidden' : '';
    scrim.style.opacity = String(1 - clamp(p / 0.6) * 0.85);
    // Un seul bouton Télécharger à l’écran : celui de la barre prend le relais
    const otherCta = ctaEls.some((el) => {
      if (hero.contains(el)) return false;
      const b = el.getBoundingClientRect();
      return b.top < innerHeight - 40 && b.bottom > 80;
    });
    const show = (p > 0.22 || r.bottom < innerHeight * 0.5) && !otherCta;
    bar.toggleAttribute('data-cta-shown', show);
    barCta.tabIndex = show ? 0 : -1;
    bar.toggleAttribute('data-solid', r.bottom < innerHeight - 4);
  }

  /* ---------- Contrôles de la vidéo ---------- */
  const video = document.querySelector('[data-hero-video]');
  const playBtn = document.querySelector('[data-play]');
  const soundBtn = document.querySelector('[data-sound]');
  const now = document.querySelector('[data-now]');
  const progress = document.querySelector('[data-progress]');
  let current = 0;
  let raf = 0;
  let soundOn = false;
  let soundLoaded = false;
  let userPaused = reduceMotion;

  const showName = (i, dir) => {
    now.innerHTML = `<b>${CHAPTERS[i].name}</b><small class="num">${i + 1} sur ${CHAPTERS.length}</small>`;
    now.classList.remove('from-left', 'from-right');
    void now.offsetWidth;
    if (dir) now.classList.add(dir);
  };
  const tick = () => {
    const { index, frac } = chapterAt(video.currentTime);
    progress.style.transform = `scaleX(${frac.toFixed(4)})`;
    if (index !== current) {
      // La boucle repart de l’accueil : le nom arrive par la droite, comme un chapitre suivant
      const dir = index > current || index === 0 ? 'from-right' : 'from-left';
      current = index;
      showName(index, dir);
    }
  };
  const loop = () => { tick(); raf = requestAnimationFrame(loop); };
  const emit = () => {
    const playing = !video.paused;
    playBtn.setAttribute('aria-label', playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo');
    playBtn.toggleAttribute('data-playing', playing);
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.setAttribute('aria-label', soundOn ? 'Couper le son' : 'Activer le son');
  };
  const play = () => video.play().catch(() => {});

  video.addEventListener('play', () => { cancelAnimationFrame(raf); loop(); emit(); });
  video.addEventListener('pause', () => { cancelAnimationFrame(raf); tick(); emit(); });
  video.addEventListener('seeked', tick);
  video.addEventListener('loadedmetadata', tick);

  playBtn.addEventListener('click', () => {
    if (video.paused) { userPaused = false; play(); }
    else { userPaused = true; video.pause(); }
  });
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    if (soundOn && !soundLoaded) {
      // Le fichier avec la piste son n’est chargé qu’à la demande, au même instant
      soundLoaded = true;
      const t = video.currentTime;
      video.src = 'media/demo-son.mp4';
      video.addEventListener('loadedmetadata', () => { video.currentTime = t; }, { once: true });
    }
    // Son et lecture se règlent dans le clic : Safari refuse un son lancé plus tard
    video.muted = !soundOn;
    if (soundOn) { userPaused = false; play(); }
    emit();
  });

  // Le chapitre n’est annoncé qu’après un clic sur précédent ou suivant, jamais pendant la lecture seule
  const said = document.querySelector('[data-chapter-said]');
  const go = (step) => {
    const i = (chapterAt(video.currentTime).index + step + CHAPTERS.length) % CHAPTERS.length;
    video.currentTime = CHAPTERS[i].start + 0.01;
    said.textContent = `${CHAPTERS[i].name}, ${i + 1} sur ${CHAPTERS.length}`;
    userPaused = false;
    play();
  };
  document.querySelector('[data-prev]').addEventListener('click', () => {
    // Au début d’un chapitre on recule d’un chapitre, sinon on revient à son début
    const t = video.currentTime;
    if (t - CHAPTERS[chapterAt(t).index].start > 1.2) go(0);
    else go(-1);
  });
  document.querySelector('[data-next]').addEventListener('click', () => go(1));

  // Lecture quand la vidéo est visible, pause sinon
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !userPaused) play();
    else if (!e.isIntersecting) video.pause();
  }, { threshold: 0.25 }).observe(hero);

  /* ---------- Parcours : la ligne se remplit au défilement ---------- */
  const rail = document.querySelector('[data-rail]');
  const track = rail.parentElement;
  const stops = [...document.querySelectorAll('.stop')];
  let railH = 0;
  // La ligne va du premier au dernier point
  const measureRail = () => {
    railH = stops.at(-1).offsetTop - stops[0].offsetTop;
    track.style.setProperty('--rail-h', railH + 'px');
  };
  const renderRail = () => {
    // Le pied de page suit le parcours : près du bas, le repère descend pour que le dernier point s’allume sur un grand écran
    const left = document.documentElement.scrollHeight - innerHeight - scrollY;
    const mark = Math.max(innerHeight * 0.6, stops.at(-1).getBoundingClientRect().top + 17 - 2 * left);
    const p = railH ? clamp((mark - track.getBoundingClientRect().top) / railH) : 0;
    rail.style.transform = `scaleY(${p.toFixed(4)})`;
    stops.forEach((s) => s.toggleAttribute('data-reached', s.getBoundingClientRect().top + 16 < mark));
  };

  /* ---------- Fond : la grille monte à 55 % de la vitesse de la page ---------- */
  const grid = document.querySelector('[data-grid]');
  const GRID_TILE = 96;
  // Décalage modulo une maille : la couche, plus haute d’une maille que l’écran, le couvre toujours.
  // Pas de décalage négatif quand le navigateur tire la page au-delà du haut.
  const renderGrid = () => {
    if (reduceMotion) return;
    grid.style.transform = `translate3d(0, ${(-((Math.max(0, scrollY) * 0.55) % GRID_TILE)).toFixed(1)}px, 0)`;
  };

  /* ---------- Défilement et taille de la fenêtre ---------- */
  let ticking = false;
  const frame = () => { ticking = false; renderHero(); renderRail(); renderGrid(); };
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => { measureHero(); measureRail(); renderRail(); });
  measureHero();
  measureRail();
  renderRail();
  renderGrid();

  /* ---------- Apparitions au défilement, une seule fois ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  document.querySelectorAll('[data-reveal]').forEach((el) => revealIO.observe(el));

  /* ---------- Illustrations : chacune se joue quand elle arrive à l’écran ---------- */
  // Sans data-s, une scène montre son état final : c’est ce que garde le mouvement réduit
  const visible = new Set();
  const running = new Set();
  const replay = (el, attr) => { el.removeAttribute(attr); void el.offsetWidth; el.setAttribute(attr, ''); };
  const tween = (ms, fn) => new Promise((done) => {
    const t0 = performance.now();
    const step = (t) => {
      const k = clamp((t - t0) / ms);
      fn(k);
      if (k < 1) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  });
  const fr = (n, d) => n.toFixed(d).replace('.', ',');
  // Les % d’un translate visent le curseur lui-même : on le place en pixels dans sa scène
  const pointAt = (cur, box, node, dx = 0.5, dy = 0.6) => {
    const a = box.getBoundingClientRect(), b = node.getBoundingClientRect();
    cur.style.setProperty('--cx', `${(b.left - a.left + b.width * dx).toFixed(0)}px`);
    cur.style.setProperty('--cy', `${(b.top - a.top + b.height * dy).toFixed(0)}px`);
  };
  const restAt = (cur, box, fx, fy) => {
    cur.style.setProperty('--cx', `${(box.clientWidth * fx).toFixed(0)}px`);
    cur.style.setProperty('--cy', `${(box.clientHeight * fy).toFixed(0)}px`);
  };
  // Le curseur clique, puis la fenêtre répond au relâchement
  const click = async (cur) => { replay(cur, 'data-click'); await sleep(160); };

  // État de départ de chaque scène, posé dès le chargement pour qu’elle ne montre pas sa fin avant de se jouer
  const resets = {
    dl(el) {
      const stage = el.querySelector('[data-stage]');
      stage.dataset.s = '0';
      for (const a of ['data-hover', 'data-press']) el.querySelectorAll(`[${a}]`).forEach((n) => n.removeAttribute(a));
      const cur = el.querySelector('[data-cur]');
      cur.setAttribute('data-hide', '');
      restAt(cur, stage, 0.6, 0.66);
    },
    acct(el) { el.querySelector('[data-stage]').dataset.s = '0'; },
    mon(el) {
      const mon = el.querySelector('[data-mon]');
      mon.removeAttribute('data-stretched');
      mon.removeAttribute('data-load');
      el.querySelector('[data-sw]').removeAttribute('data-on');
      el.querySelector('.st-panel').dataset.k = 'off';
    },
    after(el) {
      const stage = el.querySelector('[data-stage]');
      stage.dataset.s = '0';
      const cur = el.querySelector('[data-cur]');
      cur.setAttribute('data-hide', '');
      restAt(cur, stage, 0.62, 0.72);
    },
  };

  const runs = {
    async dl(el) {
      const $ = (s) => el.querySelector(s);
      const stage = $('[data-stage]'), cur = $('[data-cur]'), btn = $('[data-btn]'), item = $('[data-item]');
      const prog = $('[data-prog]'), st = $('[data-st]'), rings = el.querySelectorAll('.br-ring');
      const total = parseFloat($('.br-st [data-size]').textContent) || 111;
      const ring = (k) => rings.forEach((r) => { r.style.strokeDashoffset = (100 - 100 * k).toFixed(2); });
      resets.dl(el);
      await sleep(400);
      cur.removeAttribute('data-hide');
      await sleep(200);
      pointAt(cur, stage, btn, 0.55, 0.6);
      await sleep(800);
      btn.setAttribute('data-press', '');
      await click(cur);
      btn.removeAttribute('data-press');
      ring(0);
      prog.textContent = `0/`;
      st.textContent = ' • 5 s restantes';
      stage.dataset.s = '1';
      await tween(2600, (k) => {
        ring(k);
        prog.textContent = `${fr(total * k, 1)}/`;
        const left = Math.max(1, Math.ceil((1 - k) * 5));
        st.textContent = ` • ${left}${NBSP}s restante${left > 1 ? 's' : ''}`;
      });
      prog.textContent = '';
      st.textContent = ' • Terminé';
      delete stage.dataset.s;
      await sleep(450);
      pointAt(cur, stage, item, 0.42, 0.55);
      await sleep(720);
      item.setAttribute('data-hover', '');
      await sleep(240);
      item.setAttribute('data-press', '');
      await click(cur);
      item.removeAttribute('data-press');
    },
    async ss(el) {
      const ss = el.querySelector('[data-ss]');
      const cur = el.querySelector('[data-cursor]');
      const more = el.querySelector('[data-ss-more]');
      const run = el.querySelector('[data-ss-run]');
      const press = async (state) => { await click(cur); ss.dataset.s = state; };
      if (reduceMotion) { ss.dataset.s = '1'; pointAt(cur, ss, run); return; }
      while (visible.has(el)) {
        ss.dataset.s = '0';
        restAt(cur, ss, 0.42, 0.64);
        await sleep(900);
        pointAt(cur, ss, more, 0.4);
        await sleep(940);
        await press('1');
        await sleep(500);
        pointAt(cur, ss, run);
        await sleep(840);
        await press('2');
        await sleep(2200);
      }
    },
    async acct(el) {
      const stage = el.querySelector('[data-stage]');
      resets.acct(el);
      await sleep(350);
      stage.dataset.s = '1';
      await sleep(1600);
      delete stage.dataset.s;
    },
    async mon(el) {
      const $ = (s) => el.querySelector(s);
      const stage = $('[data-stage]'), mon = $('[data-mon]'), sw = $('[data-sw]'), cur = $('[data-cur]');
      const keys = $('[data-keys]'), rescue = $('[data-rescue]');
      const panel = $('.st-panel');
      const status = (key) => { panel.dataset.k = key; };
      // Changement de mode : noir un instant, puis l’image revient dans sa nouvelle résolution
      const mode = async (stretched, key) => {
        mon.setAttribute('data-blank', '');
        await sleep(260);
        mon.removeAttribute('data-load');
        mon.toggleAttribute('data-stretched', stretched);
        status(key);
        await sleep(60);
        mon.removeAttribute('data-blank');
      };
      // Le curseur va au bouton, clique, puis s’efface : en partie, la souris appartient au jeu
      const toggle = async (on) => {
        cur.removeAttribute('data-hide');
        await sleep(120);
        pointAt(cur, stage, sw, 0.5, 0.55);
        await sleep(780);
        await click(cur);
        sw.toggleAttribute('data-on', on);
        status(on ? 'idle' : 'off');
        await sleep(300);
        cur.setAttribute('data-hide', '');
      };
      resets.mon(el);
      cur.setAttribute('data-hide', '');
      restAt(cur, stage, 0.3, 0.96);
      await sleep(700);
      while (visible.has(el)) {
        await toggle(true);
        await sleep(900);
        mon.setAttribute('data-load', '');
        status('armed');
        await sleep(1500);
        await mode(true, 'stretched');
        await sleep(2300);
        keys.setAttribute('data-show', '');
        await sleep(250);
        keys.setAttribute('data-press', '');
        rescue.setAttribute('data-press', '');
        await sleep(180);
        keys.removeAttribute('data-press');
        rescue.removeAttribute('data-press');
        await mode(false, 'native');
        await sleep(900);
        keys.removeAttribute('data-show');
        await sleep(900);
        if (!visible.has(el)) break;
        await toggle(false);
        await sleep(1100);
      }
    },
    async after(el) {
      const stage = el.querySelector('[data-stage]');
      const cur = el.querySelector('[data-cur]');
      const nav = el.querySelector('[data-nav="stats"]');
      resets.after(el);
      await sleep(400);
      stage.dataset.s = '1';
      await sleep(1500);
      // Sans barre latérale (colonne étroite), la page change seule
      if (nav.offsetParent) {
        cur.removeAttribute('data-hide');
        await sleep(150);
        pointAt(cur, stage, nav, 0.32, 0.55);
        await sleep(800);
        await click(cur);
      }
      delete stage.dataset.s;
    },
  };
  if (!reduceMotion) for (const el of document.querySelectorAll('[data-illus]')) resets[el.dataset.illus]?.(el);
  restAt(document.querySelector('[data-cursor]'), document.querySelector('[data-ss]'), 0.42, 0.64);

  const illusIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target;
      // Sous le seuil, la spec garde isIntersecting à vrai tant qu’un bout dépasse : on compare le ratio
      if (e.intersectionRatio < illusIO.thresholds[0]) { visible.delete(el); continue; }
      visible.add(el);
      if (running.has(el)) continue;
      running.add(el);
      const key = el.dataset.illus;
      // Mouvement réduit : la scène garde son état final, sauf SmartScreen qui s’ouvre sur ses détails
      const done = reduceMotion && key !== 'ss' ? Promise.resolve() : runs[key](el);
      Promise.resolve(done).finally(() => running.delete(el));
    }
  }, { threshold: 0.45 });
  document.querySelectorAll('[data-illus]').forEach((el) => illusIO.observe(el));

  /* ---------- Téléchargement lancé ---------- */
  // Une fois l’API lue, le lien mène au fichier et la page reste ouverte : le bouton confirme pendant 4 s
  const dlStatus = document.querySelector('[data-dl-status]');
  document.querySelectorAll('.btn[data-dl]').forEach((a) => {
    let timer = 0;
    a.addEventListener('click', () => {
      if (!a.href.includes('/releases/download/')) return;
      a.setAttribute('data-started', '');
      dlStatus.textContent = 'Téléchargement lancé';
      clearTimeout(timer);
      timer = setTimeout(() => { a.removeAttribute('data-started'); dlStatus.textContent = ''; }, 4000);
    });
  });

  /* ---------- Dernière version ---------- */
  // Les liens mènent à la page de la release tant que l’API GitHub n’a pas répondu ; ensuite, directement au fichier.
  // Les valeurs écrites dans le HTML ne servent que si l’API ne répond pas.
  fetch('https://api.github.com/repos/NOUSSS/precise-gunplay/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((rel) => {
      if (!rel) return;
      const files = {
        setup: rel.assets.find((a) => /Setup-[\d.]+\.exe$/.test(a.name)),
        portable: rel.assets.find((a) => /Portable-[\d.]+\.exe$/.test(a.name)),
      };
      const mo = (a) => `${Math.round(a.size / 1048576)}${NBSP}Mo`;
      document.querySelectorAll('[data-dl]').forEach((a) => { const f = files[a.dataset.dl]; if (f) a.href = f.browser_download_url; });
      document.querySelectorAll('[data-name]').forEach((el) => { const f = files[el.dataset.name]; if (f) el.textContent = f.name; });
      document.querySelectorAll('[data-size]').forEach((el) => { const f = files[el.dataset.size]; if (f) el.textContent = mo(f); });
      document.querySelectorAll('[data-version]').forEach((el) => { el.textContent = rel.tag_name; });
    })
    .catch(() => {});
})();
