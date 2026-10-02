// Scottish Highlands: bare rounded hills, rain hanging off a cloud, a stone bothy, red deer.
import { define } from './registry.js';
import { qbez, ellipsePts, pathOf } from '../core/geom.js';
import { rngFor } from '../core/rng.js';
import { U, tuft } from './common.js';

// ---------- heather: a loose cluster of small dark dabs ----------
function heatherPatch(K, r, x, y, spread, a, s = 1) {
  for (let k = 0; k < 7; k++) K.soft(x + (r() - 0.5) * spread, y + (r() - 0.5) * spread * 0.22, (6 + r() * 12) * s, (2 + r() * 3.5) * s, a);
}
define('heather', {
  draw: (K, r, p) => heatherPatch(K, r, p.x, p.y, p.width ?? 90, p.alpha ?? 0.22, p.scale),
  box: p => { const w = (p.width ?? 90) * 0.8; return [p.x - w, p.y - 24 * p.scale, p.x + w, p.y + 24 * p.scale]; },
});

// ---------- brae: one long rounded mound of heather and rock ----------
// height(x) = h * (1 - t^2)^1.35 for t = (x - cx) / (w/2), times a slow fbm wave so the crest
// leans and the two flanks never match. The exponent above 1 rounds the crest and lets each
// flank ease out to nothing, instead of the near-straight drop a lower exponent gives.
// The body stops at p.y, so put that on the waterline: anything a brae paints below it
// survives `lake`'s clear and shows up as a block under the reflection.
define('brae', {
  draw(K, r, p) {
    const { c, fbm } = K;
    const w = p.width, h = p.height, A = p.alpha ?? 0.6, off = p.offset ?? 7, base = p.y;
    const prof = xx => {
      const t = (xx - p.x) / (w / 2);
      if (Math.abs(t) >= 1) return 0;
      const dome = Math.pow(1 - t * t, 1.35);
      return h * dome * (0.74 + 0.4 * fbm(off + xx / 420, 2) + 0.05 * fbm(off + 13 + xx / 130, 3));
    };
    const st = 5, top = [];
    for (let xx = p.x - w / 2; xx <= p.x + w / 2; xx += st) top.push([xx, base - prof(xx)]);
    const body = top.concat([[p.x + w / 2, base], [p.x - w / 2, base]]);
    const P = pathOf(body);
    K.erase(P);
    K.wash(body, A * 0.12, r, 3, 2.5);
    // light falls off down the slope: dark along the crest, washed out at the water
    const gr = c.createLinearGradient(0, base - h * 1.05, 0, base);
    gr.addColorStop(0, K.ink(A * 0.54)); gr.addColorStop(1, K.ink(A * 0.02));
    c.fillStyle = gr; c.fill(P);
    K.wash(body, A * 0.1, r, 2, 2, K.tint);
    K.clipped(P, () => {
      // scree: dry streaks running down wherever the flank is steep
      const n = Math.floor(w / 11);
      for (let i = 0; i < n; i++) {
        const xx = p.x + (r() - 0.5) * w * 0.94, y0 = base - prof(xx);
        const slope = Math.abs(prof(xx + 8) - prof(xx - 8)) / 16;
        if (r() > slope * 3) continue;
        const len = h * (0.05 + r() * 0.16), sgn = Math.sign(xx - p.x) || 1;
        const y1 = y0 + (base - y0) * Math.pow(r(), 0.8);
        K.dry(K.wobble([[xx, y1], [xx + sgn * len * 0.14, y1 + len * 0.55], [xx + sgn * len * 0.26, y1 + len]], 1.1, r), 3.5, 0.34 * A, r, 3, -0.05);
      }
      const m = Math.floor(w / 95);
      for (let i = 0; i < m; i++) {
        const cx = p.x + (r() - 0.5) * w * 0.88, y0 = base - prof(cx);
        heatherPatch(K, r, cx, y0 + (base - y0) * Math.pow(r(), 0.6), 30 + r() * 70, 0.2 * A);
      }
    });
    K.brush(top, 1.8, 0.85 * A, r, () => 0.7);
  },
  box: p => [p.x - p.width / 2, p.y - p.height * 1.25, p.x + p.width / 2, p.y + 4],
});

