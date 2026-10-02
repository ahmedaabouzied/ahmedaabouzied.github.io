// Val d'Orcia: ploughed hills in overlapping rows, a stone farmhouse on a crest,
// cypresses along a white road, olive groves, umbrella pines and vine rows.
import { define } from './registry.js';
import { qbez, smooth, pathOf, TAU } from '../core/geom.js';
import { U } from './common.js';

// ---------- hill: a rounded mound of ploughed earth ----------
// Silhouette: H * cos(pi*t/2)^1.5 across t in -1..1, roughened by fbm.
define('hill', {
  draw(K, r, p, env) {
    const { c, fbm, noise1 } = K;
    const x = p.x, base = p.y, w = p.width, H = p.height, A = p.alpha ?? 0.5, off = p.offset ?? 0;
    const prof = xx => {
      const t = (xx - x) / (w / 2);
      if (Math.abs(t) >= 1) return 0;
      return Math.max(0, H * Math.pow(Math.cos((t * Math.PI) / 2), 1.5) * (1 + 0.3 * fbm(off + xx / 280, 3)));
    };
    const st = 6, top = [];
    for (let xx = x - w / 2; xx <= x + w / 2; xx += st) top.push([xx, base - prof(xx)]);
    const foot = base + (p.depth ?? 120);
    const P = pathOf(top.concat([[x + w / 2, foot], [x - w / 2, foot]]));
    K.erase(P);
    // The gradient ends at the base, so the flank running down out of sight keeps the darkest
    // tone. Every stop grows faster than alpha, so the near rows sit clearly darker than the
    // mid ones while the far rows stay where they are and depth still reads.
    const gr = c.createLinearGradient(0, base - H, 0, base), A4 = A * A * A * A;
    gr.addColorStop(0, K.ink(A * 0.14 + A4 * 0.4)); gr.addColorStop(0.7, K.ink(A * 0.27 + A4 * 0.3)); gr.addColorStop(1, K.ink(A * 0.42 + A4 * 0.33));
    c.fillStyle = gr; c.fill(P);
    K.fill(P, A * 0.12, K.tint);
    // Furrows run from crest to foot: above the base each one is the profile scaled
    // down by k, below it they flatten and bow toward the viewer. A slow noise mask
    // cuts every furrow into parcels, and the strip between two furrows takes a wash
    // of its own, so the hill breaks into pale and ploughed fields.
    const s = env.scaleAt(base), fa = (p.furrows ?? 0.6) * 0.62, n = 8 + Math.floor(r() * 13);
    const bot = Math.min(foot, env.scene.height + 20), grid = [];
    for (let xx = x - w / 2; xx <= x + w / 2; xx += 9) grid.push(xx);
    K.clipped(P, () => {
      let prev = null;
      for (let i = 0; i < n; i++) {
        const yc = base - H + ((i + 0.5 + (r() - 0.5) * 0.5) / n) * (bot - base + H), k = (base - yc) / H;
        // a fixed wobble in scene units, so a tall near hill's furrows stay parallel
        const ys = grid.map(xx => {
          const pr = prof(xx), j = noise1(off + i * 7.3 + xx / 110) * 3;
          return (k >= 0 ? base - pr * k : yc + pr * -k * 0.5) + j;
        });
        const field = gi => noise1(off * 1.7 + i * 0.5 + grid[gi] / 420);
        const runs = [];
        let a = -1;
        for (let gi = 0; gi < grid.length; gi++) {
          const on = (k < 0 || prof(grid[gi]) * k >= 1.5) && field(gi) > -0.12;
          if (on && a < 0) a = gi;
          else if (!on && a >= 0) { if (gi - 1 - a > 3) runs.push([a, gi - 1]); a = -1; }
        }
        if (a >= 0 && grid.length - 1 - a > 3) runs.push([a, grid.length - 1]);
        for (const [u, v] of runs) {
          const seg = [];
          for (let gi = u; gi <= v; gi++) seg.push([grid[gi], ys[gi]]);
          if (prev && field((u + v) >> 1) > 0.3) {
            // the strip pinches shut at both ends, so a field edge never lands as a hard step
            const band = [], m = Math.max(1, Math.min(12, (v - u) >> 2));
            for (let gi = u; gi <= v; gi++) {
              const t = Math.min(1, Math.min(gi - u, v - gi) / m);
              band.push([grid[gi], prev[gi] + (ys[gi] - prev[gi]) * t]);
            }
            for (let gi = v; gi >= u; gi--) band.push([grid[gi], prev[gi]]);
            K.wash(band, fa * 0.5, r, 2, 1.6);
          }
          K.dry(seg, 3.2 * s, fa * (0.3 + 0.55 * r()), r, 2, -0.3);
        }
        prev = ys;
      }
    });
    K.brush(top, 2.4 * s, 0.3 + A * 0.6, r, () => 0.7);
  },
  box: p => [p.x - p.width / 2, p.y - p.height * 1.3, p.x + p.width / 2, p.y + (p.depth ?? 120)],
});

