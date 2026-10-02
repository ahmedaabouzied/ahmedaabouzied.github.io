// Swiss Alps: jagged snow peaks, spruce, forest bands, chalets, a lake that reflects, a rowing boat.
import { define } from './registry.js';
import { qbez, smooth, pathOf } from '../core/geom.js';
import { rngFor } from '../core/rng.js';
import { U, tuft } from './common.js';

// ---------- peak: a massif built from several sharp summits ----------
// height(x) = max over summits of h_i * (1 - |x - x_i| / w_i)^p_i, plus fbm for broken rock.
define('peak', {
  draw(K, r, p) {
    const { fbm, noise1, brush, dry, erase } = K;
    const x = p.x, base = p.y, w = p.width, h = p.height, A = p.alpha ?? 1, sd = r() * 999, light = p.light ?? -1;
    const peaks = [{ x: x + (p.apex ?? 0) * w + (r() - 0.5) * w * 0.04, h, w: w * 0.5 * (0.85 + r() * 0.25), pw: 1.05 + r() * 0.25 }];
    const n = p.subpeaks ?? 2 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) peaks.push({ x: x + (r() - 0.5) * w * 0.8, h: h * (0.35 + r() * 0.45), w: w * (0.14 + r() * 0.22), pw: 1 + r() * 0.4 });
    const prof = xx => {
      let y = 0;
      for (const k of peaks) { const d = Math.abs(xx - k.x) / k.w; if (d < 1) y = Math.max(y, k.h * Math.pow(1 - d, k.pw)); }
      const t = (xx - x) / (w / 2);
      y = Math.max(y, h * 0.1 * Math.max(0, 1 - t * t));
      y += fbm(sd + xx / 16, 4) * Math.min(16, y * 0.07);
      return Math.max(0, y * Math.min(1, (w / 2 - Math.abs(xx - x)) / (w * 0.06)));
    };
    const st = 3, top = [];
    for (let xx = x - w / 2; xx <= x + w / 2; xx += st) top.push([xx, base - prof(xx)]);
    const foot = [[x + w / 2, base + 6], [x - w / 2, base + 6]];
    const body = top.concat(foot), P = pathOf(body);
    erase(P);
    K.fill(P, 0.035 * A);
    const snowAt = xx => base - h * (p.snow ?? 0.5) + fbm(sd + 7 + xx / 80, 3) * h * 0.06 + Math.abs(noise1(sd + xx / 22)) * h * 0.09;
    const { c } = K;
    K.clipped(P, () => {
      // rock below the snowline
      const rock = top.map(([xx, y]) => [xx, Math.max(y, snowAt(xx))]).concat(foot);
      const sl = base - h * (p.snow ?? 0.5), rg = c.createLinearGradient(0, sl - h * 0.05, 0, base);
      rg.addColorStop(0, K.ink(0.05 * A)); rg.addColorStop(0.3, K.ink(0.16 * A)); rg.addColorStop(1, K.ink(0.12 * A));
      c.fillStyle = rg; c.fill(pathOf(rock));
      // shadow face of each summit, away from the light
      for (const k of peaks) {
        if (k.h < h * 0.3) continue;
        const sgn = -light, ext = k.w * 0.85, face = [[k.x, base - prof(k.x)]];
        for (let f = 0; f <= 1.0001; f += 0.04) { const xx = k.x + sgn * ext * f; face.push([xx, base - prof(xx)]); }
        face.push([k.x + sgn * ext, base + 6], [k.x + sgn * k.w * 0.12, base + 6]);
        const fg = c.createLinearGradient(k.x, 0, k.x + sgn * ext, 0);
        fg.addColorStop(0, K.ink(0)); fg.addColorStop(0.18, K.ink(0.15 * A)); fg.addColorStop(0.55, K.ink(0.09 * A)); fg.addColorStop(1, K.ink(0));
        c.fillStyle = fg; c.fill(pathOf(face));
        const m = Math.floor(k.w / 7);
        for (let i = 0; i < m; i++) {
          const xx = k.x + sgn * r() * k.w * 0.7, y0 = base - prof(xx) + 2, len = (base - y0) * (0.15 + r() * 0.45);
          const inSnow = y0 < snowAt(xx);
          dry(K.wobble([[xx, y0], [xx - sgn * len * 0.12, y0 + len * 0.5], [xx - sgn * len * 0.2, y0 + len]], 1.2, r), 3, (inSnow ? 0.12 : 0.24) * A, r, 3, -0.1);
        }
        // spur ridges running down from the summit
        const spurs = 1 + Math.floor(r() * 2);
        for (let j = 0; j < spurs; j++) {
          const ang = (r() - 0.5) * 0.9, len = k.h * (0.5 + r() * 0.4), pts = [[k.x, base - prof(k.x) + 2]];
          let px = k.x, py = pts[0][1];
          for (let q = 0; q < 5; q++) { px += Math.sin(ang + (r() - 0.5) * 0.6) * len / 5; py += len / 5; pts.push([px, py]); }
          brush(pts, 1.6, 0.35 * A, r, t => 1 - 0.6 * t);
        }
      }
    });
    // contour, heavier on rock than on snow
    brush(top.filter((_, i) => i % 2 === 0), p.edge ?? 1.9, 0.7 * A, r, t => 0.45 + 0.55 * Math.sin(Math.PI * (0.03 + 0.94 * t)));
  },
  box: p => [p.x - p.width / 2, p.y - p.height * 1.12, p.x + p.width / 2, p.y + 8],
});