// ---------- rain: a squall of slanted streaks hanging under a cloud base ----------
// Seeded cell by cell along x, so neighbouring render tiles draw the same drops. The fall is
// heaviest at x and thins toward from and to; each streak fades as it nears the ground.
define('rain', {
  draw(K, r, p, env) {
    const A = p.alpha ?? 0.18, cs = 4.5, pad = 80;
    const x0 = Math.max(env.x0 - pad, p.from), x1 = Math.min(env.x1 + pad, p.to);
    const half = Math.max(p.x - p.from, p.to - p.x);
    for (let ci = Math.floor(x0 / cs); ci <= Math.floor(x1 / cs); ci++) {
      const q = rngFor(p.seed, ci), sx = (ci + q()) * cs;
      if (sx < p.from || sx > p.to) continue;
      const dens = Math.cos((Math.PI / 2) * ((sx - p.x) / half));
      if (q() > dens * dens) continue;
      const len = p.h * (0.12 + q() * 0.3), top = p.y + q() * p.h * 0.6, slant = -0.26 - q() * 0.14;
      for (let k = 0; k < 3; k++) {
        const t0 = k / 3, t1 = (k + 1) / 3;
        K.dry([[sx + slant * len * t0, top + len * t0], [sx + slant * len * t1, top + len * t1]], 1, A * (1 - t1 * 0.9), q, 2, -0.1);
      }
    }
  },
  box: p => [p.from, p.y, p.to, p.y + p.h * 1.25],
});

// ---------- shore: a band of pebbles along the water's edge ----------
// Follows the same edge as `land`, so give it that object's y, wave, waveScale, offset and bumps.
define('shore', {
  draw(K, r, p, env) {
    const cs = p.cell ?? 7, pad = 40, h = p.h ?? 18, A = p.alpha ?? 0.3;
    for (let ci = Math.floor((env.x0 - pad) / cs); ci <= Math.floor((env.x1 + pad) / cs); ci++) {
      const q = rngFor(p.seed, ci), x = (ci + q()) * cs;
      let edge = p.y + K.fbm(x / (p.waveScale ?? 600) + (p.offset ?? 5), 3) * (p.wave ?? 0);
      if (p.bumps) for (const b of p.bumps) { const dd = (x - b.x) / b.w; edge -= b.h * Math.exp(-dd * dd); }
      const t = Math.pow(q(), 0.7), rr = 1.1 + q() * 2.4;
      K.dab(x, edge + 2 + t * h, rr, rr * (0.45 + q() * 0.3), A * (1 - 0.55 * t), q() - 0.5);
    }
  },
  box: p => [-Infinity, p.y - (p.wave ?? 0), Infinity, p.y + (p.wave ?? 0) + (p.h ?? 18) + 6],
});

