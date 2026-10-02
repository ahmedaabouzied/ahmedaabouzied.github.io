// Norwegian fjord: rock massifs falling into still water, white threads of falling
// water, a red rorbu on stilts, a ferry the size of a thumb against the rock.
import { define } from './registry.js';
import { pathOf, smooth } from '../core/geom.js';
import { U } from './common.js';

// Erase back to paper with a soft edge: the look of spray and low cloud.
function puff(K, x, y, rx, ry, a) {
  const { c } = K;
  c.save();
  c.globalCompositeOperation = 'destination-out';
  K.soft(x, y, rx, ry, a);
  c.restore();
}

// ---------- cliff: a massif whose flanks fall near-vertically into the water ----------
// Each summit is h * (1 - d^pw): rounded across the shoulder, plunging at the foot.
// A high pw on the flank facing the fjord (`side`) makes that drop close to sheer,
// and two or three summits of different heights leave saddles between them.
define('cliff', {
  draw(K, r, p) {
    const { c, fbm, noise1, brush, dry, erase } = K;
    const x = p.x, base = p.y, w = p.width, h = p.height, A = p.alpha ?? 1;
    const side = p.side ?? 1, snow = p.snow ?? 0.5, light = p.light ?? -1, sd = r() * 999;
    // Summits sized off their own height, so every flank keeps the same steep pitch;
    // a plinth under them keeps the foot of the wall unbroken from end to end.
    const n = p.summits ?? 3 + Math.floor(r() * 3);
    // heights come from an even spread, then shuffled, so no two neighbours can land
    // at the same level and leave the crest flat
    const levels = [];
    for (let i = 0; i < n; i++) levels.push(0.34 + (0.52 * i) / Math.max(1, n - 1));
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [levels[i], levels[j]] = [levels[j], levels[i]]; }
    const tops = [];
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n, hh = h * levels[i] * (0.92 + r() * 0.16);
      tops.push({
        x: x + (f - 0.5) * w * 0.88 + (r() - 0.5) * w * 0.06,
        h: hh,
        w: hh * (0.7 + r() * 0.45),
        pIn: 3.2 + r() * 1.6,
        pOut: 2.6 + r() * 1.2,
      });
    }
    const chief = tops[Math.floor(r() * n)];
    chief.h = h; chief.w = Math.min(h * (0.8 + r() * 0.3), w * 0.23);
    // narrow clefts cut back into the crest
    const clefts = [];
    for (let i = 0; i < 2 + Math.floor(r() * 3); i++) clefts.push([x + (r() - 0.5) * w * 0.78, w * (0.007 + r() * 0.025), h * (0.12 + r() * 0.2)]);
    const prof = xx => {
      const t = (xx - x) / (w / 2);
      let y = h * (p.plinth ?? 0.38) * Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(t), 5)));
      for (const s2 of tops) {
        const d = Math.abs(xx - s2.x) / s2.w;
        if (d < 1) y = Math.max(y, s2.h * Math.pow(1 - Math.pow(d, Math.sign(xx - s2.x) === side ? s2.pIn : s2.pOut), 0.7));
      }
      for (const [cx, cw, cd] of clefts) { const q = (xx - cx) / cw; y -= cd * Math.exp(-q * q) * Math.min(1, y / (h * 0.5)); }
      y += fbm(sd + xx / 15, 4) * Math.min(13, y * 0.06);
      y += fbm(sd + 71 + xx / 110, 3) * h * 0.075 * Math.min(1, y / (h * 0.2));
      // the end cut is near vertical; vary its width with noise so it is not a ruled line
      const cut = w * 0.025 * (0.6 + 0.8 * (0.5 + 0.5 * noise1(sd + 200 + xx / 9)));
      return Math.max(0, y * Math.min(1, (w / 2 - Math.abs(xx - x)) / cut));
    };
    const top = [];
    for (let xx = x - w / 2; xx <= x + w / 2; xx += 3) top.push([xx, base - prof(xx)]);
    const P = pathOf(top.concat([[x + w / 2, base + 8], [x - w / 2, base + 8]]));
    erase(P);
    K.fill(P, 0.05 * A);
    K.fill(P, 0.06 * A, K.tint);
    const sgn = -light;
    K.clipped(P, () => {
      // the foot of the wall is darkest, where the rock goes under
      const g = c.createLinearGradient(0, base - h, 0, base + 8);
      g.addColorStop(0, K.ink(0.2 * A)); g.addColorStop(0.45, K.ink(0.17 * A)); g.addColorStop(1, K.ink(0.5 * A));
      c.fillStyle = g; c.fill(P);
      // one light direction across the whole massif, so the summit faces sit in a common key
      const lg = c.createLinearGradient(x + light * w / 2, 0, x - light * w / 2, 0);
      lg.addColorStop(0, K.ink(0)); lg.addColorStop(1, K.ink(0.1 * A));
      c.fillStyle = lg; c.fill(P);
      for (const t of tops) {
        if (t.h < h * 0.45) continue;
        // Shading that hugs the shoulder. Each band is one fill whose top edge is the
        // skyline itself and whose lower edge ramps away at both ends, so its only
        // visible boundaries slope down and inward; two overlapping bands put the
        // weight a little inside the summit on the side away from the light. Because
        // nothing here has a straight vertical edge, neighbouring summits merge.
        const ext = t.w * 1.2;
        const band = (f0, f1, depth, a0) => {
          const up = [], lo = [], ramp = (f1 - f0) * 0.42;
          for (let i = 0; i <= 44; i++) {
            const f = f0 + (f1 - f0) * (i / 44), xx = t.x + sgn * f * ext, yy = base - prof(xx);
            up.push([xx, yy]);
            lo.push([xx, yy + depth * Math.min(1, (f - f0) / ramp, (f1 - f) / ramp)]);
          }
          const yTop = Math.min(...up.map(q => q[1]));
          const gg = c.createLinearGradient(0, yTop, 0, yTop + depth);
          gg.addColorStop(0, K.ink(a0 * A)); gg.addColorStop(0.45, K.ink(a0 * 0.55 * A)); gg.addColorStop(1, K.ink(0));
          c.fillStyle = gg; c.fill(pathOf(up.concat(lo.reverse())));
        };
        band(-0.5, 1.05, t.h * 0.6, 0.24);
        band(-0.05, 0.8, t.h * 0.42, 0.26);
        // buttresses running off the summit
        for (let i = 0; i < 2 + Math.floor(r() * 2); i++) {
          const dir = r() < 0.5 ? -1 : 1, len = t.h * (0.55 + r() * 0.42), pts = [[t.x + (r() - 0.5) * t.w * 0.3, base - prof(t.x) + 3]];
          let px = pts[0][0], py = pts[0][1];
          for (let k = 0; k < 6; k++) { px += dir * t.w * (0.06 + r() * 0.08); py += len / 6; pts.push([px, py]); }
          dry(K.wobble(pts, 5, r), 4.5, 0.17 * A, r, 3, 0.1);
        }
      }
      for (let i = 0; i < Math.round(w / 26); i++) {
        const xx = x + (r() - 0.5) * w * 0.95, y0 = base - prof(xx) * (0.15 + r() * 0.7);
        const len = (base - y0) * (0.2 + r() * 0.55), sway = (r() - 0.5) * 18;
        dry(K.wobble([[xx, y0], [xx + sway * 0.5, y0 + len * 0.5], [xx + sway, y0 + len]], 7, r), 3 + r() * 5, (0.08 + r() * 0.16) * A, r, 3, -0.05);
      }
      // faint grain on the lit flanks, lying the way the buttresses run
      for (let i = 0; i < Math.round(w / 24); i++) {
        const xx = x + (r() - 0.5) * w * 0.92, y0 = base - prof(xx) * (0.3 + r() * 0.6);
        const len = h * (0.05 + r() * 0.13), tilt = Math.sign(xx - x || 1) * (0.2 + r() * 0.3);
        dry(K.wobble([[xx, y0], [xx + tilt * len * 0.5, y0 + len * 0.5], [xx + tilt * len, y0 + len]], 4, r), 2.6, 0.08 * A, r, 3, 0.05);
      }
      for (let i = 0; i < Math.round(h / 38); i++) {
        const xx = x + (r() - 0.5) * w * 0.9, y0 = base - prof(xx) * (0.2 + r() * 0.65), len = w * (0.06 + r() * 0.16);
        dry(K.wobble([[xx - len / 2, y0], [xx, y0 + (r() - 0.5) * 10], [xx + len / 2, y0 + (r() - 0.5) * 18]], 6, r), 2.2, 0.1 * A, r, 2, 0.25);
      }
    });
    // snow sits in patches on the high shoulders, never as a band
    for (const t of tops) {
      if (snow <= 0 || t.h < h * 0.55) continue;
      for (let i = 0; i < 1 + Math.floor(snow * 2.6); i++) {
        const cx = t.x + (r() - 0.5) * t.w * 0.8, half = t.w * (0.1 + r() * 0.2), deep = (8 + snow * 34) * (0.6 + r() * 0.7);
        const up = [], lo = [];
        for (let xx = cx - half; xx <= cx + half; xx += 3) {
          const f = Math.max(0, 1 - Math.pow(Math.abs(xx - cx) / half, 2)), yy = base - prof(xx);
          up.push([xx, yy]);
          lo.push([xx, yy + deep * f * (0.55 + 0.45 * noise1(sd + 30 + xx / 28))]);
        }
        if (up.length < 5) continue;
        erase(pathOf(up.concat(lo.slice().reverse())));
        brush(lo, 4, 0.75 * A, r, q => Math.sin(Math.PI * q), true, K.tint);
        K.wash(lo.concat(lo.slice().reverse().map(([bx, by]) => [bx, by + deep * 0.5])), 0.12 * A, r, 2, 1.5, K.tint);
      }
    }
    brush(top.filter((_, i) => i % 2 === 0), p.edge ?? 2, 0.68 * A, r, t => 0.45 + 0.55 * Math.sin(Math.PI * (0.03 + 0.94 * t)));
  },
  box: p => [p.x - p.width / 2 - 6, p.y - p.height * 1.15, p.x + p.width / 2 + 6, p.y + 12],
});

