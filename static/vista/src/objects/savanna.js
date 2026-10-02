// East African savanna: acacia, baobab, termite mound, Kilimanjaro-style volcano, animals.
import { define } from './registry.js';
import { qbez, smooth, ellipsePts, pathOf, TAU } from '../core/geom.js';
import { mulberry32 } from '../core/rng.js';
import { U, tuft } from './common.js';

// ---------- acacia: forked limbs under a flat umbrella crown ----------
function acacia(K, r, x, g, s, big) {
  const { brush, dab, soft, wobble, noise1 } = K;
  const h = (52 + r() * 55) * U * s * (big ? 1.5 : 1), lean = (r() - 0.5) * 0.35 * h;
  const cw = h * (1.5 + r() * 1.2), ct = h * (0.15 + r() * 0.12), cx = x + lean, top = g - h;
  soft(cx + h * 0.12, g + 1.2 * U * s, cw * 0.42, Math.max(1, ct * 0.2), 0.07, K.tint);
  const fork = g - h * (0.28 + r() * 0.3), fx = x + lean * 0.35, tw = (2.6 + r() * 2.2) * U * s * (big ? 1.3 : 1);
  brush(wobble(qbez([x, g + 1], [x + lean * 0.05, (g + fork) / 2], [fx, fork], 9), 0.6 * U * s, r), tw, 0.86, r, t => 1 - 0.35 * t);
  const k = 2 + Math.floor(r() * 3);
  for (let j = 0; j < k; j++) {
    const f = j / (k - 1);
    const tx = cx + (f - 0.5) * cw * 0.7 + (r() - 0.5) * cw * 0.12, ty = top + ct * (0.55 + r() * 0.3);
    const mx = fx + (tx - fx) * (0.35 + r() * 0.3) + (r() - 0.5) * h * 0.12, my = fork + (ty - fork) * (0.55 + r() * 0.2);
    const limb = smooth([[fx, fork], [mx, my], [tx, ty]], false, 5);
    brush(wobble(limb, 0.5 * U * s, r), tw * (0.6 + r() * 0.2), 0.85, r, t => 1 - 0.75 * t);
    const twigs = 1 + Math.floor(r() * 3);
    for (let q = 0; q < twigs; q++) {
      const p = limb[Math.floor(limb.length * (0.45 + r() * 0.5))];
      const ex = p[0] + (r() - 0.5) * cw * 0.25, ey = top + ct * (0.5 + r() * 0.3);
      brush(qbez(p, [(p[0] + ex) / 2 + (r() - 0.5) * 6 * U * s, (p[1] + ey) / 2], [ex, ey], 5), tw * 0.35, 0.8, r, t => 1 - 0.8 * t);
    }
  }
  const tiers = r() < 0.45 ? 2 : 1;
  for (let ti = 0; ti < tiers; ti++) {
    const tcx = ti ? cx + (r() - 0.5) * cw * 0.4 : cx, twd = ti ? cw * (0.45 + r() * 0.2) : cw;
    const tt = ti ? ct * 0.7 : ct, ttop = ti ? top - ct * (0.45 + r() * 0.3) : top;
    const N = Math.min(1400, Math.floor(((twd * tt * 0.7) / (14 * U * U * s * s)) * 2.6)), sd = r() * 500;
    for (let i = 0; i < N; i++) {
      const t = r() * 2 - 1, e = Math.sqrt(Math.max(0, 1 - t * t)), px = tcx + t * twd * 0.5;
      if (noise1(sd + px / (9 * U * s)) < -0.45 && r() < 0.8) continue;
      const tY = ttop + (1 - Math.pow(e, 0.6)) * tt * 0.55 + noise1(sd + 40 + px / (14 * U * s)) * tt * 0.12;
      const bY = ttop + tt * (0.3 + 0.7 * Math.pow(e, 0.7)), q = Math.pow(r(), 0.75), py = tY + (bY - tY) * q;
      const rx = (1.3 + r() * 2.6) * U * s;
      dab(px, py, rx, rx * (0.45 + r() * 0.2), 0.06 + 0.15 * q, (r() - 0.5) * 0.4);
    }
    const M = Math.floor(twd / (2.2 * U * s));
    for (let i = 0; i < M; i++) {
      const t = r() * 1.9 - 0.95, e = Math.sqrt(1 - t * t), px = tcx + t * twd * 0.5;
      dab(px, ttop + tt * (0.3 + 0.7 * Math.pow(e, 0.7)) - r() * tt * 0.15, (1 + r() * 2) * U * s, (0.5 + r()) * U * s, 0.18 + r() * 0.14);
    }
  }
}
define('acacia', {
  draw: (K, r, p) => { acacia(K, r, p.x, p.y, p.scale, p.big); if (p.tufts) for (let i = 0; i < p.tufts; i++) tuft(K, r, p.x + (r() - 0.5) * 40 * U * p.scale, p.y + r() * 2 * U * p.scale, p.scale * 0.7, 0.55); },
  box: p => { const h = 107 * U * p.scale * (p.big ? 1.5 : 1); return [p.x - h * 1.5, p.y - h * 1.35, p.x + h * 1.5, p.y + 4]; },
});

