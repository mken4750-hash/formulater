// ===== Responsive + rotation support =====
// Layout itself is pure CSS (see "RESPONSIVE LAYER" in index.html). This file only:
//  1. tags <html> with the current orientation / size class (handy for debugging and styling),
//  2. re-fits typeset formulas, auto-growing text boxes and the upload viewer after the size changes,
//  3. re-reads the native system-bar insets (they change when the phone rotates),
//  4. plays one short, GPU-only fade/settle animation when the WIDTH changes (rotation, split-screen, fold).
// A height-only change (on-screen keyboard) never animates.
(() => {
  const root = document.documentElement;
  let lastW = innerWidth, raf = 0, tIns = 0;

  const tag = () => {
    const w = innerWidth, h = innerHeight;
    root.dataset.orient = w > h ? 'landscape' : 'portrait';
    root.dataset.size = Math.min(w, h) >= 600 ? 'tablet' : 'phone';
  };

  const isDark = () => { try { return !!((PRE[T.p] || PRE.Beige).d); } catch (e) { return false; } };
  const syncInsets = () => { try { if (typeof syncNativeSystemBars === 'function') syncNativeSystemBars(isDark()); } catch (e) {} };

  const refit = () => {
    try {
      if (typeof fitFx === 'function') {
        const app = document.getElementById('app');
        if (app) fitFx(app);
        ['fb', 'bs', 'pv', 'sb'].forEach(id => { const e = document.getElementById(id); if (e && e.firstChild) fitFx(e); });
      }
    } catch (e) {}
    try { if (typeof grow === 'function') document.querySelectorAll('textarea.el').forEach(grow); } catch (e) {}
    try {
      if (typeof uplSize === 'function' && window.UPL && UPL.open && UPL.view === 'doc' && document.querySelector('#up #upw')) uplSize();
    } catch (e) {}
  };

  const settle = () => {
    if (!Element.prototype.animate) return;
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    ['header', '#app', '#up.show'].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      try {
        el.getAnimations().forEach(a => { if (a.id === 'rot') a.cancel(); });
        const a = el.animate(
          [{ opacity: 0.2, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }],
          { duration: 340, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }
        );
        a.id = 'rot';
      } catch (e) {}
    });
  };

  tag();
  // runs inside the resize event itself, so the animation is in place before the first re-laid-out frame is painted (no flash)
  addEventListener('resize', () => {
    const widthChanged = Math.abs(innerWidth - lastW) >= 80;
    lastW = innerWidth;
    tag();
    if (widthChanged) settle();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { refit(); requestAnimationFrame(refit); });
    clearTimeout(tIns);
    tIns = setTimeout(() => { syncInsets(); setTimeout(syncInsets, 450); }, 120);
  }, { passive: true });

  // first load: make sure insets are known for the current orientation
  addEventListener('load', () => setTimeout(syncInsets, 300));
})();