// ---------- pine (spruce): drooping tiers of branches with needle dabs ----------
function pine(K, r, x, g, s, hh) {
  const { brush, dab } = K;
  const h = (hh ?? 110 + r() * 90) * U * s, W = h * (0.2 + r() * 0.07);
  brush([[x, g + 1], [x + (r() - 0.5) * 2 * s, g - h * 0.5], [x + (r() - 0.5) * 3 * s, g - h]], (2 + r()) * U * s, 0.85, r, t => 1 - 0.85 * t);
  const n = Math.floor(10 + h / (8 * U * s));
  for (let i = 1; i <= n; i++) {
    const t = i / n, ty = g - h + t * h * 0.9, half = W * (0.06 + 0.94 * Math.pow(t, 0.95)) * (0.75 + 0.5 * r());
    for (const side of [-1, 1]) {
      const ex = x + side * half, ey = ty + half * (0.25 + r() * 0.2);
      brush(qbez([x, ty], [x + side * half * 0.5, ty - r() * 2 * U * s], [ex, ey], 6), (1.1 + r() * 0.6) * U * s, 0.72, r, q => 1 - 0.7 * q);
      const m = Math.ceil(half / (2 * U * s));
      for (let k = 0; k < m; k++) {
        const f = (k + 0.5) / m;
        dab(x + side * half * f, ty + half * 0.3 * f * f + r() * 3 * U * s, (1.6 + r() * 1.6) * U * s, (0.9 + r() * 0.8) * U * s, 0.13 + 0.18 * r(), side * 0.25);
      }
    }
  }
}
define('pine', {
  draw: (K, r, p) => { pine(K, r, p.x, p.y, p.scale, p.h); if (p.tufts) for (let i = 0; i < p.tufts; i++) tuft(K, r, p.x + (r() - 0.5) * 50 * U * p.scale, p.y + r() * 3, p.scale * 0.7, 0.6); },
  box: p => { const h = (p.h ?? 200) * U * p.scale; return [p.x - h * 0.3, p.y - h, p.x + h * 0.3, p.y + 4]; },
});