// ---------- baobab: bottle trunk, bare crooked crown ----------
define('baobab', {
  draw(K, r, p) {
    const { brush, dry, dab, soft, wash, erase, noise1 } = K, x = p.x, g = p.y, s = p.scale;
    const h = (78 + r() * 60) * U * s, bw = h * (0.32 + r() * 0.14), tw = bw * (0.5 + r() * 0.2), tT = g - h * (0.58 + r() * 0.08), bul = bw * (0.1 + r() * 0.08);
    const L = [], R = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, half = (bw / 2) * (1 - t) + (tw / 2) * t + bul * Math.sin(Math.PI * t) * (1 - t * 0.5), y = g + (tT - g) * t;
      L.push([x - half + noise1(i * 0.7 + x) * U * s, y]); R.push([x + half + noise1(i * 0.7 + x + 9) * U * s, y]);
    }
    const body = L.concat(R.slice().reverse()), P = pathOf(body);
    erase(P); wash(body, 0.17, r, 3, 1.5 * U * s); wash(body, 0.05, r, 2, 1.5 * U * s, K.tint);
    K.clipped(P, () => {
      soft(x + bw * 0.3, (g + tT) / 2, bw * 0.35, h * 0.35, 0.18);
      for (let i = 0; i < 7; i++) { const ox = x + (r() - 0.5) * bw * 0.8; dry(K.wobble([[ox, g], [ox + (r() - 0.5) * 4 * U * s, (g + tT) / 2], [ox + (r() - 0.5) * tw * 0.3, tT]], 1.2 * U * s, r), 2 * U * s, 0.2, r, 3, 0.1); }
    });
    brush(L, 2.4 * U * s, 0.75, r, t => 0.6 + 0.4 * Math.sin(Math.PI * t));
    brush(R, 3.2 * U * s, 0.8, r, t => 0.6 + 0.4 * Math.sin(Math.PI * t));
    const k = 5 + Math.floor(r() * 5);
    for (let j = 0; j < k; j++) {
      const f = j / (k - 1), sx = x + (f - 0.5) * tw * 0.9, len = h * (0.14 + r() * 0.22);
      let a = (f - 0.5) * 2.2 + (r() - 0.5) * 0.4, px = sx, py = tT;
      const pts = [[sx, tT + 2 * U * s]];
      for (let q = 0; q < 3; q++) { a += (r() - 0.5) * 0.7; px += (Math.sin(a) * len) / 3; py -= (Math.cos(a) * len) / 3; pts.push([px, py]); }
      brush(pts, (3 + r() * 2) * U * s, 0.85, r, t => 1 - 0.8 * t);
      if (r() < 0.8) { const q = pts[2], a2 = a + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.5); brush([q, [q[0] + Math.sin(a2) * len * 0.35, q[1] - Math.cos(a2) * len * 0.35]], 1.6 * U * s, 0.8, r, t => 1 - 0.85 * t); }
      for (let q = 0; q < 4; q++) dab(px + (r() - 0.5) * 6 * U * s, py + (r() - 0.5) * 4 * U * s, (1 + r() * 1.5) * U * s, (0.6 + r()) * U * s, 0.12 + r() * 0.1);
    }
  },
  box: p => [p.x - 80 * U * p.scale, p.y - 150 * U * p.scale, p.x + 80 * U * p.scale, p.y + 4],
});

