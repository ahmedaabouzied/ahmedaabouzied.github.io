// Sahara erg: long dune crests at low sun, a camel caravan, one date-palm oasis.
import { define } from './registry.js';
import { qbez, smooth, ellipsePts, pathOf, clamp } from '../core/geom.js';
import { mulberry32, rngFor } from '../core/rng.js';
import { U, tuft } from './common.js';

// ---------- dune: a long convex windward slope, a sharp crest, a short steep slip face ----------
// s runs -1 at the windward foot to 1 at the slip foot and the faces break at s = KINK, which
// puts about two thirds of the width on the lit side. The crest rides a slow S plus a little fbm,
// so the break snakes across the panorama instead of ruling straight; both faces carry the
// displacement, and it dies at the feet so the dune stays anchored.
const KINK = 0.25;

function duneHeight(K, p) {
  const lean = p.lean ?? 1, off = p.offset ?? 0, W = p.width, H = p.height, half = W / 2;
  const amp = Math.min(0.08 * W, 0.55 * H);
  return xx => {
    const t = (xx - p.x) / half, s = t * lean;
    if (s <= -1 || s >= 1) return 0;
    const d = s < KINK ? (KINK - s) / (1 + KINK) : (s - KINK) / (1 - KINK);
    const h = Math.pow(1 - d, s < KINK ? 0.6 : 1.9);
    const snake = 0.65 * Math.sin(t * Math.PI * 0.85 + off) + 0.35 * K.fbm(off * 1.7 + xx / (W / 3), 2);
    return Math.max(0, h * (H + snake * amp));
  };
}

