// Land, sky and weather pieces shared by every scene.
import { define } from './registry.js';
import { qbez, pathOf, TAU } from '../core/geom.js';
import { rngFor } from '../core/rng.js';

export const U = 1.25; // base unit: one "pixel" of the original 800px-tall sketch

const FULL = () => [-Infinity, -Infinity, Infinity, Infinity];

// --- grass tuft: a fan of tapered blades -------------------------------------
export function tuft(K, r, x, g, s, a = 0.75) {
  const n = 4 + Math.floor(r() * 8), lean = (r() - 0.5) * 0.5;
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + (r() - 0.5) * 1.15 + lean, len = (7 + r() * 20) * U * s;
    const bx = x + (r() - 0.5) * 4 * U * s;
    const ex = bx + Math.cos(ang) * len, ey = g + Math.sin(ang) * len;
    const mx = (bx + ex) / 2 + (r() - 0.5) * len * 0.25, my = (g + ey) / 2;
    K.brush(qbez([bx, g], [mx, my], [ex + lean * len * 0.3, ey]), (0.9 + r() * 1.1) * U * s, a * (0.6 + 0.4 * r()), r, t => 1 - t * 0.95);
  }
}
define('tuft', {
  draw: (K, r, p) => tuft(K, r, p.x, p.y, p.scale, p.alpha ?? 0.75),
  box: p => [p.x - 30 * p.scale, p.y - 30 * p.scale, p.x + 30 * p.scale, p.y + 3],
});

// --- sun: soft cinnabar disc ---------------------------------------------------
define('sun', {
  draw(K, r, p) {
    for (let k = 0; k < 6; k++) {
      const R = p.r * (1 - k * 0.04);
      K.dab(p.x + (r() - 0.5) * p.r * 0.04, p.y + (r() - 0.5) * p.r * 0.04, R, R, p.alpha ?? 0.085, 0, K.accent);
    }
  },
  box: p => [p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r],
});

// --- birds: small flock of V strokes --------------------------------------------
define('birds', {
  draw(K, r, p) {
    const n = p.n ?? 4;
    for (let i = 0; i < n; i++) {
      const bx = p.x + (r() - 0.5) * 110 * U, by = p.y + (r() - 0.5) * 50 * U, w = (3 + r() * 3) * U * (p.scale ?? 1), f = r() * 2 * U;
      K.brush(qbez([bx - w, by - f], [bx - w * 0.4, by - w * 0.5], [bx, by]), 1.1 * U, 0.75, r, t => 0.4 + 0.6 * t);
      K.brush(qbez([bx, by], [bx + w * 0.4, by - w * 0.5], [bx + w, by - f * 0.6]), 1.1 * U, 0.75, r, t => 1 - 0.6 * t);
    }
  },
  box: p => [p.x - 75 * U, p.y - 40 * U, p.x + 75 * U, p.y + 35 * U],
});

// --- horizon haze: warm gradient above the horizon -------------------------------
define('haze', {
  draw(K, r, p, env) {
    const { c } = K;
    const gr = c.createLinearGradient(0, p.y - p.h, 0, p.y + p.h * 0.12);
    gr.addColorStop(0, K.tint(0)); gr.addColorStop(1, K.tint(p.alpha ?? 0.09));
    c.fillStyle = gr; c.fillRect(env.x0, p.y - p.h, env.x1 - env.x0, p.h * 1.12);
  },
  box: FULL,
});

// --- ridge: continuous fbm hill line ------------------------------------------------
define('ridge', {
  draw(K, r, p, env) {
    const st = 5, pts = [], off = p.offset ?? 17;
    const x0 = Math.max(env.x0, p.from ?? -Infinity), x1 = Math.min(env.x1, p.to ?? Infinity);
    if (x1 <= x0) return;
    const xs = Math.floor(x0 / st) * st - st;
    for (let x = xs; x <= x1 + st; x += st) pts.push([x, p.y - p.amp * (0.5 + 0.5 * K.fbm(x / p.wave + off, 4))]);
    const line = pts.slice();
    pts.push([x1 + st, p.y + (p.depth ?? 30)], [xs, p.y + (p.depth ?? 30)]);
    if (p.erase) K.erase(pathOf(pts));
    K.wash(pts, p.alpha, r, 3, 2);
    K.brush(line, 1.2, p.alpha * 2.2, r, () => 0.6, true, K.ink, xs / st);
  },
  box: FULL,
});