// ---------- termite mound ----------
define('termite', {
  draw(K, r, p) {
    const x = p.x, g = p.y, s = p.scale, h = (18 + r() * 28) * U * s, bw = h * (0.75 + r() * 0.25), side = r() < 0.5 ? -1 : 1, j = () => (r() - 0.5) * bw * 0.04;
    // a wide earthen dome with one tall chimney spire and a shorter one beside it
    let pts = [[x - bw / 2, g + 1], [x - bw * 0.36 + j(), g - h * 0.28], [x - bw * 0.18 + j(), g - h * 0.5], [x - bw * 0.09, g - h * 0.92], [x - bw * 0.02, g - h], [x + bw * 0.06, g - h * 0.9],
      [x + bw * 0.14 + j(), g - h * 0.55], [x + bw * 0.24, g - h * (0.6 + r() * 0.12)], [x + bw * 0.31, g - h * 0.58], [x + bw * 0.36 + j(), g - h * 0.32], [x + bw / 2, g + 1]];
    if (side < 0) pts = pts.map(([px, py]) => [2 * x - px, py]).reverse();
    const sm = smooth(pts, false, 4);
    K.erase(pathOf(sm)); K.wash(sm, 0.12, r, 2, U * s); K.wash(sm, 0.06, r, 2, U * s, K.tint);
    K.brush(sm, 1.8 * U * s, 0.7, r);
    for (let i = 0; i < 3; i++) { const sx = x + (r() - 0.2) * bw * 0.4; K.dry([[sx, g], [sx - 2 * U * s, g - h * 0.6]], 2 * U * s, 0.2, r, 2, 0); }
  },
  box: p => [p.x - 25 * U * p.scale, p.y - 50 * U * p.scale, p.x + 25 * U * p.scale, p.y + 3],
});

// ---------- volcano: flat summit, a side peak (Mawenzi), snowline, ravines ----------
define('volcano', {
  draw(K, r, p, env) {
    const { noise1, fbm } = K, x = p.x, w = p.width, hg = p.height, base = p.y, side = p.side ?? (r() < 0.5 ? -1 : 1), sd = r() * 99;
    const prof = t => {
      const f = Math.abs(t);
      let y = f < 0.16 ? 1 - 0.025 * (noise1(sd + t * 20) + 1) : Math.pow(1 - (f - 0.16) / 0.84, 1.55);
      const m = t * side - 0.42; y += 0.26 * Math.exp((-m * m) / 0.006) * (1 - f);
      return Math.max(0, y + 0.025 * fbm(sd + t * 14, 3) * (1 - f));
    };
    const top = [];
    for (let i = 0; i <= 90; i++) { const t = i / 45 - 1; top.push([x + (t * w) / 2, base - hg * prof(t)]); }
    const foot = [[x + w / 2, base + 20], [x - w / 2, base + 20]];
    K.erase(pathOf(top.concat(foot))); K.wash(top.concat(foot), p.alpha ?? 0.1, r, 3, 2.5);
    const low = top.map(q => [q[0], q[1] + hg * (0.22 + 0.05 * noise1(q[0] / 25))]);
    K.wash(low.concat(foot), (p.alpha ?? 0.1) * 0.9, r, 3, 2.5);
    for (let i = 0; i < 40; i++) { const q = top[Math.floor(r() * top.length)], L = hg * (0.08 + r() * 0.2); K.dry([[q[0], q[1] + 2.5], [q[0] + (r() - 0.5) * 7.5, q[1] + L]], 2.5, 0.12, r, 2, 0); }
    K.brush(top.filter((_, i) => i % 2 === 0), 1.5, 0.32, r, t => 0.5 + 0.5 * Math.sin(Math.PI * t));
  },
  box: p => [p.x - p.width / 2, p.y - p.height * 1.1, p.x + p.width / 2, p.y + 20],
});