define('dune', {
  draw(K, r, p, env) {
    const { c } = K, A = p.alpha ?? 0.7, lean = p.lean ?? 1, base = p.y, H = p.height;
    const hAt = duneHeight(K, p);
    const left = Math.max(env.x0 - 8, p.x - p.width / 2), right = Math.min(env.x1 + 8, p.x + p.width / 2);
    if (right - left < 4) return;
    const st = 4, xs = Math.floor(left / st) * st, xe = Math.ceil(right / st) * st, top = [];
    for (let xx = xs; xx <= xe; xx += st) top.push([xx, base - hAt(xx)]);
    const bodyP = pathOf(top.concat([[xe, base], [xs, base]]));
    K.erase(bodyP);

    // The slip face carries a band of ink, darkest under the crest and still there at the foot;
    // the lit face keeps the paper. Every coordinate below is absolute, so a viewer tile
    // boundary cuts the fills without a seam.
    const xk = p.x + lean * KINK * (p.width / 2), xf = p.x + lean * (p.width / 2);
    const hk = hAt(xk), run = xf - xk, L = Math.hypot(run, hk), fall = (hk * Math.abs(run)) / L;
    const nx = ((run > 0 ? -hk : hk) / L) * fall, ny = (Math.abs(run) / L) * fall;
    const ay = base - hk;
    const gi = c.createLinearGradient(xk, ay, xk + nx, ay + ny);
    gi.addColorStop(0, K.ink(A * 0.52)); gi.addColorStop(0.25, K.ink(A * 0.42));
    gi.addColorStop(0.65, K.ink(A * 0.24)); gi.addColorStop(0.92, K.ink(A * 0.12)); gi.addColorStop(1, K.ink(0));
    c.fillStyle = gi; c.fill(bodyP);
    const gt = c.createLinearGradient(xk, ay, xk + nx * 0.8, ay + ny * 0.8);
    gt.addColorStop(0, K.tint(A * 0.22)); gt.addColorStop(1, K.tint(0));
    c.fillStyle = gt; c.fill(bodyP);
    // wipe it off the lit side: the break stays soft, but it is a break
    const ge = c.createLinearGradient(xk - lean * Math.abs(run) * 0.02, 0, xk + lean * Math.abs(run) * 0.07, 0);
    ge.addColorStop(0, 'rgba(0,0,0,1)'); ge.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = ge; c.fill(bodyP); c.restore();
    const gl = c.createLinearGradient(0, base - H * 0.5, 0, base);
    gl.addColorStop(0, K.tint(0)); gl.addColorStop(0.82, K.tint(A * 0.034)); gl.addColorStop(1, K.tint(0));
    c.fillStyle = gl; c.fill(bodyP);

    // wind ripples: dry lines parallel to the crest, bowing with it, one per cell. The cell is
    // seeded by its index so neighbouring tiles draw the same marks, and narrows on the big
    // near dunes, so the sand gets finer-grained as it comes toward the viewer.
    const pad = p.width * 0.08, cellW = clamp(1900 / H, 6, 46);
    const ripples = (xa, xb, cell, lo, hi, a, w, thr) => {
      const c0 = Math.max(xa, env.x0 - pad), c1 = Math.min(xb, env.x1 + pad);
      for (let ci = Math.floor(c0 / cell); ci <= Math.ceil(c1 / cell); ci++) {
        const q = rngFor(p.seed, Math.round(cell), ci), cx = (ci + q()) * cell;
        if (cx < xa || cx > xb) continue;
        const hc = hAt(cx);
        if (hc < H * 0.12) continue;
        const wide = p.width * (0.02 + q() * 0.055), drop = hc * (lo + q() * (hi - lo)), pts = [];
        for (let k = 0; k <= 8; k++) { const xx = cx - wide + (2 * wide * k) / 8; pts.push([xx, Math.min(base - 1, base - hAt(xx) + drop)]); }
        K.dry(pts, w, a * (0.6 + 0.6 * q()), q, 3, thr);
      }
    };
    const foot = p.x - lean * (p.width / 2);
    ripples(Math.min(xk, foot), Math.max(xk, foot), cellW, 0.08, 0.94, A * 0.15, 1.6, 0.15);
    ripples(Math.min(xk, xf), Math.max(xk, xf), cellW * 2.2, 0.12, 0.8, A * 0.11, 1.8, 0.05);

    // the crest itself: one crisp line, fading out where the dune runs into the sand
    const hN = top.map(q => (base - q[1]) / H);
    K.brush(top, clamp(H / 150, 0.7, 2.2), Math.min(0.95, A * 0.95), r,
      t => Math.pow(clamp(hN[Math.round(t * (hN.length - 1))], 0, 1), 0.7), true, K.ink, xs / st);

    // sand blowing downwind off the highest point of the crest
    let px = xk, ph = hk;
    for (let xx = p.x - p.width / 2; xx <= p.x + p.width / 2; xx += p.width / 80) { const v = hAt(xx); if (v > ph) { ph = v; px = xx; } }
    for (let i = 2 + Math.floor(r() * 2); i > 0; i--) {
      const bx = px + (r() - 0.5) * p.width * 0.06;
      const by = base - hAt(bx), len = ph * (0.18 + r() * 0.3);
      K.dry([[bx, by], [bx + lean * len * 0.7, by - len * 0.3], [bx + lean * len * 1.6, by - len * 0.42]], 2.2, A * 0.14, r, 3, 0.1);
    }
  },
  box: p => [p.x - p.width / 2, p.y - p.height * 1.8, p.x + p.width / 2, p.y + 4],
});

// ---------- camel: dromedary in profile, with a rider and a lead rope ----------
function cleg(K, r, x0, y0, x1, y1, w, a, knee) {
  K.brush([[x0, y0], [(x0 + x1) / 2 + knee, (y0 + y1) / 2], [x1, y1]], w, a, r, t => 1 - 0.4 * t);
}