// ---------- cypress: a narrow dark flame ----------
// Half-width follows sin(pi * u^0.75), widest two fifths up and pointed at the tip.
function cypress(K, r, x, g, s, hh) {
  const H = (hh ?? 54 + r() * 26) * U * s, W = H * 0.12, trunk = H * 0.09, cb = g - trunk;
  const half = u => (W / 2) * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.55);
  K.brush([[x, g + 1], [x + (r() - 0.5) * U * s, cb]], W * 0.3, 0.85, r, t => 1 - 0.3 * t);
  const sil = [], back = [];
  for (let i = 0; i <= 14; i++) { const u = i / 14, hw = half(u), y = cb - u * H; sil.push([x - hw, y]); back.push([x + hw, y]); }
  K.wash(sil.concat(back.reverse()), 0.38, r, 2, 0.5 * U * s);
  const n = 25 + Math.floor(r() * 21);
  for (let i = 0; i < n; i++) {
    const u = Math.pow(r(), 0.85), hw = half(u), ox = (r() * 2 - 1) * hw * 0.85;
    const sx = x + ox, sy = cb - u * H, len = H * (0.07 + r() * 0.1);
    K.brush([[sx, sy], [sx - ox * 0.2, sy - len]], W * 0.24, 0.8 + r() * 0.15, r, t => 1 - 0.85 * t);
  }
  K.brush([[x, cb - H * 0.86], [x + (r() - 0.5) * U * s, cb - H * 1.02]], W * 0.2, 0.9, r, t => 1 - 0.95 * t);
}
define('cypress', {
  draw: (K, r, p) => cypress(K, r, p.x, p.y, p.scale, p.h),
  box: p => { const H = (p.h ?? 67) * U * p.scale; return [p.x - H * 0.12, p.y - H * 1.2, p.x + H * 0.12, p.y + 4]; },
});

// ---------- cypressRow: a line of them along a road or a crest ----------
define('cypressRow', {
  draw(K, r, p, env) {
    const n = p.n ?? 6, sp = p.spacing ?? 45, along = p.along ?? 0, s0 = env.scaleAt(p.y);
    for (let i = 0; i < n; i++) {
      const cy = p.y + i * along, cx = p.x + i * sp + (r() - 0.5) * sp * 0.18;
      cypress(K, r, cx, cy, (p.scale * env.scaleAt(cy)) / s0, p.h);
    }
  },
  box: p => {
    const n = p.n ?? 6, sp = p.spacing ?? 45, along = p.along ?? 0, H = (p.h ?? 67) * U * p.scale;
    const xs = [p.x, p.x + (n - 1) * sp], ys = [p.y, p.y + (n - 1) * along];
    return [Math.min(...xs) - H * 0.3, Math.min(...ys) - H * 1.2, Math.max(...xs) + H * 0.3, Math.max(...ys) + 4];
  },
});