// --- mist band ---------------------------------------------------------------------
define('mist', {
  draw: (K, r, p, env) => K.mist(env.x0, env.x1, p.y, p.h, p.strength, p.offset ?? 3.1, p.wave ?? 330, p.patch ?? 0, p.drift ?? 0),
  box: FULL,
  order: 99,
});

// --- ground band: soft wash with a wavy top edge ------------------------------------
define('ground', {
  draw(K, r, p, env) {
    const { c, noise1 } = K, s = p.scale ?? 1, st = 8, off = p.offset ?? 0, top = [];
    for (let x = Math.floor(env.x0 / st) * st - st; x <= env.x1 + st; x += st)
      top.push([x, p.y - 1.5 * U * s + noise1(x / (70 * U * s) + off) * 2.2 * U * s + noise1(x / (420 * U * s) + off * 3.1) * (p.wave ?? 0)]);
    const d = p.depth, y0 = p.y - d * 0.25;
    const P = pathOf(top.concat([[env.x1 + st, p.y + d], [env.x0 - st, p.y + d]]));
    const ai = p.alpha ?? 0.05;
    const gi = c.createLinearGradient(0, y0, 0, p.y + d);
    gi.addColorStop(0, K.ink(0)); gi.addColorStop(0.3, K.ink(ai)); gi.addColorStop(0.55, K.ink(ai * 0.4)); gi.addColorStop(1, K.ink(0));
    const go = c.createLinearGradient(0, y0, 0, p.y + d);
    go.addColorStop(0, K.tint(0)); go.addColorStop(0.3, K.tint(p.tint ?? 0.05)); go.addColorStop(1, K.tint(0));
    for (let k = 0; k < 2; k++) { c.save(); c.translate(0, k * 1.5 * U * s); c.fillStyle = gi; c.fill(P); c.fillStyle = go; c.fill(P); c.restore(); }
  },
  box: FULL,
  order: -2,
});

// --- plains marks: dry streaks and grass hatches, cell by cell -----------------------
define('marks', {
  draw(K, r, p, env) {
    const cs = p.cell, pad = 80;
    for (let ci = Math.floor((env.x0 - pad) / cs); ci <= Math.floor((env.x1 + pad) / cs); ci++) {
      const q = rngFor(p.seed, ci);
      const tx = (ci + q()) * cs, ty = p.y0 + q() * (p.y1 - p.y0), ss = env.scaleAt(ty);
      if (q() < (p.streaks ?? 0.45)) {
        const len = (18 + q() * 60) * U * ss;
        K.dry(K.wobble([[tx - len / 2, ty], [tx, ty + (q() - 0.5) * U], [tx + len / 2, ty]], 0.4 * U, q), (1.4 + q()) * U * ss, p.alpha ?? 0.12, q, 3, -0.05);
      }
      if (q() < (p.hatches ?? 0.55)) {
        const n = 2 + Math.floor(q() * 5);
        for (let i = 0; i < n; i++) {
          const hx = tx + (q() - 0.5) * 14 * U * ss, hy = ty + (q() - 0.5) * 3 * U * ss, hl = (2 + q() * 4) * U * ss;
          K.brush([[hx, hy], [hx + (q() - 0.5) * hl * 0.5, hy - hl]], 0.9 * U * ss, (p.alpha ?? 0.12) * 3.5, q, t => 1 - 0.9 * t);
        }
      }
    }
  },
  box: FULL,
  order: -1,
});

// --- foreground grass: dense tufts along the bottom edge -----------------------------
define('grassField', {
  draw(K, r, p, env) {
    const cs = p.cell ?? 16 * U, pad = 60;
    for (let ci = Math.floor((env.x0 - pad) / cs); ci <= Math.floor((env.x1 + pad) / cs); ci++) {
      const q = rngFor(p.seed, ci);
      const x = (ci + q()) * cs;
      if (x < (p.from ?? -Infinity) || x > (p.to ?? Infinity)) continue;
      if (q() < 0.4 + 0.3 * (K.noise1(x / (300 * U)) + 1) / 2) tuft(K, q, x, p.y - q() * p.h, (p.scale ?? 1.25) + q() * 0.6, p.alpha ?? 0.82);
    }
  },
  box: FULL,
});