// ---------- animals ----------
// Walk cycle. While GAIT is set, each leg drawn swings with its own phase: legs are drawn
// far-front, far-back, near-front, near-back, and diagonal pairs move together.
let GAIT = null;
function gaitShift() {
  if (!GAIT) return [0, 0, 0];
  const ph = GAIT.phase + [0, Math.PI, Math.PI, 0][GAIT.i++ % 4];
  return [Math.sin(ph) * GAIT.amp, -Math.max(0, Math.cos(ph)) * GAIT.amp * 0.3, Math.cos(ph) * GAIT.amp * 0.4];
}
function leg(K, r, x0, y0, x1, y1, w, a, knee = 0) {
  const [dx, dy, dk] = gaitShift();
  x1 += dx; y1 += dy; knee += dk;
  K.brush([[x0, y0], [(x0 + x1) / 2 + knee, (y0 + y1) / 2], [x1, y1]], w, a, r, t => 1 - 0.35 * t);
}

function giraffe(K, r, x, g, s, d) {
  const { c, brush, dab, erase, noise1 } = K, a = U * s;
  const L = (30 + r() * 6) * a, B = (21 + r() * 5) * a, T = (10 + r() * 2) * a;
  const hx = x - d * B * 0.5, hy = g - L * 0.97, sx = x + d * B * 0.5, sy = g - L * 1.14;
  const ang = Math.atan2(sy - hy, sx - hx), bx = (hx + sx) / 2, by = (hy + sy) / 2 + T * 0.1;
  const bp = ellipsePts(bx, by, B * 0.62, T * 0.5, ang, 22, noise1, r() * 99, 0.05);
  leg(K, r, sx - d * 3 * a, sy + T * 0.2, sx - d * 4 * a + d * r() * 3 * a, g, 1.5 * a, 0.5);
  leg(K, r, hx + d * 4 * a, hy + T * 0.2, hx + d * 2 * a, g, 1.6 * a, 0.5, -d * a);
  const graze = r() < 0.18, th = graze ? 1.9 + r() * 0.3 : 0.2 + r() * 0.45, N = (30 + r() * 12) * a;
  const nb = [sx - d * a, sy + 2 * a], nt = [nb[0] + d * Math.sin(th) * N, nb[1] - Math.cos(th) * N];
  const neck = brush([nb, [(nb[0] + nt[0]) / 2, (nb[1] + nt[1]) / 2], nt], 8.5 * a, 0, r, t => 1 - 0.6 * t, false);
  const bodyP = pathOf(bp);
  erase(bodyP); erase(neck);
  c.fillStyle = K.ink(0.32); c.fill(bodyP); c.fill(neck);
  if (a > 0.55) {
    K.clipped(bodyP, () => { const st = 3.6 * a; for (let yy = by - T; yy < by + T; yy += st) for (let xx = bx - B; xx < bx + B; xx += st) dab(xx + (r() - 0.5) * a, yy + (r() - 0.5) * a, st * 0.38, st * 0.32, 0.5, r()); });
    K.clipped(neck, () => { for (let q = 0; q < 9; q++) { const t = q / 9; dab(nb[0] + (nt[0] - nb[0]) * t + (r() - 0.5) * a, nb[1] + (nt[1] - nb[1]) * t, 2.4 * a * (1 - t * 0.5), 1.6 * a, 0.5, th); } });
  }
  K.outline(bodyP, 0.8 * a, 0.7);
  const hr = d > 0 ? (graze ? 1.3 : 0.55) : graze ? Math.PI - 1.3 : Math.PI - 0.55;
  const hd = pathOf(ellipsePts(nt[0] + d * 3 * a, nt[1] + (graze ? 2 : 1.5) * a, 4.6 * a, 1.9 * a, hr, 14));
  erase(hd); K.fill(hd, 0.7);
  brush([[nt[0] - d * 0.5 * a, nt[1] - a], [nt[0] - d * 1.2 * a, nt[1] - 4 * a]], a, 0.85, r, () => 1);
  brush([[nt[0] + d * 0.6 * a, nt[1] - a], [nt[0] + d * 0.3 * a, nt[1] - 4 * a]], a, 0.85, r, () => 1);
  leg(K, r, sx - d * 6 * a, sy + T * 0.25, sx - d * 7 * a + d * r() * 2 * a, g + 0.5 * a, 1.6 * a, 0.85, d * a * 0.5);
  leg(K, r, hx + d * a, hy + T * 0.25, hx - d * a, g + 0.5 * a, 1.8 * a, 0.85, -d * a);
  brush(qbez([hx - d * B * 0.08, hy], [hx - d * 3 * a, hy + 6 * a], [hx - d * 3.5 * a, hy + 13 * a]), 0.8 * a, 0.7, r, () => 1);
  dab(hx - d * 3.5 * a, hy + 14 * a, 0.9 * a, 1.8 * a, 0.75);
}