// ---------- farmhouse: stone house seen three-quarter on ----------
// Cabinet projection: `at(x, y, f)` walks a point f of the way into the block's depth,
// so the long wall stays frontal while the gable end and the tower show a second face.
define('farmhouse', {
  draw(K, r, p) {
    const { brush, dry, wash, erase, fill, dab, wobble } = K, s = p.scale, x = p.x, g = p.y;
    const W = (56 + r() * 16) * U * s, Hh = W * (0.4 + r() * 0.06), roofH = W * 0.14, over = W * 0.05;
    const side = r() < 0.5 ? -1 : 1, Dx = side * W * 0.27, Dy = -W * 0.17;
    const at = (ax, ay, f) => [ax + Dx * f, ay + Dy * f];
    const L = x - W / 2, R = x + W / 2;
    const ex = side > 0 ? R : L, fx = side > 0 ? L : R;  // gable end, and the end the tower holds
    const eY = g - Hh + over * 0.4, ry = g - Hh + Dy * 0.5 - roofH;
    // a hand-drawn edge: tapered brush over wobbled points
    const span = (a, b) => { const o = []; for (let i = 0; i <= 6; i++) o.push([a[0] + (b[0] - a[0]) * i / 6, a[1] + (b[1] - a[1]) * i / 6]); return o; };
    const edge = (a, b, w, al) => brush(wobble(span(a, b), 0.6 * U * s, r), w, al * (0.85 + 0.3 * r()), r, t => 0.3 + 0.7 * Math.sin(Math.PI * t));
    const face = (poly, a) => { const P = pathOf(poly); erase(P); fill(P, a); fill(P, a * 0.45, K.tint); return P; };
    // stone courses: broken dry strokes running with the face, from corner a to corner b
    const courses = (P, a, b, h, n) => K.clipped(P, () => {
      for (let i = 0; i < n; i++) { const d = -r() * h; dry([[a[0], a[1] + d], [b[0], b[1] + d]], 1.5 * s, 0.21, r, 2, 0.25); }
    });
    const tiles = (P, a, b, c, d, n) => K.clipped(P, () => {
      for (let i = 0; i < n; i++) { const t = r(); dry([[a[0] + (d[0] - a[0]) * t, a[1] + (d[1] - a[1]) * t], [b[0] + (c[0] - b[0]) * t, b[1] + (c[1] - b[1]) * t]], 1.4 * s, 0.22, r, 2, 0.25); }
    });
    // --- barn: a low wing off the far end, behind everything
    const bw = W * 0.3, bh = Hh * 0.55, b1 = [fx - side * bw, g], b0 = [fx, g];
    const barn = [b0, b1, [b1[0], g - bh], [b0[0], g - bh]];
    courses(face(barn, 0.11), b0, b1, bh, 5);
    const bov = over * 0.7, be0 = [b0[0] + side * bov, g - bh + bov * 0.4], be1 = [b1[0] - side * bov, g - bh + bov * 0.4];
    const bk0 = [be0[0] + Dx * 0.35, g - bh - bh * 0.3 + Dy * 0.35], bk1 = [be1[0] + Dx * 0.35, bk0[1]];
    const bslope = [be0, be1, bk1, bk0];
    erase(pathOf(bslope)); wash(bslope, 0.45, r, 2, 0.6, K.accent);
    edge(be0, be1, W * 0.03, 0.7); edge(bk0, bk1, W * 0.022, 0.6);
    edge(be1, bk1, W * 0.016, 0.5); edge(be0, bk0, W * 0.016, 0.45);
    edge(b1, [b1[0], g - bh], W * 0.014, 0.4);
    // --- gable end, then the long wall over it
    const gend = [[ex, g], at(ex, g, 1), at(ex, g - Hh, 1), [ex, g - Hh]];
    courses(face(gend, 0.24), [ex, g], at(ex, g, 1), Hh, 6);
    const tri = [[ex, g - Hh], at(ex, g - Hh, 1), [ex + Dx * 0.5, ry]];
    face(tri, 0.24);
    const front = [[L, g], [R, g], [R, g - Hh], [L, g - Hh]];
    courses(face(front, 0.11), [L, g], [R, g], Hh, 8);
    edge([ex, g], at(ex, g, 1), W * 0.013, 0.34);
    edge(at(ex, g, 1), at(ex, g - Hh, 1), W * 0.013, 0.3);
    edge([ex, g], [ex, g - Hh], W * 0.014, 0.38);
    edge([L, g], [R, g], W * 0.016, 0.44);
    // --- roof: one slope to the ridge, heavy eave and ridge lines
    const e0 = [L - over, eY], e1 = [R + over, eY];
    const k0 = [L - over + Dx * 0.5, ry], k1 = [R + over + Dx * 0.5, ry];
    const slope = [e0, e1, k1, k0];
    erase(pathOf(slope)); wash(slope, 0.5, r, 2, 0.7, K.accent);
    tiles(pathOf(slope), e0, e1, k1, k0, 7);
    edge(e0, k0, W * 0.02, 0.5); edge(e1, k1, W * 0.02, 0.5);
    edge(e0, e1, W * 0.045, 0.8);
    edge(k0, k1, W * 0.032, 0.72);
    // --- tower at the far end: front face full height, second face above the eave
    const tw = W * 0.22, tq = tw / (W * 0.5), t1 = fx + side * tw, tTop = ry - Hh * 0.5;
    const tside = [[t1, eY], at(t1, eY, tq), at(t1, tTop, tq), [t1, tTop]];
    face(tside, 0.28);
    courses(face([[fx, g], [t1, g], [t1, tTop], [fx, tTop]], 0.1), [fx, g], [t1, g], g - tTop, 7);
    edge([t1, g], [t1, tTop], W * 0.014, 0.4);
    edge([fx, g], [fx, tTop], W * 0.014, 0.36);
    edge(at(t1, eY, tq), at(t1, tTop, tq), W * 0.012, 0.32);
    // pyramid cap, the second slope darker
    const c0 = [fx - over * 0.5, tTop + over * 0.3], c1 = [t1 + over * 0.5, tTop + over * 0.3];
    const c2 = at(c1[0], c1[1], tq), apex = [(fx + t1) / 2 + Dx * tq * 0.5, tTop + Dy * tq * 0.5 - tw * 0.55];
    erase(pathOf([c0, c1, apex])); wash([c0, c1, apex], 0.5, r, 2, 0.6, K.accent);
    erase(pathOf([c1, c2, apex])); wash([c1, c2, apex], 0.64, r, 2, 0.6, K.accent);
    edge(c0, c1, W * 0.028, 0.74); edge(c1, c2, W * 0.02, 0.62);
    edge(c0, apex, W * 0.017, 0.6); edge(c1, apex, W * 0.017, 0.6); edge(c2, apex, W * 0.014, 0.5);
    // --- windows: small dark dabs, each on a thin pale sill
    const ww = 1.5 * U * s, wh = 2.1 * U * s;
    const win = (wx, wy, f = 1) => {
      dab(wx, wy, ww * f, wh * f, 0.8);
      erase(pathOf([[wx - ww * 1.5 * f, wy + wh * f], [wx + ww * 1.5 * f, wy + wh * f],
        [wx + ww * 1.5 * f, wy + wh * f + 0.8 * U * s], [wx - ww * 1.5 * f, wy + wh * f + 0.8 * U * s]]));
    };
    const wL = Math.min(t1, ex), wR = Math.max(t1, ex), sp = wR - wL;
    for (let i = 0; i < 3; i++) win(wL + (sp * (i + 0.5)) / 3, g - Hh * 0.72);
    win(wL + sp * 0.2, g - Hh * 0.3); win(wL + sp * 0.8, g - Hh * 0.3);
    const q1 = at(ex, g - Hh * 0.68, 0.55), q2 = at(ex, g - Hh * 0.28, 0.6);
    win(q1[0], q1[1], 0.85); win(q2[0], q2[1], 0.85);
    win((fx + t1) / 2, tTop + Hh * 0.3, 0.9);
    // --- arched door: a dark half-ellipse on the long wall
    const dx = wL + sp * 0.5, dw = 2.2 * U * s, dh = 5 * U * s, door = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI - (i * Math.PI) / 12; door.push([dx + Math.cos(a) * dw, g - Math.sin(a) * dh]); }
    fill(pathOf(door), 0.82);
  },
  box: p => { const W = 72 * U * p.scale; return [p.x - W, p.y - W * 1.25, p.x + W, p.y + 4]; },
});