// ---------- waterfall: one thread of paper erased down a shadow face ----------
define('waterfall', {
  draw(K, r, p) {
    const { c, noise1, brush, erase } = K;
    const x = p.x, y = p.y, h = p.h, w = p.w ?? 3, A = p.alpha ?? 0.9;
    const drift = (r() - 0.5) * 0.05, sd = r() * 400;
    // the companion strand bows away from the main one and rejoins at both ends
    const line = bow => {
      const pts = [], n = 32;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        pts.push([x + drift * h * t + (noise1(sd + t * 3.5) * 1.6 + noise1(sd + 50 + t * 9) * 0.6) * w + bow * Math.sin(Math.PI * t) * w * 2, y + h * t]);
      }
      return pts;
    };
    const ribbon = (pts, wd0, wd1, a) => {
      c.save(); c.globalAlpha = a;
      erase(brush(pts, wd1, 1, r, t => (wd0 + (wd1 - wd0) * t) / wd1, false));
      c.restore();
    };
    const main = line(0);
    ribbon(main, w * 0.7, w * 1.7, A);
    ribbon(line(r() < 0.5 ? -0.9 : 0.9), w * 0.4, w * 0.85, A * 0.5);
    brush(main.map(([px, py]) => [px - w * 0.85, py]), 0.8, 0.18 * A, r, t => 0.3 + 0.7 * t, true, K.tint);
    const mid = main[Math.round(main.length * 0.55)];
    puff(K, mid[0], mid[1], w * 1.1, w * 0.5, 0.3 * A);
    const foot = main[main.length - 1];
    puff(K, foot[0], foot[1], w * 2, w * 0.9, 0.45 * A);
    for (let i = 0; i < 2; i++) {
      const yy = foot[1] + (1.6 + i * 2.2) * w, len = w * (5 - i * 1.6);
      K.dry([[foot[0] - len / 2, yy], [foot[0] + len / 2, yy]], w * 0.5, 0.16 * A, r, 2, 0.05, K.tint);
    }
  },
  box: p => { const w = p.w ?? 3; return [p.x - w * 6, p.y - 8, p.x + w * 6 + 0.05 * p.h, p.y + p.h + w * 8]; },
});

