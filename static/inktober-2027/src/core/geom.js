// Curves and shapes. Points are [x, y] arrays.
export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;

// Quadratic Bezier: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
export function qbez(p0, p1, p2, n = 8) {
  const o = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, m = 1 - t;
    o.push([m * m * p0[0] + 2 * m * t * p1[0] + t * t * p2[0], m * m * p0[1] + 2 * m * t * p1[1] + t * t * p2[1]]);
  }
  return o;
}

// Catmull-Rom spline through every point.
export function smooth(P, closed = false, seg = 6) {
  const o = [], n = P.length;
  const g = i => (closed ? P[(i + n) % n] : P[clamp(i, 0, n - 1)]);
  const lim = closed ? n : n - 1;
  for (let i = 0; i < lim; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    for (let k = 0; k < seg; k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t;
      const f = j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
      o.push([f(0), f(1)]);
    }
  }
  if (!closed) o.push(P[n - 1]);
  return o;
}

// Ellipse as points, optionally rotated and roughened by a noise function.
export function ellipsePts(cx, cy, rx, ry, rot = 0, n = 22, noise = null, sd = 0, j = 0) {
  const o = [], cs = Math.cos(rot), sn = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, k = 1 + (noise ? j * noise(sd + i * 0.6) : 0);
    const ex = Math.cos(a) * rx * k, ey = Math.sin(a) * ry * k;
    o.push([cx + ex * cs - ey * sn, cy + ex * sn + ey * cs]);
  }
  return o;
}

export function pathOf(pts, close = true) {
  const P = new Path2D();
  P.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) P.lineTo(pts[i][0], pts[i][1]);
  if (close) P.closePath();
  return P;
}