// ---------- road: an erased ribbon, narrowing as it climbs away ----------
define('road', {
  draw(K, r, p, env) {
    const pts = smooth(p.points, false, 10), L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const hw = p.width * env.scaleAt(pts[i][1]) * 0.5;
      L.push([pts[i][0] - dy * hw, pts[i][1] + dx * hw]);
      R.push([pts[i][0] + dy * hw, pts[i][1] - dx * hw]);
    }
    K.erase(pathOf(L.concat(R.slice().reverse())));
    K.dry(L, 1.6, 0.3, r, 2, -0.1);
    K.dry(R, 1.6, 0.3, r, 2, -0.1);
  },
  box: p => {
    const xs = p.points.map(q => q[0]), ys = p.points.map(q => q[1]);
    return [Math.min(...xs) - p.width, Math.min(...ys) - p.width, Math.max(...xs) + p.width, Math.max(...ys) + p.width];
  },
});

// ---------- olive: a small grey-green cloud over a gnarled trunk ----------
function olive(K, r, x, g, s) {
  const h = (15 + r() * 7) * U * s, cw = h * (0.9 + r() * 0.4), cy = g - h * 0.72;
  K.brush([[x, g + 1], [x + (r() - 0.5) * 2 * U * s, cy + h * 0.2]], 1.8 * U * s, 0.6, r, t => 1 - 0.45 * t);
  for (const side of [-1, 1]) K.brush([[x, cy + h * 0.25], [x + side * cw * 0.2, cy]], 1.1 * U * s, 0.5, r, t => 1 - 0.8 * t);
  const n = 16 + Math.floor(r() * 14);
  for (let i = 0; i < n; i++) {
    const a = r() * TAU, q = Math.sqrt(r());
    const px = x + Math.cos(a) * cw * 0.5 * q, py = cy + Math.sin(a) * h * 0.34 * q;
    K.dab(px, py, (1.8 + r() * 2) * U * s, (1.3 + r() * 1.3) * U * s, 0.09 + r() * 0.1, a * 0.3, K.tint);
    if (r() < 0.45) K.dab(px, py, (1 + r()) * U * s, (0.7 + r()) * U * s, 0.1 + r() * 0.1, 0);
  }
}
define('olive', {
  draw: (K, r, p) => olive(K, r, p.x, p.y, p.scale),
  box: p => { const h = 22 * U * p.scale; return [p.x - h, p.y - h * 1.3, p.x + h, p.y + 4]; },
});