function eleg(K, r, x0, y0, x1, y1, w, a) {
  const P = K.brush([[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2], [x1, y1]], w, 0, r, t => 0.95 + 0.12 * t, false);
  K.erase(P); K.fill(P, a); K.outline(P, w * 0.1, 0.6);
  K.brush([[x1 - w * 0.45, y1 - w * 0.12], [x1 + w * 0.45, y1 - w * 0.12]], w * 0.12, 0.5, r, () => 1);
}
function elephant(K, r, x, g, s, d) {
  const { brush, dry, dab, soft, erase } = K, a = U * s;
  const leg = (K2, r2, x0, y0, x1, y1, w, al) => { const [dx, dy] = gaitShift(); eleg(K2, r2, x0, y0, x1 + dx, y1 + dy, w, al * 0.62); };
  const BL = (42 + r() * 8) * a, BH = (24 + r() * 4) * a, lg = (17 + r() * 3) * a, by = g - lg, X = f => x + d * f * BL;
  // legs first; the body covers their tops
  leg(K, r, X(0.24), by - 8 * a, X(0.25), g, 6.5 * a, 0.5); leg(K, r, X(-0.27), by - 8 * a, X(-0.29), g, 6.5 * a, 0.5);
  leg(K, r, X(0.33), by - 8 * a, X(0.34), g + 0.5 * a, 7 * a, 0.6); leg(K, r, X(-0.19), by - 8 * a, X(-0.21), g + 0.5 * a, 7 * a, 0.6);
  const bodyPts = smooth([[X(-0.5), by - BH * 0.4], [X(-0.38), by - BH * 0.88], [X(0.1), by - BH], [X(0.4), by - BH * 0.82], [X(0.47), by - BH * 0.35], [X(0.3), by - a], [X(-0.05), by + a], [X(-0.4), by - 0.5 * a], [X(-0.53), by - BH * 0.15]], true, 6);
  const P = pathOf(bodyPts);
  erase(P); K.fill(P, 0.38);
  K.clipped(P, () => { soft(X(-0.1), by, BL * 0.45, BH * 0.35, 0.2); for (let i = 0; i < 6; i++) { const xx = X(-0.4 + r() * 0.8); dry([[xx, by - BH], [xx + (r() - 0.5) * 4 * a, by]], 2 * a, 0.14, r, 2, 0); } });
  K.outline(P, 0.9 * a, 0.65);
  const head = pathOf(ellipsePts(X(0.52), by - BH * 0.68, 9 * a, 10 * a, 0, 18));
  erase(head); K.fill(head, 0.42);
  const ear = pathOf(smooth([[X(0.42), by - BH * 0.95], [X(0.3), by - BH * 0.85], [X(0.28), by - BH * 0.35], [X(0.4), by - BH * 0.2], [X(0.47), by - BH * 0.45]], true, 5));
  erase(ear); K.fill(ear, 0.3); K.outline(ear, 1.1 * a, 0.75);
  const tipX = X(0.66 + r() * 0.08);
  brush(smooth([[X(0.6), by - BH * 0.5], [X(0.66), by - BH * 0.15], [tipX, g - 6 * a], [tipX - d * 2 * a, g - 2 * a]], false, 4), 5.5 * a, 0.55, r, t => 1 - 0.65 * t);
  const tusk = brush(qbez([X(0.56), by - BH * 0.32], [X(0.64), by - BH * 0.12], [X(0.7), by - BH * 0.2]), 2 * a, 0, r, t => 1 - 0.7 * t, false);
  erase(tusk);
  dab(X(0.55), by - BH * 0.78, 0.8 * a, 0.8 * a, 0.85);
  brush(qbez([X(-0.5), by - BH * 0.4], [X(-0.56), by - BH * 0.1], [X(-0.54), by + 3 * a]), 0.8 * a, 0.7, r, () => 1);
}

