/* ===========================================================================
   neuristor.js — hero canvas, a coupled excitable lattice.
   References Zhang et al. Nat. Commun. 15, 6986 (2024).
   FitzHugh-Nagumo dynamics with diffusive coupling stands in for the
   thermal-neuristor lattice; the visible behavior is what we want:
   wavefronts, synchronization, occasional bursts of long-range order.
   --------------------------------------------------------------------------- */

(function () {
  const canvas = document.querySelector('.hero-canvas');
  if (!canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d', { alpha: true });

  // ---- parameters ---------------------------------------------------------
  const DT = 0.20;
  const D = 0.55;          // diffusive coupling strength
  const EPS = 0.08;        // recovery timescale
  const A = 0.7;
  const B = 0.8;
  const I_EXT = 0.34;      // bias current — sub-threshold; needs perturbations
  const SPIKE_THR = 1.0;   // visual flash threshold
  const FPS = 30;
  const FRAME_MS = 1000 / FPS;
  const SEED_PROB = 0.012; // chance per frame of injecting a perturbation
  const SEED_RADIUS = 3;

  // ---- state --------------------------------------------------------------
  let cols = 80, rows = 36;
  let v, w, dv, dw;
  let W = 0, H = 0, cw = 0, ch = 0;
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  let visible = true;
  let raf = 0;
  let last = 0;

  // ---- colors (read from CSS custom properties) ---------------------------
  let cCanvas, cPort1, cPort2, cAccent, cInk;
  function loadColors() {
    const s = getComputedStyle(document.documentElement);
    const hex = (name) => {
      const c = s.getPropertyValue(name).trim();
      return [
        parseInt(c.slice(1, 3), 16),
        parseInt(c.slice(3, 5), 16),
        parseInt(c.slice(5, 7), 16)
      ];
    };
    cCanvas = hex('--canvas');
    cPort1  = hex('--portrait-1');
    cPort2  = hex('--portrait-2');
    cAccent = hex('--accent');
    cInk    = hex('--ink');
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(c1, c2, t) {
    return [
      lerp(c1[0], c2[0], t) | 0,
      lerp(c1[1], c2[1], t) | 0,
      lerp(c1[2], c2[2], t) | 0
    ];
  }

  // ---- sizing -------------------------------------------------------------
  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(rect.width));
    H = Math.max(1, Math.floor(rect.height));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // cell size: target ~22px on desktop, larger on mobile (fewer cells = perf)
    const targetCell = window.innerWidth < 720 ? 26 : 20;
    cols = Math.max(18, Math.ceil(W / targetCell));
    rows = Math.max(10, Math.ceil(H / targetCell));
    cw = W / cols;
    ch = H / rows;

    const len = cols * rows;
    const oldV = v, oldW = w, oldCols = v ? Math.floor(Math.sqrt(v.length * (cols / rows))) : 0;
    v = new Float32Array(len);
    w = new Float32Array(len);
    dv = new Float32Array(len);
    dw = new Float32Array(len);

    if (oldV) {
      // best-effort transfer (rare; just reseed)
      for (let i = 0; i < len; i++) {
        v[i] = -1.2 + (Math.random() - 0.5) * 0.05;
        w[i] = -0.6 + (Math.random() - 0.5) * 0.05;
      }
    } else {
      seedRest();
    }
  }

  function seedRest() {
    const len = cols * rows;
    for (let i = 0; i < len; i++) {
      v[i] = -1.2 + (Math.random() - 0.5) * 0.05;
      w[i] = -0.6 + (Math.random() - 0.5) * 0.05;
    }
    for (let k = 0; k < 6; k++) stimulateAt(Math.random() * cols | 0, Math.random() * rows | 0, SEED_RADIUS + 1);
  }

  function stimulateAt(cx, cy, r) {
    const r2 = r * r;
    for (let y = Math.max(0, cy - r); y <= Math.min(rows - 1, cy + r); y++) {
      for (let x = Math.max(0, cx - r); x <= Math.min(cols - 1, cx + r); x++) {
        const dxv = x - cx, dyv = y - cy;
        if (dxv*dxv + dyv*dyv <= r2) v[y * cols + x] = 1.4 + Math.random() * 0.2;
      }
    }
  }

  // ---- dynamics -----------------------------------------------------------
  function step() {
    for (let y = 0; y < rows; y++) {
      const yLo = y > 0 ? y - 1 : y;
      const yHi = y < rows - 1 ? y + 1 : y;
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const xLo = x > 0 ? x - 1 : x;
        const xHi = x < cols - 1 ? x + 1 : x;
        const vi = v[i];
        const lap = v[y*cols + xLo] + v[y*cols + xHi] + v[yLo*cols + x] + v[yHi*cols + x] - 4 * vi;
        dv[i] = vi - (vi*vi*vi) / 3 - w[i] + I_EXT + D * lap;
        dw[i] = EPS * (vi + A - B * w[i]);
      }
    }
    const len = cols * rows;
    for (let i = 0; i < len; i++) {
      v[i] += DT * dv[i];
      w[i] += DT * dw[i];
    }
    if (Math.random() < SEED_PROB) {
      stimulateAt(Math.random() * cols | 0, Math.random() * rows | 0, SEED_RADIUS);
    }
  }

  // ---- render -------------------------------------------------------------
  function render() {
    ctx.fillStyle = `rgb(${cInk[0]},${cInk[1]},${cInk[2]})`;
    ctx.fillRect(0, 0, W, H);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const vi = v[i];
        let rgb;
        if (vi > SPIKE_THR) {
          const heat = Math.min(1, (vi - SPIKE_THR) / 1.1);
          rgb = mix(cPort2, cAccent, heat * 0.85);
        } else {
          // normalize from ~[-1.5, 1.0] to [0, 1]
          const t = Math.max(0, Math.min(1, (vi + 1.5) / 2.5));
          if (t < 0.55) rgb = mix(cCanvas, cPort1, t / 0.55);
          else          rgb = mix(cPort1, cPort2, (t - 0.55) / 0.45);
        }
        ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        // overdraw by 0.5px to avoid hairline gaps
        ctx.fillRect(x * cw, y * ch, cw + 0.5, ch + 0.5);
      }
    }
  }

  // ---- loop ---------------------------------------------------------------
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    if (t - last < FRAME_MS) return;
    last = t;
    step();
    render();
  }

  function start() {
    if (raf) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // ---- visibility / motion -----------------------------------------------
  function onVisibility(entries) {
    visible = entries[0].isIntersecting;
    if (visible && !raf) start();
    if (!visible && raf) stop();
  }

  // ---- boot ---------------------------------------------------------------
  loadColors();
  resize();

  if (reduced) {
    // static still-frame: run a few warmup steps then render once
    for (let k = 0; k < 200; k++) step();
    render();
    return;
  }

  // warm up so first visible frame already shows structure
  for (let k = 0; k < 60; k++) step();
  render();

  const io = new IntersectionObserver(onVisibility, { threshold: 0 });
  io.observe(canvas);

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      resize();
      for (let k = 0; k < 40; k++) step();
      render();
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (visible) start();
  });

  start();
})();