// ---------- rorbu: the red fisherman's hut on stilts, seen three-quarter on ----------
// `facing` is the direction the long wall runs away in; the gable end faces the other way.
define('rorbu', {
  draw(K, r, p) {
    const { c, brush, dry, erase, wobble } = K;
    const s = p.scale ?? 1, x = p.x, g = p.y, f = p.facing ?? 1, u = U * s;
    const Wg = 20 * u, Hw = 15 * u, Ls = 32 * u, dy = 5 * u, roofH = 10 * u, over = 3 * u, stilt = 9 * u;
    const floor = g - stilt, eave = floor - Hw;
    const wb = (pts, a = 1) => wobble(pts, a * u, r);
    const apex = [x - f * Wg / 2, eave - roofH];
    const gable = [[x, floor], [x - f * Wg, floor], [x - f * Wg, eave], apex, [x, eave]];
    const wall = [[x, floor], [x + f * Ls, floor - dy], [x + f * Ls, eave - dy], [x, eave]];
    const ridge = [x - f * (Wg / 2 + over * 0.6), eave - roofH], lip = [x + f * over, eave + over * 0.3];
    const roof = [ridge, [ridge[0] + f * Ls, ridge[1] - dy], [lip[0] + f * Ls, lip[1] - dy], lip];
    const barge = [x - f * (Wg + over), eave + over * 0.3];

    // reflection: mirrored about the waterline and squashed, then broken by ripples
    c.save(); c.translate(0, g * 1.65); c.scale(1, -0.65);
    K.fill(pathOf(wall), 0.1, K.accent); K.fill(pathOf(gable), 0.07, K.accent); K.fill(pathOf(roof), 0.07);
    c.restore();
    c.save(); c.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 12; i++) {
      const yy = g + (1.4 + i * 2.1) * u, half = (Wg + Ls) * (0.55 - i * 0.035);
      dry([[x - half, yy], [x + half, yy]], 1.4 * u, 0.6, r, 2, 0.05);
    }
    c.restore();

    // stilts down into the water, then the jetty on the gable side
    const baseAt = q => (q <= 0 ? [x + q * f * Wg, floor] : [x + q * f * Ls, floor - dy * q]);
    for (const q of [-0.78, -0.3, 0.18, 0.52, 0.88]) {
      const [sx, sy] = baseAt(q);
      brush(wb([[sx, sy - u], [sx + (r() - 0.5) * 1.6 * u, (sy + g) / 2], [sx + (r() - 0.5) * 2 * u, g + 2 * u]], 0.5), 1.3 * u, 0.72, r, t => 1 - 0.35 * t);
    }
    const j0 = x - f * Wg * 0.95, j1 = x - f * (Wg + 26 * u), jy = floor + stilt * 0.42;
    brush(wb([[j0, jy], [(j0 + j1) / 2, jy + 0.6 * u], [j1, jy + 0.3 * u]], 0.6), 1.7 * u, 0.8, r, t => 1 - 0.25 * t);
    for (const [q, dpt] of [[0.42, 1], [0.86, 0.72]]) {
      const px = j0 + (j1 - j0) * q;
      brush(wb([[px, jy], [px + (r() - 0.5) * 1.4 * u, g + 2.5 * u * dpt]], 0.5), 1 * u, 0.7, r, () => 1);
    }
    // a rowboat moored at the far post
    const bx = j1 - f * 3 * u, by = g + 1.5 * u, bl = 11 * u;
    const dinghy = wb(smooth([[bx - bl / 2, by - 1.5 * u], [bx + bl / 2, by - 1.8 * u], [bx + bl * 0.34, by + 1.1 * u], [bx - bl * 0.3, by + u]], true, 4), 0.35);
    erase(pathOf(dinghy)); K.fill(pathOf(dinghy), 0.62);

    erase(pathOf(wall)); erase(pathOf(gable)); erase(pathOf(roof)); erase(pathOf([apex, barge, [x - f * Wg, eave]]));
    // the long wall is turned away from the light, the gable end catches it
    K.fill(pathOf(wb(wall, 0.7)), 0.86, K.accent); K.fill(pathOf(wall), 0.17);
    K.fill(pathOf(wb(gable, 0.7)), 0.72, K.accent);
    for (let i = 0; i < 4; i++) {
      const t = 0.18 + i * 0.2, yy = eave + Hw * t;
      dry(wb([[x + 0.5 * u, yy], [x + f * Ls * 0.95, yy - dy * 0.95]], 0.5), 1.5 * u, 0.22, r, 2, 0.1);
      if (i < 2) dry(wb([[x - f * (Wg - u), yy], [x - f * u, yy]], 0.5), 1.4 * u, 0.18, r, 2, 0.1);
    }
    for (const [wx, wy, ww, wh] of [
      [x - f * Wg * 0.5, eave + Hw * 0.42, 4.6 * u, 5 * u],
      [x + f * Ls * 0.3, eave - dy * 0.3 + Hw * 0.42, 3.6 * u, 4.6 * u],
      [x + f * Ls * 0.64, eave - dy * 0.64 + Hw * 0.42, 3.4 * u, 4.4 * u],
    ]) {
      const q = wb([[wx - ww / 2, wy - wh / 2], [wx + ww / 2, wy - wh / 2], [wx + ww / 2, wy + wh / 2], [wx - ww / 2, wy + wh / 2]], 0.3);
      erase(pathOf(q));
      brush(q.concat([q[0]]), 0.75 * u, 0.62, r, () => 1);
    }
    // heavy roof: a dark wash, a brushed overhanging eave, a brushed ridge
    K.wash(wb(roof, 0.8), 0.78, r, 2, 0.7);
    brush(wb([roof[3], roof[2]], 0.5), 2.4 * u, 0.9, r, t => 1 - 0.15 * t);
    brush(wb([roof[0], roof[1]], 0.5), 1.8 * u, 0.85, r, t => 1 - 0.15 * t);
    brush(wb([apex, barge], 0.5), 2.2 * u, 0.88, r, t => 0.75 + 0.25 * t);
    brush(wb([apex, [x, eave + over * 0.2]], 0.5), 1.6 * u, 0.7, r, t => 0.8 + 0.2 * t);
    // corners and the sill line
    brush(wb([[x, eave], [x, floor]], 0.4), 1.1 * u, 0.6, r, () => 1);
    brush(wb([[x - f * Wg, eave], [x - f * Wg, floor]], 0.4), 0.9 * u, 0.5, r, () => 1);
    brush(wb([[x - f * Wg, floor], [x, floor], [x + f * Ls, floor - dy]], 0.4), 1.2 * u, 0.62, r, () => 1);
  },
  box: p => {
    const u = U * (p.scale ?? 1);
    return [p.x - 58 * u, p.y - 45 * u, p.x + 58 * u, p.y + 22 * u];
  },
});

