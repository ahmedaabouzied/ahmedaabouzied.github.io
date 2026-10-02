// Li River, Guilin: limestone towers in mist, bamboo, and a cormorant fisherman's raft.
import { define } from './registry.js';
import { qbez, smooth, pathOf } from '../core/geom.js';
import { U } from './common.js';

// ---------- karst: a limestone tower, dome-topped and steep-flanked ----------
// height(x) = max over domes of h_i * (1 - (|x - x_i| / w_i)^2)^p_i. Squaring the
// distance flattens the apex into a dome where `peak` points it, and leaves the flanks
// near vertical; fbm breaks the line. `lean` shears the profile sideways in proportion
// to height, so the tower tilts without losing its footing.
define('karst', {
  draw(K, r, p) {
    const { c, fbm, brush, dry, dab, erase } = K;
    const x = p.x, base = p.y, w = p.width, h = p.height, A = p.alpha ?? 1, lean = p.lean ?? 0, sd = r() * 999;
    const domes = [{ x: x + (r() - 0.5) * w * 0.18, h, w: w * (0.26 + r() * 0.08), pw: 0.42 + r() * 0.12 }];
    const n = 2 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++)
      domes.push({ x: x + (i % 2 ? 1 : -1) * w * (0.1 + r() * 0.16), h: h * (0.4 + r() * 0.42), w: w * (0.12 + r() * 0.1), pw: 0.4 + r() * 0.15 });
    const prof = xx => {
      let y = 0;
      for (const k of domes) { const d = Math.abs(xx - k.x) / k.w; if (d < 1) y = Math.max(y, k.h * Math.pow(1 - d * d, k.pw)); }
      y += fbm(sd + xx / 18, 4) * Math.min(14, y * 0.08);
      return Math.max(0, y * Math.min(1, (w / 2 - Math.abs(xx - x)) / (w * 0.06)));
    };
    const st = 3, top = [], hs = [];
    for (let xx = x - w / 2; xx <= x + w / 2; xx += st) { const e = prof(xx); hs.push(e / h); top.push([xx + lean * e, base - e]); }
    const body = top.concat([[x + w / 2, base + 5], [x - w / 2, base + 5]]);
    const P = pathOf(body);
    erase(P);
    K.wash(body, 0.16 * A, r, 3, 1.6);
    K.clipped(P, () => {
      // wet ink on the crest, fading to nothing at the foot where the mist takes over
      const vg = c.createLinearGradient(0, base - h, 0, base);
      vg.addColorStop(0, K.ink(0.24 * A)); vg.addColorStop(0.55, K.ink(0.1 * A)); vg.addColorStop(1, K.ink(0));
      c.fillStyle = vg; c.fill(P);
      // light comes from the left, so the right flank carries the weight
      const fg = c.createLinearGradient(x - w * 0.12, 0, x + w / 2, 0);
      fg.addColorStop(0, K.ink(0)); fg.addColorStop(0.45, K.ink(0.11 * A)); fg.addColorStop(1, K.ink(0.24 * A));
      c.fillStyle = fg; c.fill(P);
      // vertical dry-brush following the fall of the shadow flank
      const m = 8 + Math.floor(w / 22);
      for (let i = 0; i < m; i++) {
        const [sx, sy] = top[Math.floor((0.5 + r() * 0.48) * top.length)];
        const y0 = sy + 3 + (base - sy) * r() * 0.5, len = (base - y0) * (0.2 + r() * 0.6);
        if (len < 16) continue;
        const bend = (r() - 0.5) * len * 0.14 - lean * len;
        dry(K.wobble(qbez([sx, y0], [sx + bend * 0.3, y0 + len * 0.5], [sx + bend, y0 + len], 9), len * 0.035, r), 3 + r() * 4, 0.3 * A, r, 3, 0);
      }
      // axe-cut strokes: short and broad, slanting in from the silhouette
      const ax = 8 + Math.floor(r() * 8);
      for (let i = 0; i < ax; i++) {
        const [sx, sy] = top[Math.floor((0.08 + r() * 0.88) * top.length)];
        const len = w * (0.04 + r() * 0.07), yy = sy + 4 + (base - sy) * (0.02 + r() * 0.22), sg = sx > x ? -1 : 1;
        dry([[sx + sg * len * 0.1, yy - len * 0.25], [sx + sg * len, yy + len * 0.35]], 2.5 + r() * 3, 0.3 * A, r, 3, -0.2);
      }
    });
    // scrub along the crest and on the ledges below it
    const veg = 6 + Math.floor(r() * 9);
    for (let i = 0; i < veg; i++) {
      const k = Math.floor(r() * top.length), [vx, vy] = top[k];
      if (hs[k] < 0.15) continue;
      const vy2 = vy + (r() < 0.6 ? 0 : (base - vy) * r() * 0.3), cl = 3 + Math.floor(r() * 3), sp = (2 + r() * 3) * U;
      for (let j = 0; j < cl; j++)
        dab(vx + (j - (cl - 1) / 2) * sp + (r() - 0.5) * sp, vy2 - (1 + r() * 3) * U, (1 + r() * 1.6) * U, (1.4 + r() * 2) * U, (0.3 + r() * 0.35) * A, (r() - 0.5) * 0.5);
      if (r() < 0.6) brush([[vx, vy2 + 2], [vx + (r() - 0.5) * 6, vy2 - 7 - r() * 11]], 1.8, (0.45 + r() * 0.3) * A, r, t => 1 - 0.88 * t);
    }
    // contour, heaviest where the tower stands tallest
    const hAt = t => hs[Math.min(hs.length - 1, Math.round(t * (hs.length - 1)))];
    brush(top, p.edge ?? (2 + 3 * A), 0.8 * A, r, t => 0.2 + 0.8 * Math.pow(hAt(t), 0.6));
  },
  box: p => {
    const l = (p.lean ?? 0) * p.height;
    return [p.x - p.width / 2 + Math.min(0, l), p.y - p.height * 1.1, p.x + p.width / 2 + Math.max(0, l), p.y + 8];
  },
});

