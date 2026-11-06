// Horloge virtuelle pour filmer l'app image par image.
// Chargé avant tout autre script de la démo : Date, performance.now, les minuteries,
// requestAnimationFrame et les animations CSS suivent window.__vt au lieu de l'heure réelle.
// Le tournage (record.js) appelle __vt.advanceTo(ms) avant chaque image, puis capture.
(() => {
  const RealDate = Date;
  const realPerf = performance.now.bind(performance);
  // Heure murale fictive et fixe : un soir de semaine, 21 h 14 à Paris (le compte à rebours de la boutique en dépend).
  const EPOCH = RealDate.UTC(2026, 10, 5, 20, 14, 0);
  let vt = 0;

  const yieldReal = (() => {
    const ch = new MessageChannel();
    const q = [];
    ch.port1.onmessage = () => q.shift()?.();
    return () => new Promise((r) => { q.push(r); ch.port2.postMessage(0); });
  })();

  let nextId = 1;
  const timers = new Map();
  const add = (fn, ms, args, every) => {
    const id = nextId++;
    const d = Math.max(every ? 1 : 0, Number(ms) || 0);
    timers.set(id, { at: vt + d, fn, args, every: every ? d : 0, seq: id });
    return id;
  };
  window.setTimeout = (fn, ms, ...args) => add(fn, ms, args, false);
  window.setInterval = (fn, ms, ...args) => add(fn, ms, args, true);
  window.clearTimeout = window.clearInterval = (id) => { timers.delete(id); };

  let rafQ = [];
  let rafId = 1;
  window.requestAnimationFrame = (cb) => { const id = rafId++; rafQ.push({ id, cb }); return id; };
  window.cancelAnimationFrame = (id) => { rafQ = rafQ.filter((r) => r.id !== id); };

  performance.now = () => vt;
  class VDate extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(EPOCH + vt); }
    static now() { return EPOCH + vt; }
  }
  window.Date = VDate;

  // Animations CSS et Web Animations : mises en pause dès qu'on les voit, puis placées au temps virtuel.
  const born = new WeakMap();
  function syncAnimations() {
    for (const a of document.getAnimations()) {
      if (!born.has(a)) born.set(a, vt);
      const elapsed = vt - born.get(a);
      const end = a.effect?.getComputedTiming?.().endTime ?? Infinity;
      try {
        if (Number.isFinite(end) && elapsed >= end) a.finish();
        else { if (a.playState !== 'paused') a.pause(); a.currentTime = elapsed; }
      } catch { /* animation retirée entre-temps */ }
    }
  }

  async function advanceTo(target) {
    for (let guard = 0; guard < 5000; guard++) {
      let best = null;
      for (const t of timers.values()) {
        if (t.at <= target && (!best || t.at < best.at || (t.at === best.at && t.seq < best.seq))) best = t;
      }
      if (!best) break;
      vt = Math.max(vt, best.at);
      if (best.every) { best.at += best.every; best.seq = nextId++; } else {
        for (const [id, t] of timers) if (t === best) timers.delete(id);
      }
      try { typeof best.fn === 'function' ? best.fn(...best.args) : (0, eval)(String(best.fn)); } catch (e) { console.error(e); }
      await yieldReal(); // laisse passer les promesses en attente (réponses de l'API fictive)
    }
    vt = target;
    const q = rafQ;
    rafQ = [];
    for (const r of q) { try { r.cb(vt); } catch (e) { console.error(e); } }
    await yieldReal();
    syncAnimations();
  }

  window.__vt = { advanceTo, syncAnimations, now: () => vt, realNow: realPerf, epoch: EPOCH };
})();