function camel(K, r, x, g, s, d, rider, phase) {
  const { brush, dab, erase } = K, a = U * s;
  const B = (30 + r() * 3) * a, T = (8 + r()) * a, lg = (17 + r() * 2) * a;
  const cy = g - lg - T * 0.5, X = f => x + d * f * B, Y = v => cy + v * T;
  // diagonal pairs swing together, as in the savanna walk cycle
  const sw = i => (phase == null ? 0 : Math.sin(phase + [0, Math.PI, Math.PI, 0][i]) * 3 * a);
  cleg(K, r, X(0.26), Y(0.3), X(0.26) + sw(0), g, 2 * a, 0.55, d * 1.8 * a);
  cleg(K, r, X(-0.28), Y(0.3), X(-0.28) + sw(1), g, 2.1 * a, 0.55, -d * 2 * a);

  // barrel, hump, neck and head are each a tapered stroke over wobbled points, as in giraffe
  const barrel = brush(K.wobble(smooth([[X(-0.46), Y(-0.3)], [X(0.0), Y(-0.42)], [X(0.46), Y(-0.3)]], false, 5), 0.5 * a, r),
    T * 1.5, 0, r, t => 0.72 + 0.28 * Math.sin(Math.PI * t), false);
  const hump = brush(K.wobble(smooth([[X(-0.22), Y(-0.78)], [X(0.0), Y(-1.5)], [X(0.22), Y(-0.78)]], false, 5), 0.4 * a, r),
    T * 0.85, 0, r, t => 0.35 + 0.8 * Math.sin(Math.PI * t), false);
  const nb = [X(0.4), Y(-0.4)], nt = [X(0.72), cy - T * 2.8];
  const neck = brush(K.wobble(smooth([nb, [X(0.7), cy - T * 1.6], nt], false, 5), 0.35 * a, r), 4.4 * a, 0, r, t => 1 - 0.65 * t, false);
  const he = [nt[0] + d * 6 * a, nt[1] + 2.4 * a];
  const head = brush([nt, [nt[0] + d * 3.5 * a, nt[1] - 0.7 * a], he], 2.4 * a, 0, r, t => 1 - 0.35 * t, false);
  // erase and fill each piece on its own: unioning them would cancel where the windings disagree
  for (const P of [barrel, hump, neck, head]) { erase(P); K.fill(P, 0.82); }
  brush([[nt[0] - d * 0.8 * a, nt[1] - a], [nt[0] - d * 1.6 * a, nt[1] - 3 * a]], 0.9 * a, 0.82, r, () => 1);

  if (rider) {
    const rx = X(-0.08), ry = Y(-1.2);
    const torso = brush(K.wobble([[rx, ry], [rx + d * 0.8 * a, ry - 4 * a], [rx + d * 1.8 * a, ry - 7.5 * a]], 0.3 * a, r),
      5.4 * a, 0, r, t => 1 - 0.3 * t, false);
    erase(torso); K.fill(torso, 0.84);
    dab(rx + d * 2.2 * a, ry - 9.8 * a, 2.8 * a, 2.6 * a, 0.86);            // head wrap
    brush([[rx + d * 0.6 * a, ry - 9.6 * a], [rx - d * 3.4 * a, ry - 7.6 * a]], 1.5 * a, 0.6, r, t => 1 - 0.8 * t);
  }
  cleg(K, r, X(0.2), Y(0.35), X(0.2) + sw(2), g + 0.4 * a, 2.3 * a, 0.85, d * 2 * a);
  cleg(K, r, X(-0.34), Y(0.35), X(-0.34) + sw(3), g + 0.4 * a, 2.4 * a, 0.85, -d * 2.2 * a);
  brush(qbez([X(-0.48), Y(-0.5)], [X(-0.58), Y(0.2)], [X(-0.56), Y(1.3)]), 0.9 * a, 0.7, r, () => 1);
  brush(qbez(he, [he[0] + d * 8 * a, he[1] + 5 * a], [he[0] + d * 15 * a, he[1] + 4 * a]), 0.5 * a, 0.32, r, () => 1);
}

define('camel', {
  draw(K, r, p) {
    K.soft(p.x, p.y + 0.6 * U * p.scale, 13 * U * p.scale, 1.3 * U * p.scale, 0.07, K.tint);
    camel(K, r, p.x, p.y, p.scale, p.facing ?? 1, p.rider ?? true, p.phase);
  },
  box: p => [p.x - 34 * U * p.scale, p.y - 58 * U * p.scale, p.x + 34 * U * p.scale, p.y + 3],
});