// ---------- bamboo: slender noded stems, leaves in fanning groups ----------
define('bamboo', {
  draw(K, r, p) {
    const { brush } = K, s = p.scale ?? 1, x = p.x, g = p.y;
    const n = p.n ?? 5 + Math.floor(r() * 5);
    for (let i = 0; i < n; i++) {
      const bx = x + (r() - 0.5) * 34 * U * s, h = (75 + r() * 80) * U * s, lean = (r() - 0.5) * 0.3;
      const stem = qbez([bx, g + 1], [bx + lean * h * 0.3, g - h * 0.55], [bx + lean * h, g - h], 12);
      brush(stem, (2.5 + r() * 1.3) * U * s, 0.8, r, t => 1 - 0.55 * t);
      const segs = 4 + Math.floor(r() * 4);
      for (let k = 1; k < segs; k++) {
        const q = stem[Math.round((k / segs) * (stem.length - 1))], nw = 2.6 * U * s;
        brush([[q[0] - nw, q[1] + 0.5], [q[0] + nw, q[1] - 0.5]], 1.6 * U * s, 0.55, r, () => 1);
      }
      let left = 10 + Math.floor(r() * 11);
      while (left > 0) {
        const grp = Math.min(3 + Math.floor(r() * 3), left);
        left -= grp;
        const q = stem[Math.round((0.3 + r() * 0.68) * (stem.length - 1))], side = r() < 0.5 ? -1 : 1;
        for (let k = 0; k < grp; k++) {
          const f = grp === 1 ? 0.5 : k / (grp - 1);
          const ang = -0.35 + f * 1.0 + (r() - 0.5) * 0.18, len = (13 + r() * 16) * U * s;
          const ex = q[0] + side * Math.cos(ang) * len, ey = q[1] + Math.sin(ang) * len;
          const mx = (q[0] + ex) / 2 + side * len * 0.06, my = (q[1] + ey) / 2 - len * 0.14;
          brush(qbez(q, [mx, my], [ex, ey], 7), (2.4 + r() * 1.6) * U * s, 0.6 + r() * 0.25, r, t => Math.pow(Math.sin(Math.PI * (0.12 + 0.84 * t)), 0.6));
        }
      }
    }
  },
  box: p => { const s = p.scale ?? 1; return [p.x - 50 * U * s, p.y - 165 * U * s, p.x + 50 * U * s, p.y + 4]; },
});