// ---------- bothy: a stone cottage seen three-quarter on ----------
// Oblique projection: the far gable is the near gable shifted by (d*D, -rz), so the ridge and
// the eave stay parallel and both rakes keep one pitch. The roof is that shear as a single
// parallelogram, extended past each gable by `ov`. `facing` turns the building around.
define('bothy', {
  draw(K, r, p) {
    const { brush, dry, dab, wash, erase, wobble } = K, s = p.scale, x = p.x, g = p.y, d = p.facing ?? 1;
    const W = (19 + r() * 3) * U * s, H = W * 0.85, roofH = W * 0.48;
    const D = W * (1.5 + r() * 0.4), rz = D * 0.13, ov = W * 0.12, eo = W * 0.1;
    const eave = g - H, ridge = eave - roofH;
    const x0 = x - d * W / 2, x1 = x + d * W / 2, fx = x1 + d * D;
    const wob = (pts, amt = 0.4) => wobble(pts, amt * U * s, r);
    // a stroke that thins at both ends and stops short of the corner, so edges meet loosely
    const loose = (a, b, w, al) => {
      const f = 0.05 + r() * 0.07;
      const q = t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      brush(wob([q(f), q(0.5), q(1 - f)]), w, al, r, t => Math.sin(Math.PI * (0.1 + 0.8 * t)));
    };
    // roof as one sheared parallelogram: ridge Mn->Mf, eave En->Ef, El the far rake foot
    const ax = d * (D + 2 * ov), ay = -rz * (1 + (2 * ov) / D), lift = (rz * ov) / D, drop = eo * 0.45;
    const Mn = [x - d * ov, ridge + lift], En = [x1 + d * (eo - ov), eave + drop + lift];
    const El = [x0 - d * (eo * 0.5 + ov), eave + drop * 0.5 + lift];
    const Mf = [Mn[0] + ax, Mn[1] + ay], Ef = [En[0] + ax, En[1] + ay];
    erase(pathOf([[x0, g], [x0, eave], El, Mn, Mf, Ef, [fx, eave - rz], [fx, g - rz], [x1, g]]));
    // walls: the long one catches the light, the gable end is in shade
    wash(wob([[x1, g], [x1, eave], [fx, eave - rz], [fx, g - rz]]), 0.1, r, 3, 0.9);
    wash(wob([[x0, g], [x0, eave], [x, ridge], [x1, eave], [x1, g]]), 0.18, r, 3, 0.9);
    for (let i = 0; i < 4; i++) {
      const yy = eave + H * (0.16 + i * 0.22);
      dry(wob([[x0, yy], [x1, yy]], 0.4), 1.2 * U * s, 0.15, r, 2, 0);
      dry(wob([[x1, yy], [fx, yy - rz]], 0.4), 1.1 * U * s, 0.15, r, 2, 0.1);
    }
    // roof: a soft wash with slates dragged down the slope
    wash([Mn, Mf, Ef, En], 0.45, r, 2, 1.1);
    for (let i = 1; i <= 4; i++) {
      const t = i / 5, a = [Mn[0] + ax * t, Mn[1] + ay * t], b = [En[0] + ax * t, En[1] + ay * t];
      dry(wob([a, b], 0.5), 2 * U * s, 0.14, r, 2, 0);
    }
    loose(Mn, Mf, W * 0.05, 0.6);          // ridge
    loose(En, Ef, W * 0.045, 0.6);         // near eave
    loose(Mn, En, W * 0.035, 0.45);        // near rake
    wash([[x0, eave], El, Mn, [x, ridge]], 0.45, r, 2, 0.9);   // the barge over the gable
    loose(Mn, El, W * 0.035, 0.45);        // the rake over the gable
    loose(Mf, Ef, W * 0.03, 0.4);          // far rake
    // chimney on the near gable
    const cw = W * 0.22, cx = x - d * W * 0.04, cTop = ridge - roofH * 0.5;
    wash(wob([[cx - cw / 2, ridge + 2], [cx - cw / 2, cTop], [cx + cw / 2, cTop], [cx + cw / 2, ridge + 2]], 0.25), 0.4, r, 2, 0.6);
    loose([cx - cw * 0.75, cTop], [cx + cw * 0.75, cTop], 1.4 * U * s, 0.5);
    // door and window on the long wall, sheared to the recession
    const pane = (cx2, wd, top, hh) => {
      const f0 = ((cx2 - wd / 2 - x1) * d) / D, f1 = ((cx2 + wd / 2 - x1) * d) / D;
      return pathOf([[cx2 - wd / 2, top - rz * f0], [cx2 + wd / 2, top - rz * f1], [cx2 + wd / 2, top + hh - rz * f1], [cx2 - wd / 2, top + hh - rz * f0]]);
    };
    K.fill(pane(x1 + d * D * 0.27, W * 0.2, eave + H * 0.4, H * 0.6), 0.25, K.accent);
    K.fill(pane(x1 + d * D * 0.66, W * 0.19, eave + H * 0.27, H * 0.26), 0.45);
    // corners and footing, all soft and open
    loose([x0, g], [x0, eave], 0.75 * U * s, 0.4);
    loose([fx, g - rz], [fx, eave - rz], 0.75 * U * s, 0.4);
    loose([x0, g], [x1, g], 0.7 * U * s, 0.38);
    loose([x1, g], [fx, g - rz], 0.7 * U * s, 0.35);
    // a low drystone wall running off the gable end
    const wl = W * (1.8 + r()), wTop = g - H * 0.3;
    brush(wob([[x0, wTop + H * 0.05], [x0 - d * wl * 0.5, wTop - H * 0.02], [x0 - d * wl, wTop + H * 0.09]], 0.6), H * 0.24, 0.3, r, t => 1 - 0.45 * t);
    for (let i = 0; i < 8; i++) {
      const bx = x0 - (d * wl * (i + 0.5)) / 8;
      dab(bx + (r() - 0.5) * 2 * U * s, wTop + H * (0.02 + r() * 0.1), (1 + r() * 1.3) * U * s, (0.7 + r()) * U * s, 0.3);
    }
    for (let i = 0; i < 5; i++) tuft(K, r, x0 + (r() - 0.2) * (D + W), g - r() * rz * 0.6 + r() * 2 * U * s, s * 0.5, 0.55);
  },
  box: p => { const W = 21 * U * p.scale; return [p.x - W * 3.4, p.y - W * 1.9, p.x + W * 3.4, p.y + 4]; },
});

// ---------- red deer ----------
// One antler: the beam, three tines forking forward off it, and a two-point crown.
function antler(K, r, bx, by, d, a, al) {
  const beam = qbez([bx, by], [bx + d * 2.6 * a, by - 6.5 * a], [bx - d * 2.6 * a, by - 11 * a], 8);
  K.brush(beam, 1.7 * a, al, r, t => 1 - 0.5 * t);
  for (const [t, len, fwd] of [[0.15, 4.6, 1.1], [0.45, 4.6, 0.8], [0.72, 4.2, 0.45]]) {
    const q = beam[Math.round(t * (beam.length - 1))];
    K.brush(qbez(q, [q[0] + d * len * 0.55 * a, q[1] - len * 0.35 * a], [q[0] + d * fwd * len * a, q[1] - len * a], 5), 1.2 * a, al, r, u => 1 - 0.75 * u);
  }
  const tip = beam[beam.length - 1];
  K.brush([tip, [tip[0] + d * 1.6 * a, tip[1] - 3.8 * a]], 1.1 * a, al, r, u => 1 - 0.75 * u);
  K.brush([tip, [tip[0] - d * 2 * a, tip[1] - 2.8 * a]], 1.1 * a, al, r, u => 1 - 0.75 * u);
}