function zebra(K, r, x, g, s, d) {
  const { c, brush, erase, noise1 } = K, a = U * s;
  const lg = (15 + r() * 2) * a, B = (25 + r() * 3) * a, T = (11 + r() * 2) * a, cy = g - lg - T * 0.42;
  leg(K, r, x + d * B * 0.32, cy + T * 0.2, x + d * B * 0.36, g, 2.2 * a, 0.55); leg(K, r, x - d * B * 0.3, cy + T * 0.2, x - d * B * 0.36, g, 2.4 * a, 0.55, -d * a);
  const graze = r() < 0.35;
  const body = ellipsePts(x, cy, B * 0.5, T * 0.5, 0, 22, noise1, r() * 9, 0.04);
  const nb = [x + d * B * 0.38, cy - T * 0.15], nt = graze ? [nb[0] + d * 9 * a, nb[1] + 8 * a] : [nb[0] + d * 7 * a, nb[1] - 11 * a];
  const neck = brush([nb, nt], 8 * a, 0, r, t => 1 - 0.35 * t, false);
  const hEnd = graze ? [nt[0] + d * 4 * a, g - a] : [nt[0] + d * 9 * a, nt[1] + 7 * a];
  const head = brush([nt, hEnd], 5 * a, 0, r, t => 1 - 0.45 * t, false);
  const all = new Path2D(); all.addPath(pathOf(body)); all.addPath(neck); all.addPath(head);
  erase(all); K.fill(all, 0.08);
  K.clipped(all, () => {
    c.strokeStyle = K.ink(0.82); c.lineWidth = 1.05 * a;
    for (let k = -14; k <= 14; k++) {
      const sx = x + k * 2.3 * a; c.beginPath();
      for (let yy = cy - T * 1.8; yy < cy + T; yy += a) { const xx = sx + Math.sin(yy / (4 * a) + k) * 1.1 * a + (yy - cy) * 0.12 * d; yy === cy - T * 1.8 ? c.moveTo(xx, yy) : c.lineTo(xx, yy); }
      c.stroke();
    }
  });
  K.outline(all, 0.7 * a, 0.65);
  for (let q = 0; q < 6; q++) { const t = q / 6; brush([[nb[0] + (nt[0] - nb[0]) * t - d * 2 * a, nb[1] + (nt[1] - nb[1]) * t - 2 * a], [nb[0] + (nt[0] - nb[0]) * t - d * 3 * a, nb[1] + (nt[1] - nb[1]) * t - 4 * a]], 1.1 * a, 0.8, r, () => 1); }
  leg(K, r, x + d * B * 0.25, cy + T * 0.25, x + d * B * 0.28, g + 0.5 * a, 2.4 * a, 0.8); leg(K, r, x - d * B * 0.38, cy + T * 0.25, x - d * B * 0.32, g + 0.5 * a, 2.6 * a, 0.8, -d * a);
  brush(qbez([x - d * B * 0.5, cy - T * 0.2], [x - d * B * 0.58, cy + T * 0.2], [x - d * B * 0.56, cy + T * 0.9]), 0.8 * a, 0.75, r, () => 1);
}

