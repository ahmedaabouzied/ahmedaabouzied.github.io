// Scene files -> a fixed list of objects -> paint.
//
// A scene file is JSON: size, seed, palette, a depth rule, and layers painted back to front.
// Each layer holds hand-placed `objects` and/or `scatter` rules. Scatter is seeded, so it gives
// the same result on every load. `edits` (keyed by object id) remove, reroll or move any object;
// that is how a scene gets curated into a good, fixed state.
import { getType } from './objects/registry.js';
import { hash, rngFor } from './core/rng.js';
import { createNoise } from './core/noise.js';
import { clamp } from './core/geom.js';
import { createInk } from './styles/ink.js';

// Depth: maps a ground y to a drawing scale (things shrink toward the horizon).
export function makeScaleAt(depth = {}) {
  const hz = depth.horizon ?? 500, near = depth.near ?? 1000, sFar = depth.sFar ?? 0.2, sNear = depth.sNear ?? 1.38, pw = depth.power ?? 1.3;
  return y => {
    const f = clamp((y - hz) / (near - hz), 0, 1.2);
    const z = Math.pow(clamp((f - 0.025) / 0.96, 0, 1.2), 1 / pw);
    return sFar + (sNear - sFar) * z;
  };
}

// Density modifiers for scatter weights, driven by a slow noise wave d in 0..1 (woodland vs open plain).
const MOD = { dense2: d => 0.25 + 1.6 * d * d, dense: d => 0.3 + d, open: d => 1.35 - d, openSoft: d => 1.2 - 0.6 * d };

function pickFrom(r, table) {
  // table: [[value, weight], ...]
  let roll = r() * table.reduce((s, t) => s + t[1], 0);
  for (const t of table) { if (roll < t[1]) return t; roll -= t[1]; }
  return table[table.length - 1];
}

function scatter(scene, L, rule, ri, noise, scaleAt) {
  const out = [], cs = rule.cell, [xa, xb] = rule.x ?? [0, scene.width];
  for (let ci = Math.floor(xa / cs); ci < Math.ceil(xb / cs); ci++) {
    const r = rngFor(scene.seed, L.id, ri, ci);
    const x = (ci + r()) * cs;
    if (x < xa || x > xb) continue;
    const d = clamp(0.5 + 0.75 * noise.noise1(x / (rule.regionScale ?? 2600) + 101.3), 0, 1);
    let roll = r(), type = null;
    for (const [k, v] of Object.entries(rule.pick)) {
      const [w0, mod] = Array.isArray(v) ? v : [v];
      const w = w0 * (mod ? MOD[mod](d) : 1);
      if (roll < w) { type = k; break; }
      roll -= w;
    }
    if (!type) continue;
    const y = rule.y[0] + r() * (rule.y[1] - rule.y[0]);
    const o = { id: `${L.id}.${type}.${ci}`, type, x, y, scale: scaleAt(y) * (0.85 + r() * 0.3), ...(rule.params?.[type] ?? {}) };
    if (rule.tufts && type !== 'herd' && type !== 'animal') o.tufts = rule.tufts;
    if (type === 'acacia') o.big = rule.bigChance ? r() < rule.bigChance : false;
    if (type === 'herd' || type === 'animal') {
      const [kind, , [n0, n1]] = pickFrom(r, type === 'herd' ? rule.herds : rule.animals);
      Object.assign(o, { type: 'herd', kind, n: n0 + Math.floor(r() * (n1 - n0 + 1)), band: rule.band ?? 10 });
    }
    out.push(o);
  }
  return out;
}

export function expand(scene) {
  const scaleAt = makeScaleAt(scene.depth);
  const noise = createNoise(scene.seed);
  const edits = scene.edits ?? {};
  const layers = [];
  for (const L of scene.layers) {
    const objs = (L.objects ?? []).map((o, i) => ({ ...o, id: o.id ?? `${L.id}.${o.type}.${i}` }));
    (L.scatter ?? []).forEach((rule, ri) => objs.push(...scatter(scene, L, rule, ri, noise, scaleAt)));
    const out = [];
    for (const o of objs) {
      const e = edits[o.id];
      if (e?.remove) continue;
      const m = { ...o, ...(e ?? {}) };
      if (m.scale == null && m.y != null) m.scale = scaleAt(m.y);
      if (m.seed == null) m.seed = hash(scene.seed, m.id);
      const def = getType(m.type);
      if (!def) { console.warn(`vista: unknown object type "${m.type}" (${m.id})`); continue; }
      m._order = m.order ?? def.order ?? 0;
      m._box = def.box(m);
      out.push(m);
    }
    if (L.sort !== false) out.sort((a, b) => a._order - b._order || (a.y ?? 0) - (b.y ?? 0) || (a.x ?? 0) - (b.x ?? 0));
    else out.sort((a, b) => a._order - b._order);
    layers.push({ id: L.id, objects: out });
  }
  // global draw order, so a renderer can split the painting around moving objects
  let gi = 0;
  for (const L of layers) for (const o of L.objects) { o._i = gi++; o._layer = L.id; }
  return { scene, layers, scaleAt, noise };
}

// Paint the scene-space strip [x0, x1] into ctx. The caller sets the transform.
// { skipMoving: true } leaves out objects with a `motion` block, so a caller can animate them on top.
// { from, to } paints only objects whose draw-order index o._i is in [from, to).
export function renderRegion(ctx, ex, x0, x1, { skipMoving = false, from = 0, to = Infinity } = {}) {
  const K = createInk(ctx, ex.noise, ex.scene.palette);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const env = { x0, x1, scaleAt: ex.scaleAt, scene: ex.scene };
  for (const L of ex.layers) for (const o of L.objects) {
    if ((skipMoving && o.motion) || o._i < from || o._i >= to) continue;
    const b = o._box;
    if (b[2] < x0 || b[0] > x1) continue;
    getType(o.type).draw(K, rngFor(o.seed), o, env);
  }
}

export const movingObjects = ex => ex.layers.flatMap(L => L.objects.filter(o => o.motion));

// Where a moving object is at time t (seconds). motion: { path: [[x,y],...], speed, bob, row }.
// It walks the path at `speed` scene units per second, then turns back (ping-pong).
export function poseAt(o, t) {
  const m = o.motion, P = m.path, segs = [];
  let total = 0;
  for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); segs.push(l); total += l; }
  const run = (t * (m.speed ?? 10)) % (2 * total), back = run > total;
  let dist = back ? 2 * total - run : run, i = 0;
  while (i < segs.length - 1 && dist > segs[i]) dist -= segs[i++];
  const f = dist / segs[i], a = P[i], b = P[i + 1];
  const dir = Math.sign(b[0] - a[0]) * (back ? -1 : 1) || 1;
  return {
    x: a[0] + (b[0] - a[0]) * f,
    y: a[1] + (b[1] - a[1]) * f + Math.sin(t * 1.3) * (m.bob ?? 0),
    facing: dir,
    row: m.row ? t * m.row : undefined,
    step: m.step ? t * m.step : undefined,
    wake: m.wake ?? 0,
  };
}

export function drawObject(ctx, ex, o, x0, x1, patch = {}) {
  const K = createInk(ctx, ex.noise, ex.scene.palette);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  getType(o.type).draw(K, rngFor(o.seed), { ...o, ...patch }, { x0, x1, scaleAt: ex.scaleAt, scene: ex.scene });
}