// --- rocks: a pile of boulders (a kopje) -------------------------------------------------
define('rocks', {
  draw(K, r, p) {
    const { noise1 } = K, s = p.scale, x = p.x, g = p.y;
    const n = p.n ?? 3 + Math.floor(r() * 5), wK = (p.width ?? 55 + r() * 90) * U * s, bs = [];
    for (let i = 0; i < n; i++) { const br = (11 + r() * 24) * U * s; bs.push({ x: x + (r() - 0.5) * wK * 0.8, r: br, y: g - br * (0.35 + r() * 0.35) - (r() < 0.35 ? br * 0.8 : 0) }); }
    bs.sort((a, b) => a.y - b.y);
    for (const b of bs) {
      const pts = [], sd = r() * 400;
      for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU, rr = b.r * (1 + 0.13 * noise1(sd + i * 0.5)); pts.push([b.x + Math.cos(a) * rr * 1.12, Math.min(g + 1, b.y + Math.sin(a) * rr * 0.85)]); }
      const P = pathOf(pts);
      K.erase(P); K.wash(pts, 0.09, r, 2, U * s);
      K.clipped(P, () => {
        K.soft(b.x + b.r * 0.55, b.y + b.r * 0.35, b.r * 0.8, b.r * 0.7, 0.2);
        for (let i = 0; i < 4; i++) { const sx = b.x + b.r * r() * 0.9, sy = b.y - b.r * 0.6 + r() * b.r; K.dry([[sx, sy], [sx + b.r * 0.35, sy + b.r * 0.5]], 3 * U * s, 0.18, r, 3, 0); }
      });
      const start = Math.floor(26 * 0.45), arc = [];
      for (let i = 0; i < 20; i++) arc.push(pts[(start + i) % 26]);
      K.brush(arc, 2.2 * U * s, 0.72, r);
    }
    for (let i = 0; i < 4; i++) tuft(K, r, x + (r() - 0.5) * wK, g + r() * 2 * U * s, s * 0.6, 0.6);
  },
  box: p => [p.x - 110 * U * p.scale, p.y - 75 * U * p.scale, p.x + 110 * U * p.scale, p.y + 5],
});

// --- land: near ground that hides what is behind it (lake shores, foreground hills) ----
define('land', {
  draw(K, r, p, env) {
    const { c, noise1, fbm } = K, st = 6, off = p.offset ?? 5;
    const x0 = Math.max(env.x0, p.from ?? -Infinity), x1 = Math.min(env.x1, p.to ?? Infinity);
    if (x1 <= x0) return;
    const yAt = x => {
      let y = p.y + fbm(x / (p.waveScale ?? 600) + off, 3) * (p.wave ?? 30);
      if (p.bumps) for (const b of p.bumps) { const d = (x - b.x) / b.w; y -= b.h * Math.exp(-d * d); }
      return y;
    };
    const top = [], xs = Math.floor(x0 / st) * st - st;
    for (let x = xs; x <= x1 + st; x += st) top.push([x, yAt(x)]);
    const bottom = p.bottom ?? env.scene.height + 10;
    const poly = top.concat([[x1 + st, bottom], [xs, bottom]]);
    const P = pathOf(poly);
    K.erase(P);
    const gr = c.createLinearGradient(0, p.y - (p.wave ?? 30), 0, bottom);
    gr.addColorStop(0, K.ink(p.alpha ?? 0.12)); gr.addColorStop(0.5, K.ink((p.alpha ?? 0.12) * 0.45)); gr.addColorStop(1, K.ink((p.alpha ?? 0.12) * 0.25));
    c.fillStyle = gr; c.fill(P);
    K.fill(P, p.tint ?? 0.05, K.tint);
    K.clipped(P, () => {
      const n = Math.floor((x1 - x0) / 18);
      for (let i = 0; i < n; i++) {
        const q = rngFor(p.seed, Math.floor((x0 + i * 18) / 18));
        const sx = Math.floor((x0 + i * 18) / 18) * 18 + q() * 18, sy = yAt(sx) + 4 + q() * (bottom - yAt(sx)) * 0.7, len = 20 + q() * 70;
        K.dry([[sx - len / 2, sy], [sx + len / 2, sy + (q() - 0.5) * 3]], 2.2, 0.13, q, 3, -0.05);
      }
    });
    K.brush(top, p.edge ?? 2.4, p.edgeAlpha ?? 0.55, r, () => 0.75, true, K.ink, xs / st);
  },
  box: FULL,
});
