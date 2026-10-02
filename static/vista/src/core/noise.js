// 1D Perlin gradient noise and fractal sums of it.
import { mulberry32 } from './rng.js';

export function createNoise(seed) {
  const r = mulberry32(seed ^ 0x9e3779b9);
  const perm = new Uint8Array(512), grad = new Float32Array(256), p = [];
  for (let i = 0; i < 256; i++) { p.push(i); grad[i] = r() * 2 - 1; }
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  // Returns roughly -1..1. Fade curve 6t^5 - 15t^4 + 10t^3 hides the joins.
  function noise1(x) {
    const i = Math.floor(x), f = x - i, w = f * f * f * (f * (f * 6 - 15) + 10);
    const a = grad[perm[i & 255]] * f, b = grad[perm[(i + 1) & 255]] * (f - 1);
    return (a + (b - a) * w) * 2;
  }
  // Fractal Brownian motion: each octave doubles frequency, halves height.
  function fbm(x, oct = 4) {
    let s = 0, a = 1, n = 0;
    for (let k = 0; k < oct; k++) { s += noise1(x + k * 31.7) * a; n += a; a *= 0.5; x *= 2.03; }
    return s / n;
  }
  return { noise1, fbm };
}