// ---------- the man on foot who leads the line ----------
function walker(K, r, x, g, s, d, phase) {
  const { brush, dab, erase } = K, a = U * s, H = 21 * a;
  const sw = phase == null ? 0 : Math.sin(phase) * 2 * a;
  brush([[x, g - H * 0.42], [x + sw, g]], 1.1 * a, 0.75, r, t => 1 - 0.3 * t);
  brush([[x, g - H * 0.42], [x - sw, g]], 1.1 * a, 0.75, r, t => 1 - 0.3 * t);
  // the robe is one stroke, narrow at the shoulders and spreading to the hem
  const robe = brush(K.wobble(smooth([[x + d * 0.5 * a, g - H * 0.86], [x, g - H * 0.5], [x - d * 0.4 * a, g - H * 0.08]], false, 5), 0.3 * a, r),
    6 * a, 0, r, t => 0.52 + 0.48 * t, false);
  erase(robe); K.fill(robe, 0.76);
  dab(x + d * 0.3 * a, g - H * 0.94, 2 * a, 1.9 * a, 0.8);
  brush([[x - d * 0.8 * a, g - H * 0.93], [x - d * 3.4 * a, g - H * 0.72]], 1 * a, 0.55, r, t => 1 - 0.8 * t);
}

// ---------- caravan: n camels in single file along a slope, a man on foot in front ----------
define('caravan', {
  draw(K, r, p) {
    const d = p.facing ?? 1, n = p.n ?? 7, sp = p.spacing ?? 34 * U * p.scale, dy = p.dy ?? 0;
    const line = [];
    for (let i = 0; i < n; i++) line.push({ x: p.x + d * i * sp, y: p.y + i * dy, s: p.scale * (0.92 + r() * 0.16), ph: r() * 6.28, rider: r() < 0.7, sd: (r() * 1e9) | 0 });
    line.push({ x: p.x + d * (n + 0.35) * sp, y: p.y + (n + 0.35) * dy, s: p.scale, ph: r() * 6.28, walks: true, sd: (r() * 1e9) | 0 });
    line.sort((a, b) => a.y - b.y);
    for (const m of line) {
      K.soft(m.x, m.y + 0.6 * U * m.s, (m.walks ? 5 : 13) * U * m.s, 1.3 * U * m.s, 0.07, K.tint);
      const q = mulberry32(m.sd);
      if (m.walks) walker(K, q, m.x, m.y, m.s, d, p.step == null ? null : p.step + m.ph);
      else camel(K, q, m.x, m.y, m.s, d, m.rider, p.step == null ? null : p.step + m.ph);
    }
  },
  box: p => {
    const sp = p.spacing ?? 34 * U * p.scale, n = (p.n ?? 7) + 1, far = (p.facing ?? 1) * n * sp;
    return [Math.min(p.x, p.x + far) - 40 * U * p.scale, p.y - 58 * U * p.scale + Math.min(0, n * (p.dy ?? 0)),
      Math.max(p.x, p.x + far) + 40 * U * p.scale, p.y + 4 + Math.max(0, n * (p.dy ?? 0))];
  },
});

