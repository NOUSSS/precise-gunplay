(() => {
  'use strict';
  window.pgReady = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Barre du haut ---------- */
  const topbar = document.querySelector('[data-topbar]');
  const onScrollTopbar = () => topbar.classList.toggle('is-scrolled', window.scrollY > 8);

  /* ---------- Un seul bouton Télécharger à l’écran ---------- */
  // Le bouton de la barre se montre quand aucun grand bouton (héros, appel final) n’est visible sous la barre.
  // La marge du bas retarde la prise de relais jusqu’à ce que le bouton final ait commencé à apparaître (voir revealIO).
  const topbarCta = topbar.querySelector('[data-topbar-cta]');
  const ctaInView = new Set();
  const CTA_RATIO = 0.6;
  const ctaIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.intersectionRatio >= CTA_RATIO) ctaInView.add(e.target);
      else ctaInView.delete(e.target);
    }
    topbarCta.classList.toggle('is-shown', ctaInView.size === 0);
  }, { rootMargin: `-${topbar.offsetHeight}px 0px -15% 0px`, threshold: CTA_RATIO });
  document.querySelectorAll('[data-cta]').forEach((el) => ctaIO.observe(el));

  /* ---------- Apparitions ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  const hero = document.querySelector('[data-hero]');
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (hero.contains(el)) return;
    revealIO.observe(el);
  });
  // Le héros entre dès le premier rendu, en cascade.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    hero.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
  }));

  /* ---------- Inclinaison de la vidéo et parallaxe ---------- */
  const stage = document.querySelector('[data-stage]');
  const frame = document.querySelector('[data-frame]');
  const depthEls = [...document.querySelectorAll('[data-depth]')].map((el) => ({
    el, depth: parseFloat(el.dataset.depth), box: el.parentElement,
  }));

  let ticking = false;
  const update = () => {
    ticking = false;
    onScrollTopbar();
    if (reduceMotion) return;
    const vh = window.innerHeight;

    const top = stage.getBoundingClientRect().top;
    if (top < vh && top > -vh) {
      // 1 tant que la vidéo est basse dans l'écran, 0 quand elle atteint le haut.
      const p = clamp((top - vh * 0.12) / (vh * 0.62), 0, 1);
      frame.style.transform = `rotateX(${(p * 20).toFixed(2)}deg) scale(${(1 - p * 0.06).toFixed(4)})`;
    }

    for (const d of depthEls) {
      const r = d.box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const offset = (r.top + r.height / 2 - vh / 2) * -d.depth;
      d.el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    }
  };
  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();

  /* ---------- Vidéo à chapitres ---------- */
  const video = document.querySelector('[data-video]');
  const playBtn = document.querySelector('[data-play]');
  const soundBtn = document.querySelector('[data-sound]');
  const currentLabel = document.querySelector('[data-chapter-current]');
  const chapters = [...document.querySelectorAll('[data-chapter]')].map((btn) => ({
    btn,
    start: parseFloat(btn.dataset.start),
    end: parseFloat(btn.dataset.end),
    fill: btn.querySelector('.chapter-fill'),
    label: btn.querySelector('.chapter-label').textContent,
  }));

  let userPaused = reduceMotion;
  let videoVisible = false;
  let activeChapter = -1;
  let rafId = 0;

  // Après le dernier chapitre, la vidéo revient à l’accueil avant de boucler : on repart comme au début.
  const loopBack = chapters[chapters.length - 1].end;
  const paintChapters = () => {
    const t = video.currentTime >= loopBack ? 0 : video.currentTime;
    let active = 0;
    chapters.forEach((c, i) => {
      const p = clamp((t - c.start) / (c.end - c.start), 0, 1);
      c.fill.style.transform = `scaleX(${p.toFixed(4)})`;
      if (t >= c.start) active = i;
    });
    if (active !== activeChapter) {
      activeChapter = active;
      chapters.forEach((c, i) => c.btn.setAttribute('aria-current', String(i === active)));
      currentLabel.textContent = chapters[active].label;
    }
  };
  const loop = () => {
    paintChapters();
    rafId = video.paused ? 0 : requestAnimationFrame(loop);
  };
  const syncPlayState = () => {
    const playing = !video.paused;
    playBtn.classList.toggle('is-playing', playing);
    playBtn.setAttribute('aria-label', playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo');
    if (playing && !rafId) rafId = requestAnimationFrame(loop);
    paintChapters();
  };
  const tryPlay = () => { video.play().catch(() => syncPlayState()); };

  video.addEventListener('play', syncPlayState);
  video.addEventListener('pause', syncPlayState);
  video.addEventListener('seeked', paintChapters);
  video.addEventListener('loadedmetadata', paintChapters);

  playBtn.addEventListener('click', () => {
    if (video.paused) { userPaused = false; tryPlay(); }
    else { userPaused = true; video.pause(); }
  });

  chapters.forEach((c) => {
    c.btn.addEventListener('click', () => {
      video.currentTime = c.start + 0.01;
      userPaused = false;
      tryPlay();
      paintChapters();
    });
  });

  let soundSourceLoaded = false;
  soundBtn.addEventListener('click', () => {
    const on = video.muted;
    if (on && !soundSourceLoaded) {
      // La piste avec le son est un autre fichier : on le charge à la demande, au même instant.
      soundSourceLoaded = true;
      const t = video.currentTime;
      video.src = 'media/demo-son.mp4';
      video.addEventListener('loadedmetadata', () => { video.currentTime = t; }, { once: true });
    }
    video.muted = !on;
    soundBtn.classList.toggle('is-on', on);
    soundBtn.setAttribute('aria-pressed', String(on));
    soundBtn.setAttribute('aria-label', on ? 'Couper le son' : 'Activer le son');
    if (on) { userPaused = false; tryPlay(); }
  });

  new IntersectionObserver(([e]) => {
    videoVisible = e.isIntersecting;
    if (videoVisible && !userPaused) tryPlay();
    else if (!videoVisible && !video.paused) video.pause();
  }, { threshold: 0.25 }).observe(video);

  paintChapters();

  /* ---------- Résolution étirée ---------- */
  const steps = document.querySelector('[data-steps]');
  const monitor = document.querySelector('[data-monitor]');
  const stepBtns = [...steps.querySelectorAll('[data-step]')];
  const resLabel = monitor.querySelector('[data-res]');
  const STATES = [
    { dur: 2600, res: 'Pilote d’écran générique' },
    { dur: 4400, res: '1440 × 1080 étirée' },
    { dur: 3000, res: 'Résolution native, 1920 × 1080' },
  ];
  let stepIndex = 0;

  const setStep = (i) => {
    stepIndex = i;
    stepBtns.forEach((b, j) => {
      b.classList.toggle('is-active', j === i);
      b.setAttribute('aria-pressed', String(j === i));
    });
    steps.style.setProperty('--step-dur', `${STATES[i].dur}ms`);
    monitor.style.setProperty('--step-dur', `${STATES[i].dur}ms`);
    monitor.dataset.state = String(i);
    if (resLabel.textContent !== STATES[i].res) {
      resLabel.textContent = STATES[i].res;
      if (!reduceMotion) {
        resLabel.animate(
          [{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0)' }],
          { duration: 320, easing: 'ease-out' }
        );
      }
    }
  };

  stepBtns.forEach((b, i) => {
    b.querySelector('.step-progress span').addEventListener('animationend', () => {
      if (i === stepIndex && !steps.classList.contains('is-manual')) setStep((i + 1) % STATES.length);
    });
    b.addEventListener('click', () => {
      steps.classList.add('is-manual');
      monitor.classList.add('is-manual');
      setStep(i);
    });
  });

  steps.classList.add('is-paused');
  monitor.classList.add('is-paused');
  if (reduceMotion) { steps.classList.add('is-manual'); monitor.classList.add('is-manual'); }
  setStep(0);

  new IntersectionObserver(([e]) => {
    steps.classList.toggle('is-paused', !e.isIntersecting);
    monitor.classList.toggle('is-paused', !e.isIntersecting);
  }, { threshold: 0.35 }).observe(monitor);

  /* ---------- Fichiers de la dernière version ---------- */
  // Les liens mènent à la page de la release tant que l’API GitHub n’a pas répondu ; ensuite, directement au fichier.
  const fmtSize = (bytes) => `${Math.round(bytes / 1048576)} Mo`;
  fetch('https://api.github.com/repos/NOUSSS/precise-gunplay/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((rel) => {
      const find = (re) => rel.assets.find((a) => re.test(a.name));
      const files = { setup: find(/Setup.*\.exe$/i), portable: find(/Portable.*\.exe$/i) };
      for (const [kind, asset] of Object.entries(files)) {
        if (!asset) continue;
        document.querySelectorAll(`[data-dl="${kind}"]`).forEach((a) => { a.href = asset.browser_download_url; });
        document.querySelectorAll(`[data-name="${kind}"]`).forEach((el) => { el.textContent = asset.name; });
        document.querySelectorAll(`[data-size="${kind}"]`).forEach((el) => { el.textContent = fmtSize(asset.size); });
      }
    })
    .catch(() => {});

  /* ---------- Fenêtre SmartScreen ---------- */
  const smart = document.querySelector('[data-smart]');
  const cursor = smart.querySelector('[data-cursor]');
  const link = smart.querySelector('[data-target="link"]');
  const run = smart.querySelector('[data-target="run"]');

  if (reduceMotion) {
    smart.dataset.state = '1';
  } else {
    let smartVisible = false;
    let wake = null;
    const whenVisible = () => smartVisible ? Promise.resolve() : new Promise((r) => { wake = r; });

    new IntersectionObserver(([e]) => {
      smartVisible = e.isIntersecting;
      if (smartVisible && wake) { wake(); wake = null; }
    }, { threshold: 0.5 }).observe(smart);

    const moveTo = (x, y, instant) => {
      cursor.style.transition = instant ? 'none' : '';
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      if (instant) cursor.getBoundingClientRect();
    };
    const pointAt = (el) => {
      const s = smart.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      moveTo(r.left - s.left + r.width * 0.45, r.top - s.top + r.height * 0.55);
    };
    const rest = () => {
      const s = smart.getBoundingClientRect();
      moveTo(s.width * 0.62, s.height * 0.42, true);
    };
    const press = async (el) => {
      el.classList.add('is-pressed');
      await sleep(180);
      el.classList.remove('is-pressed');
    };

    const sequence = async () => {
      smart.classList.add('is-live');
      for (;;) {
        smart.dataset.state = '0';
        rest();
        await whenVisible();
        await sleep(1000);
        pointAt(link);
        await sleep(1000);
        await press(link);
        smart.dataset.state = '1';
        await sleep(1100);
        await whenVisible();
        pointAt(run);
        await sleep(1000);
        await press(run);
        smart.dataset.state = '2';
        await sleep(700);
        smart.dataset.state = '3';
        await sleep(900);
      }
    };
    sequence();
  }
})();