// ---------- oliveGrove: rows of them stepping toward the viewer ----------
define('oliveGrove', {
  draw(K, r, p, env) {
    const rows = p.rows ?? 3, n = p.n ?? 6, sp = p.spacing ?? 50, gap = p.rowGap ?? 16, s0 = env.scaleAt(p.y);
    for (let j = 0; j < rows; j++) {
      const ry = p.y + j * gap, rs = (p.scale * env.scaleAt(ry)) / s0;
      for (let i = 0; i < n; i++) olive(K, r, p.x + (i + j * 0.4) * sp + (r() - 0.5) * sp * 0.25, ry + (r() - 0.5) * gap * 0.3, rs);
    }
  },
  box: p => {
    const rows = p.rows ?? 3, n = p.n ?? 6, sp = p.spacing ?? 50, gap = p.rowGap ?? 16, h = 30 * U * p.scale;
    return [p.x - h, p.y - h * 1.3, p.x + (n - 1 + rows * 0.4) * sp + h, p.y + rows * gap + 6];
  },
});

// ---------- vines: posts, wires and leaf dabs, rows receding into the field ----------
define('vines', {
  draw(K, r, p, env) {
    const rows = p.rows ?? 4, ang = p.angle ?? -0.1, s0 = env.scaleAt(p.y);
    for (let j = rows - 1; j >= 0; j--) {
      const sy = p.y - j * 13 * U * p.scale, sx = p.x + j * 30 * U * p.scale;
      const s = (p.scale * env.scaleAt(sy)) / s0, len = p.length * (s / p.scale);
      const ex = sx + Math.cos(ang) * len, ey = sy + Math.sin(ang) * len, ph = 9 * U * s;
      K.dry([[sx, sy - ph], [ex, ey - ph]], 1.2 * s, 0.24, r, 2, -0.2);
      const step = 12 * U * s, nP = Math.max(2, Math.round(len / step));
      for (let i = 0; i <= nP; i++) {
        const t = i / nP, px = sx + (ex - sx) * t, py = sy + (ey - sy) * t;
        K.brush([[px, py + 1], [px + (r() - 0.5) * U * s, py - ph]], 1.5 * U * s, 0.55, r, q => 1 - 0.25 * q);
        for (let k = 0; k < 3; k++)
          K.dab(px + (r() - 0.5) * step, py - ph * (0.2 + r() * 0.75), (1.7 + r() * 1.8) * U * s, (1.1 + r()) * U * s, 0.09 + r() * 0.11, 0, K.tint);
      }
    }
  },
  box: p => {
    const back = (p.rows ?? 4) * 13 * U * p.scale;
    return [p.x - 20, p.y - back - 30 * U * p.scale, p.x + p.length + back * 2.5, p.y + 10];
  },
});