// ---------- raft: bamboo poles, a standing fisherman, two cormorants ----------
define('raft', {
  draw(K, r, p) {
    const { brush, dab, erase, c } = K, s = p.scale, x = p.x, y = p.y, d = p.facing ?? 1;
    const L = 52 * U * s, H = 2.6 * U * s, fx = x - d * L * 0.1, hh = 26 * U * s;
    const deck = [[x - L * 0.5, y - H], [x + L * 0.5, y - H * 1.9], [x + L * 0.47, y + H], [x - L * 0.47, y + H]];
    // fisherman: a robe, a head, and a conical hat
    const hx = fx + d * 1.9 * U * s, hy = y - hh;
    const brim = smooth([[hx - 4.6 * U * s, hy + 0.6 * U * s], [hx - 2.3 * U * s, hy - 1.7 * U * s], [hx, hy - 3.3 * U * s], [hx + 2.3 * U * s, hy - 1.7 * U * s], [hx + 4.6 * U * s, hy + 0.6 * U * s]], false, 5);
    const figure = a => {
      brush([[fx, y], [fx + d * 0.6 * U * s, y - hh * 0.55], [fx + d * 1.6 * U * s, y - hh * 0.9]], 3.4 * U * s, 0.82 * a, r, t => 1 - 0.45 * t);
      dab(hx, y - hh * 0.97, 1.5 * U * s, 1.6 * U * s, 0.85 * a);
      K.fill(pathOf(brim.concat([[hx, hy - 0.3 * U * s]])), 0.8 * a);
    };
    // reflection first: deck and figure mirrored about the waterline, squashed and faint
    c.save(); c.translate(0, (y + H) * 1.8); c.scale(1, -0.8);
    K.fill(pathOf(deck), 0.07);
    figure(0.16);
    c.restore();
    for (let i = 0; i < 5; i++) {
      const yy = y + H * (1.6 + i * 2.1);
      K.dry([[x - L * (0.5 - i * 0.05), yy], [x + L * (0.5 - i * 0.05), yy]], 1.2 * s, 0.13, r, 2, 0);
    }
    // six poles lashed at both ends, the bow lifted clear of the water
    erase(pathOf(deck));
    for (let i = 0; i < 6; i++) {
      const dy = (i - 2.5) * 1 * U * s;
      brush(qbez([x - d * L * 0.5, y + dy + 1.2 * U * s], [x + d * L * 0.25, y + dy], [x + d * L * 0.5, y + dy - 2.6 * U * s], 8), (0.8 + 0.5 * r()) * U * s, 0.45 + 0.25 * r(), r, () => 1);
    }
    for (const k of [-0.44, 0.44]) {
      const bx = x + d * L * k;
      brush([[bx, y - 3.4 * U * s], [bx + d * 1.4 * U * s, y + 2.6 * U * s]], 1 * U * s, 0.7, r, () => 1);
    }
    figure(1);
    // the pole, held over his shoulder and dipped in the water ahead
    brush([[fx - d * 5 * U * s, y - hh * 1.15], [fx + d * 16 * U * s, y + 3 * U * s]], 0.7 * U * s, 0.75, r, () => 1);
    // cormorants, one at each end, facing outward
    const bird = (cx, cy, cd) => {
      const b = 4.2 * U * s;
      K.fill(pathOf(smooth([[cx - cd * b, cy - b * 0.1], [cx - cd * b * 0.2, cy - b * 0.62], [cx + cd * b * 0.85, cy - b * 0.25], [cx + cd * b * 0.25, cy + b * 0.3]], true, 5)), 0.82);
      brush(qbez([cx + cd * b * 0.55, cy - b * 0.45], [cx + cd * b * 1.1, cy - b], [cx + cd * b * 0.7, cy - b * 1.7], 7), 1.3 * U * s, 0.85, r, t => 1 - 0.3 * t);
      dab(cx + cd * b * 0.78, cy - b * 1.82, 1.2 * U * s, 0.95 * U * s, 0.85);
      brush([[cx + cd * b * 1.1, cy - b * 1.85], [cx + cd * b * 1.9, cy - b * 1.78]], 0.6 * U * s, 0.85, r, t => 1 - 0.75 * t);
      brush([[cx - cd * b * 0.75, cy - b * 0.25], [cx - cd * b * 1.6, cy - b * 0.6]], 1.2 * U * s, 0.6, r, t => 1 - 0.9 * t);
    };
    bird(x + d * L * 0.38, y - 3.6 * U * s, d);
    bird(x - d * L * 0.4, y - 2.6 * U * s, -d);
    // lantern on a short post
    const lx = x + d * L * 0.16, ly = y - 12.6 * U * s;
    brush([[lx, y - H], [lx - d * 0.5 * U * s, ly + 1.4 * U * s]], 0.7 * U * s, 0.7, r, () => 1);
    dab(lx - d * 0.5 * U * s, ly, 1.5 * U * s, 1.9 * U * s, 0.55, 0, K.accent);
    dab(lx - d * 0.5 * U * s, ly, 3.2 * U * s, 3.6 * U * s, 0.1, 0, K.accent);
  },
  box: p => [p.x - 32 * U * p.scale, p.y - 44 * U * p.scale, p.x + 34 * U * p.scale, p.y + 36 * U * p.scale],
});