// A deer standing still in profile: barrel, raised neck, head, four legs, antlers for the stag.
function deer(K, r, x, g, s, d, antlered) {
  const { brush, dab, erase, noise1 } = K, a = U * s;
  const lg = (10 + r() * 1.5) * a, B = (23 + r() * 3) * a, T = (11 + r() * 1.5) * a, cy = g - lg - T * 0.5;
  const legPath = (fx, tx, w, bend) => brush([[fx, cy + T * 0.1], [(fx + tx) / 2 + bend, (cy + g) / 2], [tx, g]], w, 0, r, t => 1 - 0.55 * t, false);
  // far pair first, fainter; the barrel covers their tops
  K.fill(legPath(x + d * B * 0.32, x + d * B * 0.36, 2.6 * a, -d * 0.4 * a), 0.42);
  K.fill(legPath(x - d * B * 0.32, x - d * B * 0.37, 2.7 * a, d * 1.1 * a), 0.42);
  const body = pathOf(ellipsePts(x, cy, B * 0.5, T * 0.5, -d * 0.08, 22, noise1, r() * 99, 0.05));
  const nb = [x + d * B * 0.34, cy - T * 0.25], nt = [nb[0] + d * 6 * a, nb[1] - 11 * a];
  const neck = brush([nb, [(nb[0] + nt[0]) / 2 + d * a, (nb[1] + nt[1]) / 2], nt], 7 * a, 0, r, t => 1 - 0.58 * t, false);
  const head = brush([[nt[0] - d * 1.2 * a, nt[1] - 1 * a], [nt[0] + d * 5.6 * a, nt[1] + 0.6 * a]], 2.9 * a, 0, r, t => 1 - 0.72 * t, false);
  // every part erased before it is filled, so overlaps keep one even tone
  const trunk = [body, neck, head];
  const parts = trunk.concat([legPath(x + d * B * 0.26, x + d * B * 0.3, 3 * a, -d * 0.5 * a), legPath(x - d * B * 0.32, x - d * B * 0.4, 3.1 * a, d * 1.4 * a)]);
  const all = new Path2D();
  for (const q of trunk) all.addPath(q);
  for (const q of parts) { erase(q); K.fill(q, 0.66); }
  K.clipped(body, () => K.soft(x - d * B * 0.08, cy + T * 0.3, B * 0.42, T * 0.35, 0.16));
  K.outline(all, 0.6 * a, 0.3);
  // ears, eye, tail
  for (const k of [0, 1]) brush(qbez([nt[0] - d * 0.4 * a, nt[1] - 1.2 * a], [nt[0] - d * (0.8 + k * 0.6) * a, nt[1] - 2.8 * a], [nt[0] - d * (1 + k * 1.6) * a, nt[1] - 4 * a], 5), 1.7 * a, 0.72, r, t => 1 - 0.6 * t);
  dab(nt[0] + d * 2 * a, nt[1] - 0.4 * a, 0.5 * a, 0.5 * a, 0.9);
  brush([[x - d * B * 0.48, cy - T * 0.1], [x - d * B * 0.54, cy + T * 0.55]], 1.6 * a, 0.7, r, t => 1 - 0.6 * t);
  if (antlered) {
    const bx = nt[0] + d * 0.4 * a, by = nt[1] - 2 * a;
    antler(K, r, bx - d * 1.3 * a, by + 0.5 * a, d, a, 0.5);
    antler(K, r, bx, by, d, a, 0.85);
  }
}

for (const [name, antlered, k] of [['stag', true, 1], ['hind', false, 0.82]]) {
  define(name, {
    draw(K, r, p) {
      const s = p.scale * k;
      K.soft(p.x, p.y + 0.6 * U * s, 11 * U * s, 1.4 * U * s, 0.07, K.tint);
      deer(K, r, p.x, p.y, s, p.facing ?? 1, antlered);
      if (p.tufts) for (let i = 0; i < p.tufts; i++) tuft(K, r, p.x + (r() - 0.5) * 40 * U * s, p.y + r() * 2, s * 0.5, 0.6);
    },
    box: p => { const s = p.scale * k, w = 28 * U * s; return [p.x - w, p.y - (antlered ? 50 : 36) * U * s, p.x + w, p.y + 4]; },
  });
}