// ---------- umbrellaPine: bare trunk under a broad flat canopy ----------
define('umbrellaPine', {
  draw(K, r, p) {
    const s = p.scale, x = p.x, g = p.y, H = (p.h ?? 70 + r() * 30) * U * s, lean = (r() - 0.5) * 0.18;
    const topY = g - H, cx = x + lean * H, ct = H * 0.26, cw = H * (1.3 + r() * 0.3);
    K.brush(K.wobble(qbez([x, g + 1], [x + lean * H * 0.4, g - H * 0.5], [cx, topY + H * 0.2], 9), 0.8 * U * s, r), (4.5 + r() * 1.5) * U * s, 0.82, r, t => 1 - 0.5 * t);
    const k = 4 + Math.floor(r() * 3);
    for (let j = 0; j < k; j++) {
      const f = (j + 0.5) / k, ex = cx + (f - 0.5) * cw * 0.75;
      K.brush(qbez([cx, topY + H * 0.22], [cx + (ex - cx) * 0.5, topY + ct * 1.1], [ex, topY + ct * 0.8], 6), 2.2 * U * s, 0.72, r, t => 1 - 0.75 * t);
    }
    const N = 140 + Math.floor(220 * s);
    for (let i = 0; i < N; i++) {
      const t = r() * 2 - 1, e = Math.sqrt(Math.max(0, 1 - t * t));
      const px = cx + t * cw * 0.5, py = topY + ct * (1 - Math.pow(e, 0.45)) + Math.pow(r(), 0.7) * ct * 0.9;
      K.dab(px, py, (1.6 + r() * 2.4) * U * s, (0.9 + r() * 1.3) * U * s, 0.09 + 0.16 * r(), (r() - 0.5) * 0.5);
    }
  },
  box: p => { const H = (p.h ?? 85) * U * p.scale; return [p.x - H * 0.75, p.y - H * 1.2, p.x + H * 0.75, p.y + 4]; },
});