function wildebeest(K, r, x, g, s, d) {
  const { brush, erase } = K, a = U * s, lg = 9 * a, by = g - lg;
  leg(K, r, x + d * 5 * a, by - a, x + d * 6 * a, g, 1.2 * a, 0.6); leg(K, r, x - d * 5 * a, by - a, x - d * 6 * a, g, 1.2 * a, 0.6);
  const P = pathOf(smooth([[x - d * 8 * a, by - 5 * a], [x + d * 2 * a, by - 9.5 * a], [x + d * 8 * a, by - 7 * a], [x + d * 7 * a, by], [x - d * 7 * a, by + 0.5 * a]], true, 4));
  erase(P); K.fill(P, 0.62);
  const graze = r() < 0.4, hs = [x + d * 8 * a, by - 7 * a], he = graze ? [x + d * 12 * a, g - 1.5 * a] : [x + d * 13 * a, by - 4 * a];
  brush([hs, he], 4 * a, 0.7, r, t => 1 - 0.4 * t);
  brush(qbez([hs[0], hs[1] - a], [hs[0] + d * a, hs[1] - 4 * a], [hs[0] + d * 3 * a, hs[1] - 3.2 * a]), 0.9 * a, 0.8, r, () => 1);
  leg(K, r, x + d * 4 * a, by, x + d * 3.5 * a, g + 0.4 * a, 1.3 * a, 0.8); leg(K, r, x - d * 6 * a, by, x - d * 5 * a, g + 0.4 * a, 1.3 * a, 0.8);
  brush([[x - d * 8 * a, by - 5 * a], [x - d * 9.5 * a, by + 2 * a]], 0.8 * a, 0.7, r, () => 1);
}

const SPECIES = { giraffe: [giraffe, 30], elephant: [elephant, 58], zebra: [zebra, 32], wildebeest: [wildebeest, 19] };
const STRIDE = { giraffe: 4, elephant: 3, zebra: 3, wildebeest: 2.6 }; // foot swing, in body units

// One animal, placed by hand.
for (const [name, [fn, sp]] of Object.entries(SPECIES)) {
  define(name, {
    draw: (K, r, p) => { K.soft(p.x, p.y + 0.6 * U * p.scale, sp * 0.35 * U * p.scale, 1.3 * U * p.scale, 0.06, K.tint); fn(K, r, p.x, p.y, p.scale, p.facing ?? 1); },
    box: p => [p.x - sp * 0.8 * U * p.scale, p.y - 75 * U * p.scale, p.x + sp * 0.8 * U * p.scale, p.y + 3],
  });
}

// A herd: n animals of one kind scattered around (x, y), mostly facing the same way.
define('herd', {
  draw(K, r, p) {
    // draw the coin even when facing is given, so a walking herd keeps its curated layout
    const coin = r(), [fn, sp] = SPECIES[p.kind], dir = p.facing ?? (coin < 0.5 ? -1 : 1), list = [];
    const spread = p.n * sp * U * p.scale * (p.kind === 'wildebeest' ? 0.55 : 0.95);
    const walking = p.step != null;
    for (let i = 0; i < p.n; i++) { const pt = { x: p.x + (r() - 0.5) * spread, y: p.y + r() * (p.band ?? 10), k: 0.88 + r() * 0.24, d: r() < 0.85 || walking ? dir : -dir, sd: (r() * 1e9) | 0 }; list.push(pt); }
    list.sort((a, b) => a.y - b.y);
    for (const m of list) {
      const ss = p.scale * m.k * (1 + (m.y - p.y) / 500 * 0.8);
      K.soft(m.x, m.y + 0.6 * U * ss, sp * 0.35 * U * ss, 1.3 * U * ss, 0.06, K.tint);
      if (walking) GAIT = { phase: p.step + (m.sd % 628) / 100, amp: STRIDE[p.kind] * U * ss, i: 0 };
      fn(K, mulberry32(m.sd), m.x, m.y, ss, m.d);
      GAIT = null;
    }
  },
  box: p => {
    const sp = SPECIES[p.kind][1], half = (p.n * sp * U * p.scale * (p.kind === 'wildebeest' ? 0.55 : 0.95)) / 2 + sp * U * p.scale;
    return [p.x - half, p.y - 75 * U * p.scale, p.x + half, p.y + (p.band ?? 10) + 3];
  },
});