// ---------- forest: a band of tiny spruce spires along a hill line ----------
define('forest', {
  draw(K, r, p, env) {
    const cs = p.cell ?? 4, [hMin, hMax] = p.h ?? [8, 22], A = p.alpha ?? 0.6, off = p.offset ?? 11;
    const yAt = x => p.y - (p.amp ?? 0) * (0.5 + 0.5 * K.fbm(x / (p.wave ?? 300) + off, 4));
    const x0 = Math.max(env.x0 - hMax, p.from ?? -Infinity), x1 = Math.min(env.x1 + hMax, p.to ?? Infinity);
    for (let ci = Math.floor(x0 / cs); ci <= Math.floor(x1 / cs); ci++) {
      const q = rngFor(p.seed, ci), x = (ci + q()) * cs;
      if (x < (p.from ?? -Infinity) || x > (p.to ?? Infinity)) continue;
      const dens = (p.density ?? 0.8) * (0.55 + 0.45 * K.noise1(x / 90 + off));
      if (q() > dens) continue;
      const y = yAt(x) + q() * (p.depth ?? 10), h = hMin + q() * (hMax - hMin);
      K.brush([[x, y + 1], [x + (q() - 0.5), y - h]], h * 0.34, A * (0.7 + 0.3 * q()), q, t => Math.pow(1 - t, 0.9));
      for (let k = 0; k < 3; k++) { const ty = y - h * (0.25 + k * 0.22); K.dab(x, ty, h * (0.2 - k * 0.05), h * 0.05, A * 0.25, 0); }
    }
    if (p.amp) {
      // the hill itself under the trees
      const pts = [], st = 6, xs = Math.floor(Math.max(env.x0, p.from ?? -Infinity) / st) * st - st, xe = Math.min(env.x1, p.to ?? Infinity) + st;
      for (let x = xs; x <= xe; x += st) pts.push([x, yAt(x) + 3]);
      pts.push([xe, p.y + (p.depth ?? 10) + 4], [xs, p.y + (p.depth ?? 10) + 4]);
      K.wash(pts, A * 0.25, r, 2, 1.5);
    }
  },
  box: FULL_OR_RANGE,
});
function FULL_OR_RANGE(p) { return [p.from ?? -Infinity, -Infinity, p.to ?? Infinity, Infinity]; }

// ---------- chalet: stone base, timber storey, wide gable roof, balcony ----------
define('chalet', {
  draw(K, r, p) {
    const { brush, dry, dab, wash, erase } = K, s = p.scale, x = p.x, g = p.y;
    const W = (p.w ?? 34 + r() * 18) * U * s, Hh = W * (0.5 + r() * 0.12), roofH = W * (0.24 + r() * 0.06), over = W * 0.17;
    const L = x - W / 2, R = x + W / 2, top = g - Hh, eave = top + over * 0.35;
    const outline = [[L, g], [L, eave], [x, top - roofH], [R, eave], [R, g]];
    erase(pathOf([[L - over, g], [L - over, eave + 2], [x, top - roofH - 4], [R + over, eave + 2], [R + over, g]]));
    wash(outline, 0.07, r, 2, 0.8);
    wash([[L, g], [L, g - Hh * 0.36], [R, g - Hh * 0.36], [R, g]], 0.11, r, 2, 0.8);
    for (let i = 0; i < 5; i++) { const yy = g - Hh * 0.36 * r(); dry([[L + 2, yy], [R - 2, yy + (r() - 0.5)]], 1.5 * s, 0.2, r, 2, 0); }
    // timber lines
    for (let yy = g - Hh * 0.36; yy > eave; yy -= 3.2 * U * s) brush([[L, yy], [R, yy]], 0.5 * U * s, 0.18, r, () => 1);
    // windows with shutters
    const rows = [g - Hh * 0.18, g - Hh * 0.6], cols = Math.max(2, Math.round(W / (12 * U * s)));
    for (const wy of rows) for (let i = 0; i < cols; i++) {
      const wx = L + (W * (i + 0.5)) / cols, ww = 3 * U * s, wh = 4 * U * s;
      K.fill(pathOf([[wx - ww / 2, wy - wh / 2], [wx + ww / 2, wy - wh / 2], [wx + ww / 2, wy + wh / 2], [wx - ww / 2, wy + wh / 2]]), 0.72);
      K.fill(pathOf([[wx - ww, wy - wh / 2], [wx - ww / 2, wy - wh / 2], [wx - ww / 2, wy + wh / 2], [wx - ww, wy + wh / 2]]), 0.18, K.accent);
    }
    // balcony
    const by = g - Hh * 0.42;
    brush([[L - 2, by], [R + 2, by]], 1.2 * U * s, 0.8, r, () => 1);
    for (let bx = L; bx <= R; bx += 1.8 * U * s) brush([[bx, by], [bx, by + 3 * U * s]], 0.5 * U * s, 0.6, r, () => 1);
    brush([[L - 2, by + 3 * U * s], [R + 2, by + 3 * U * s]], 0.8 * U * s, 0.6, r, () => 1);
    // gable roof: thick dark edges, wide eaves
    wash([[L - over, eave + 1], [x, top - roofH], [R + over, eave + 1], [x, top - roofH + W * 0.08]], 0.6, r, 2, 0.6);
    brush([[L - over, eave + 2], [x, top - roofH]], W * 0.075, 0.88, r, t => 0.8 + 0.2 * t);
    brush([[x, top - roofH], [R + over, eave + 2]], W * 0.075, 0.88, r, t => 1 - 0.2 * t);
    dab(x + W * 0.22, top - roofH * 0.55 - 3 * s, 1.4 * U * s, 2.5 * U * s, 0.7);
    brush([[L, g], [L, eave + 2]], 1.1 * U * s, 0.7, r, () => 1);
    brush([[R, g], [R, eave + 2]], 1.1 * U * s, 0.7, r, () => 1);
    brush([[L - 1, g], [R + 1, g]], 1.2 * U * s, 0.6, r, () => 1);
  },
  box: p => { const W = (p.w ?? 52) * U * p.scale; return [p.x - W * 0.7, p.y - W * 0.9, p.x + W * 0.7, p.y + 3]; },
});

