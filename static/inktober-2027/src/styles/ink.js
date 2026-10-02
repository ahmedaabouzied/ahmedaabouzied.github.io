// Ink-wash style: how strokes, dabs and washes land on the paper.
// Objects never touch colors directly; they ask the style for ink(a), tint(a), accent(a).
import { TAU, clamp, pathOf } from '../core/geom.js';

const rgba = ([r, g, b]) => a => `rgba(${r},${g},${b},${a})`;

export function createInk(c, noise, palette = {}) {
  const { noise1 } = noise;
  const ink = rgba(palette.ink || [29, 26, 22]);
  const tint = rgba(palette.tint || [146, 104, 50]);
  const accent = rgba(palette.accent || [176, 57, 42]);

  const wobble = (pts, amt, r) => {
    const sd = r() * 500;
    return pts.map((p, i) => [p[0] + noise1(sd + i * 0.45) * amt, p[1] + noise1(sd + 77 + i * 0.45) * amt]);
  };

  // Tapered stroke: offset each point along its normal by w(t)/2. Returns the outline.
  function brush(pts, w, a, r, prof, fill = true, col = ink, iOff = 0) {
    const n = pts.length;
    if (n < 2) return new Path2D();
    const sd = r() * 500, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const o = pts[Math.max(0, i - 1)], q = pts[Math.min(n - 1, i + 1)];
      let dx = q[0] - o[0], dy = q[1] - o[1];
      const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const t = i / (n - 1);
      const p = prof ? prof(t) : Math.pow(Math.sin(Math.PI * (0.1 + 0.8 * t)), 0.5);
      const ww = w * p * (0.8 + 0.2 * noise1(sd + (i + iOff) * 0.4)) * 0.5;
      L.push([pts[i][0] - dy * ww, pts[i][1] + dx * ww]);
      R.push([pts[i][0] + dy * ww, pts[i][1] - dx * ww]);
    }
    const P = pathOf(L.concat(R.reverse()));
    if (fill) { c.fillStyle = col(a); c.fill(P); }
    return P;
  }

  // Dry brush: parallel bristle lines that break where noise dips below thr.
  function dry(pts, w, a, r, br = 5, thr = -0.15, col = ink) {
    const sd = r() * 900, n = pts.length;
    c.lineWidth = Math.max(0.35, (w / br) * 1.15);
    for (let b = 0; b < br; b++) {
      const off = (br === 1 ? 0 : b / (br - 1) - 0.5) * w;
      c.strokeStyle = col(a * (0.55 + 0.45 * r()));
      c.beginPath();
      let on = false;
      for (let i = 0; i < n; i++) {
        const o = pts[Math.max(0, i - 1)], q = pts[Math.min(n - 1, i + 1)];
        const dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1;
        const x = pts[i][0] - (dy / d) * off, y = pts[i][1] + (dx / d) * off;
        if (noise1(sd + b * 13.7 + i * 0.55) > thr) { if (!on) { c.moveTo(x, y); on = true; } else c.lineTo(x, y); }
        else on = false;
      }
      c.stroke();
    }
  }

  function dab(x, y, rx, ry, a, rot = 0, col = ink) {
    c.beginPath();
    c.ellipse(x, y, Math.max(0.2, rx), Math.max(0.2, ry), rot, 0, TAU);
    c.fillStyle = col(a); c.fill();
  }
  function soft(x, y, rx, ry, a, col = ink) {
    for (let k = 0; k < 3; k++) { const f = 1 - k * 0.25; dab(x, y, rx * f, ry * f, a / 3, 0, col); }
  }
  // Wash: several faint, slightly shifted fills; edges come out soft.
  function wash(pts, a, r, passes = 3, jit = 2, col = ink) {
    const P = pathOf(pts);
    c.fillStyle = col(a / passes);
    for (let k = 0; k < passes; k++) { c.save(); c.translate((r() - 0.5) * jit, (r() - 0.5) * jit); c.fill(P); c.restore(); }
    return P;
  }
  // Erase back to paper (for occlusion: near things hide far things).
  function erase(P) {
    c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; c.fill(P); c.restore();
  }
  function fill(P, a, col = ink) { c.fillStyle = col(a); c.fill(P); }
  function outline(P, w, a, col = ink) { c.strokeStyle = col(a); c.lineWidth = w; c.stroke(P); }
  function clipped(P, fn) { c.save(); c.clip(P); fn(); c.restore(); }

  // Mist: erase ink with a soft vertical gradient; noise varies the strength along x.
  function mist(x0, x1, y, hh, k, off, wave = 260, patch = 0, drift = 0) {
    const gr = c.createLinearGradient(0, y - hh, 0, y + hh);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.55, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = gr;
    const st = 4;
    for (let x = Math.floor(x0 / st) * st; x < x1; x += st) {
      const v = noise1(x / wave + off);
      const f = patch ? clamp(((v + 1) / 2) * (1 + patch * 2) - patch, 0, 1) : 0.6 + 0.5 * v;
      c.globalAlpha = clamp(k * f, 0, 1);
      const dy = drift ? noise1(x / (wave * 0.6) + off + 9) * hh * drift : 0;
      c.save(); c.translate(0, dy); c.fillRect(x, y - hh, st + 0.5, hh * 2); c.restore();
    }
    c.restore();
  }

  return { c, noise1, fbm: noise.fbm, ink, tint, accent, wobble, brush, dry, dab, soft, wash, erase, fill, outline, clipped, mist };
}