// ---------- palm: ringed trunk, a crown of feathered fronds, a cluster of dates ----------
function palm(K, r, x, g, s, hh) {
  const { brush, dab } = K, a = U * s;
  const h = (hh ?? 50 + r() * 28) * a, lean = (r() - 0.5) * 0.5;
  const tx = x + lean * h * 0.5, ty = g - h;
  const trunk = qbez([x, g + 1], [x + lean * h * 0.14, g - h * 0.55], [tx, ty], 12);
  brush(trunk, 4.4 * a, 0.8, r, t => 1 - 0.4 * t);
  for (let i = 2; i < 11; i++) {
    const q = trunk[i], w = 2.4 * a * (1 - i / 18);
    brush([[q[0] - w, q[1] + 0.8 * a], [q[0] + w, q[1]]], 0.6 * a, 0.5, r, () => 1);
  }
  const n = 11 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + ((i + 0.5) / n - 0.5) * 3.3 + (r() - 0.5) * 0.25, L = h * (0.4 + r() * 0.22);
    const spine = qbez([tx, ty], [tx + Math.cos(ang) * L * 0.6, ty + Math.sin(ang) * L * 0.6],
      [tx + Math.cos(ang) * L, ty + Math.sin(ang) * L + L * 0.62], 9);
    brush(spine, 3 * a, 0.82, r, t => 1 - 0.92 * t);
    // leaflets: short strokes angled forward off the rachis, both sides, thinning to the tip
    for (let k = 1; k < spine.length; k++) {
      const q = spine[k], o = spine[k - 1];
      let dx = q[0] - o[0], dy = q[1] - o[1];
      const dd = Math.hypot(dx, dy) || 1; dx /= dd; dy /= dd;
      const fl = h * 0.095 * (1 - k / spine.length) + 0.6 * a;
      for (let j = 0; j < 2; j++) {
        const u = (j + 0.35) / 2, px = o[0] + (q[0] - o[0]) * u, py = o[1] + (q[1] - o[1]) * u;
        for (const sg of [-1, 1]) brush([[px, py], [px - dy * sg * fl * 0.95 + dx * fl * 0.5, py + dx * sg * fl * 0.95 + dy * fl * 0.5]], 0.95 * a, 0.6, r, t => 1 - 0.85 * t);
      }
    }
  }
  for (let i = 0; i < 8; i++) dab(tx + (r() - 0.5) * 7 * a, ty + (2 + r() * 6) * a, (1 + r() * 1.2) * a, (0.9 + r()) * a, 0.4 + r() * 0.35);
}
define('palm', {
  draw: (K, r, p) => palm(K, r, p.x, p.y, p.scale, p.h),
  box: p => { const h = (p.h ?? 88) * U * p.scale; return [p.x - h * 0.9, p.y - h * 1.3, p.x + h * 0.9, p.y + 4]; },
});

// ---------- oasis: a dark pool in a hollow, a tight stand of palms behind it ----------
// The only green in the scene: nothing grows on the open sand.
define('oasis', {
  draw(K, r, p) {
    const s = p.scale, x = p.x, g = p.y, w = p.width ?? 220 * s, n = p.n ?? 5;
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n - 0.5;
      palm(K, r, x + f * w * 0.62 + (r() - 0.5) * w * 0.07, g - (9 + r() * 7) * s, s * (0.8 + r() * 0.45));
    }
    K.soft(x, g + 2 * s, w * 0.5, w * 0.11, 0.07, K.tint);                     // damp ground around it
    const pool = ellipsePts(x + w * 0.04, g, w * 0.28, w * 0.05, 0, 28, K.noise1, r() * 99, 0.09);
    K.erase(pathOf(pool));
    K.wash(pool, 0.55, r, 3, 1.6 * s);
    K.wash(pool, 0.45, r, 2, 0.8 * s);
    K.wash(pool, 0.12, r, 2, 1.6 * s, K.tint);
    K.brush(pool.slice(15, 28), 1.4 * s, 0.7, r, t => Math.sin(Math.PI * t));   // the far rim, crisp
    for (let i = 0; i < 4; i++) {                                              // light breaking the surface
      const gx = x + (r() - 0.5) * w * 0.44, gy = g + (r() - 0.45) * w * 0.07;
      K.c.save(); K.c.globalCompositeOperation = 'destination-out';
      K.dry([[gx - w * 0.06, gy], [gx + w * 0.06, gy]], 1.4 * s, 0.6, r, 2, 0.05);
      K.c.restore();
    }
    // a few tufts, only on the rim of the pool
    for (let i = 0; i < 6; i++) {
      const th = r() * Math.PI * 2;
      tuft(K, r, x + w * 0.04 + Math.cos(th) * w * 0.3, g + Math.sin(th) * w * 0.055, s * 0.65, 0.5);
    }
  },
  box: p => { const w = p.width ?? 220 * p.scale; return [p.x - w * 0.7, p.y - 160 * U * p.scale, p.x + w * 0.7, p.y + 12 * p.scale]; },
});