// ---------- lake: mirrors whatever is already painted above the waterline ----------
// Reflection: row y below the waterline copies row (2*yw - y) above it, shifted by
// noise ripples that grow with distance, and fades as it nears the viewer.
define('lake', {
  draw(K, r, p, env) {
    const { c } = K, T = c.getTransform(), sy = T.d, sx = T.a, tx = T.e, cv = c.canvas;
    const ty = T.f, yw = Math.round(p.y * sy + ty), yb = Math.min(cv.height, Math.round(p.bottom * sy + ty));
    if (yb <= yw || yw <= 0) return;
    const xa = Math.max(0, Math.floor((p.from ?? -1e9) * sx + tx)), xb = Math.min(cv.width, Math.ceil((p.to ?? 1e9) * sx + tx));
    if (xb <= xa) return;
    const snap = document.createElement('canvas');
    snap.width = cv.width; snap.height = yw;
    snap.getContext('2d').drawImage(cv, 0, 0, cv.width, yw, 0, 0, cv.width, yw);
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000';
    c.fillRect(xa, yw, xb - xa, yb - yw);
    c.globalCompositeOperation = 'source-over';
    const band = 2, amp = (p.ripple ?? 3) * sx;
    for (let y = yw; y < yb; y += band) {
      const t = (y - yw) / (yb - yw), ys = 2 * yw - y;
      if (ys - band < 0) break;
      const dx = K.noise1((y - ty) / sy / 2.2 + 50) * amp * (0.3 + t * 1.6);
      c.globalAlpha = (p.alpha ?? 0.5) * (1 - 0.75 * t);
      c.drawImage(snap, xa, ys - band, xb - xa, band, xa + dx, y, xb - xa, band);
    }
    c.restore();
    const x0 = Math.max(env.x0, p.from ?? -Infinity), x1 = Math.min(env.x1, p.to ?? Infinity);
    // faint water tone
    const gr = c.createLinearGradient(0, p.y, 0, p.bottom);
    gr.addColorStop(0, K.tint(p.tint ?? 0.06)); gr.addColorStop(1, K.tint(0));
    c.fillStyle = gr; c.fillRect(x0, p.y, x1 - x0, p.bottom - p.y);
    // light streaks breaking the reflection, and a few ink ripples
    const cs = 30;
    for (let ci = Math.floor((x0 - 150) / cs); ci <= Math.floor((x1 + 150) / cs); ci++) {
      const q = rngFor(p.seed, ci);
      const n = 2 + Math.floor(q() * 3);
      for (let i = 0; i < n; i++) {
        const t = Math.pow(q(), 1.4), y = p.y + 3 + t * (p.bottom - p.y - 6), xm = (ci + q()) * cs, len = (30 + q() * 140) * (0.6 + t);
        if (q() < 0.65) {
          c.save(); c.globalCompositeOperation = 'destination-out';
          K.dry([[xm - len / 2, y], [xm + len / 2, y]], 1.2 + t * 1.5, 0.7, q, 2, 0.05);
          c.restore();
        } else K.dry([[xm - len / 3, y], [xm + len / 3, y + 0.5]], 1 + t, 0.16, q, 2, 0.1);
      }
    }
    // the far shoreline; open water (karst, fjord) sets shore: false and lets the reflection meet the land
    if (p.shore === false) return;
    const st = 6, line = [], xs = Math.floor(x0 / st) * st - st;
    for (let x = xs; x <= x1 + st; x += st) line.push([x, p.y + 0.5]);
    K.brush(line, 1.6, 0.6, r, () => 0.8, true, K.ink, xs / st);
  },
  box: p => [p.from ?? -Infinity, p.y, p.to ?? Infinity, p.bottom],
});