// ---------- ferry: a small working boat, bow up, wheelhouse set back ----------
define('ferry', {
  draw(K, r, p) {
    const { c, brush, dab, dry, erase, wobble } = K;
    const s = p.scale ?? 1, x = p.x, y = p.y, d = p.facing ?? 1, u = U * s;
    const L = 40 * u, H = 4.6 * u;
    const wb = (pts, a = 0.5) => wobble(pts, a * u, r);
    const sheer = smooth([[x - d * L * 0.44, y - H * 0.65], [x - d * L * 0.1, y - H * 1.25], [x + d * L * 0.28, y - H * 1.6], [x + d * L * 0.5, y - H * 2.3]], false, 5);
    const bottom = smooth([[x + d * L * 0.48, y - H * 0.1], [x + d * L * 0.16, y + H * 0.62], [x - d * L * 0.18, y + H * 0.6], [x - d * L * 0.42, y + H * 0.02]], false, 5);
    const hull = wb(sheer.concat(bottom), 0.45);
    const bw = L * 0.32, bx = x - d * L * 0.12, bTop = y - H * 4.1, bBot = y - H * 1.3;
    const side = [[bx - d * bw / 2, bBot], [bx - d * bw / 2, bTop], [bx + d * bw / 2, bTop - H * 0.3], [bx + d * bw / 2, bBot - H * 0.3]];
    const rsx = bw * 0.18, rsy = H * 0.6;
    const roof = [side[1], [side[1][0] - d * rsx, side[1][1] - rsy], [side[2][0] - d * rsx, side[2][1] - rsy], side[2]];

    c.save(); c.translate(0, (y + H * 0.4) * 1.8); c.scale(1, -0.8);
    K.fill(pathOf(hull), 0.13); K.fill(pathOf(side), 0.07);
    c.restore();
    const wx = x - d * L * 0.44, wy = y + H * 0.3, run = 72 * u;
    for (const k of [-1, 1]) dry(wb([[wx, wy], [wx - d * run * 0.5, wy + k * run * 0.1], [wx - d * run, wy + k * run * 0.24]], 0.6), 1.8 * u, 0.26, r, 2, 0.1);
    c.save(); c.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 3; i++) { const yy = y + H * (1.3 + i * 1.2); dry([[x - L * 0.45, yy], [x + L * 0.4, yy]], 1.3 * u, 0.55, r, 2, 0.1); }
    c.restore();

    erase(pathOf(hull));
    K.wash(hull, 0.68, r, 2, 0.5);
    brush(wb(sheer, 0.4), 1.4 * u, 0.9, r, t => 0.7 + 0.5 * t);
    brush(wb(bottom, 0.4), 1 * u, 0.7, r, t => Math.sin(Math.PI * (0.15 + 0.7 * t)));
    dry(wb(sheer.map(([px, py]) => [px, py + H * 0.45]), 0.3), 1.1 * u, 0.3, r, 2, 0.1);
    erase(pathOf(side)); K.fill(pathOf(wb(side, 0.3)), 0.2);
    erase(pathOf(roof)); K.fill(pathOf(wb(roof, 0.3)), 0.62);
    brush(wb(side.concat([side[0]]), 0.3), 0.85 * u, 0.7, r, () => 1);
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      dab(bx - d * bw * (0.5 - t) * 0.92, bTop + H * (0.85 + (r() - 0.5) * 0.3) - t * H * 0.3, (0.9 + r() * 0.5) * u, (1.1 + r() * 0.4) * u, 0.72);
    }
    // funnel just abaft the wheelhouse, and a thin mast forward of it
    const fx = bx - d * bw * 0.42;
    brush(wb([[fx, roof[1][1]], [fx + d * 0.4 * u, roof[1][1] - H * 1.5]], 0.3), 2.2 * u, 0.82, r, () => 1);
    const mx = bx + d * bw * 0.34;
    brush(wb([[mx, roof[2][1]], [mx + d * 0.6 * u, roof[2][1] - H * 3.4]], 0.3), 0.8 * u, 0.8, r, t => 1 - 0.45 * t);
    brush([[mx - 2.2 * u, roof[2][1] - H * 2.4], [mx + 2.2 * u, roof[2][1] - H * 2.4]], 0.7 * u, 0.7, r, t => Math.sin(Math.PI * t));
  },
  box: p => {
    const u = U * (p.scale ?? 1);
    return [p.x - 70 * u, p.y - 30 * u, p.x + 70 * u, p.y + 20 * u];
  },
});