// ---------- boat: rowing boat with one figure, and its reflection ----------
define('boat', {
  draw(K, r, p) {
    const { brush, dab, c } = K, s = p.scale, x = p.x, y = p.y, d = p.facing ?? 1, L = 36 * U * s, H = 4.5 * U * s;
    const hull = smooth([[x - d * L / 2, y - H * 1.1], [x + d * L / 2, y - H * 1.4], [x + d * L * 0.36, y + H * 0.4], [x - d * L * 0.34, y + H * 0.35]], true, 5);
    // reflection first, faint and broken
    // mirror about the waterline (y + 0.4H), squashed to 80%: y' = yw + (yw - y) * 0.8
    const yw = y + H * 0.4; c.save(); c.translate(0, yw * 1.8); c.scale(1, -0.8);
    K.fill(pathOf(hull), 0.12); c.restore();
    for (let i = 0; i < 5; i++) { const yy = y + H * (1 + i * 0.9); K.dry([[x - L * (0.5 - i * 0.05), yy], [x + L * (0.5 - i * 0.05), yy]], 1.2 * s, 0.14, r, 2, 0); }
    // wake: two faint lines opening out behind the stern
    if (p.wake) {
      const sx = x - d * L * 0.42, sy = y + H * 0.2, len = 70 * U * s * p.wake;
      for (const k of [-1, 1]) K.brush([[sx, sy], [sx - d * len * 0.5, sy + k * len * 0.05], [sx - d * len, sy + k * len * 0.12]], 1.1 * U * s, 0.2, r, t => 1 - 0.85 * t);
      K.dry([[sx - d * len * 0.2, sy + H * 0.5], [sx - d * len * 0.9, sy + H * 0.6]], 1.5 * s, 0.12, r, 2, 0);
    }
    K.erase(pathOf(hull)); K.fill(pathOf(hull), 0.72);
    brush([[x - d * L / 2, y - H * 1.1], [x + d * L / 2, y - H * 1.4]], 1.2 * U * s, 0.9, r, () => 1);
    // rower
    const fx = x - d * L * 0.05;
    brush([[fx, y - H], [fx + d * 1.5 * U * s, y - H - 9 * U * s]], 4 * U * s, 0.82, r, t => 1 - 0.3 * t);
    dab(fx + d * 2 * U * s, y - H - 11.5 * U * s, 2.2 * U * s, 2.4 * U * s, 0.82);
    // oar: swings with the rowing phase p.row (radians); still when p.row is unset
    const sw = Math.sin(p.row ?? 0), tipX = fx + d * (14 + sw * 5) * U * s, tipY = y + (2 - Math.max(0, sw) * 1.6) * H;
    brush([[fx + d * 3 * U * s, y - H - 6 * U * s], [tipX, tipY]], 0.9 * U * s, 0.8, r, () => 1);
    if (p.row != null && sw > 0.2) K.dry([[tipX - 4 * U * s, tipY + H * 0.3], [tipX + 4 * U * s, tipY + H * 0.3]], 1.2 * s, 0.2 * sw, r, 2, 0);
  },
  box: p => [p.x - 30 * U * p.scale, p.y - 25 * U * p.scale, p.x + 30 * U * p.scale, p.y + 30 * U * p.scale],
});
