// Vista: paint scenes in math. Public entry point.
import './objects/common.js';
import './objects/savanna.js';
import './objects/alps.js';
import './objects/guilin.js';
import './objects/highlands.js';
import './objects/sahara.js';
import './objects/fjord.js';
import './objects/tuscany.js';
import { expand, renderRegion } from './scene.js';
import { mulberry32 } from './core/rng.js';
import { typeNames } from './objects/registry.js';

export { expand, renderRegion, typeNames };

export async function loadScene(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load scene ${url} (${res.status})`);
  return res.json();
}

// Rice-paper texture as a seamless tile (data URL).
export function paperTexture(base = '#ebe3cf', size = 360) {
  const t = document.createElement('canvas'); t.width = t.height = size;
  const p = t.getContext('2d'), r = mulberry32(77);
  p.fillStyle = base; p.fillRect(0, 0, size, size);
  for (let i = 0; i < 70; i++) {
    const x = r() * size, y = r() * size, R = 20 + r() * 70, a = r() * 0.035;
    const g = p.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, r() < 0.5 ? `rgba(120,95,55,${a})` : `rgba(255,250,235,${a * 1.6})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    p.fillStyle = g;
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) { p.save(); p.translate(ox, oy); p.fillRect(x - R, y - R, 2 * R, 2 * R); p.restore(); }
  }
  for (let i = 0; i < 900; i++) {
    const x = r() * size, y = r() * size, l = 2 + r() * 9, a = r() * Math.PI * 2;
    p.strokeStyle = r() < 0.6 ? `rgba(90,70,40,${0.04 + r() * 0.06})` : `rgba(255,252,240,${0.15 + r() * 0.2})`;
    p.lineWidth = 0.4 + r() * 0.5; p.beginPath(); p.moveTo(x, y);
    p.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + r() * 2, y + Math.sin(a) * l * 0.5 + r() * 2, x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke();
  }
  return t.toDataURL('image/png');
}

const TILE = 768;   // css px per tile
const MARGIN = 64;  // css px painted past each tile edge, then cropped (keeps seams clean)

function paintTile(canvas, ex, i, s, dpr, cssH) {
  const w = canvas.width, h = canvas.height;
  const off = document.createElement('canvas');
  off.width = w + 2 * MARGIN * dpr; off.height = h;
  const ctx = off.getContext('2d');
  const left = (i * TILE - MARGIN) / s;
  ctx.setTransform(s * dpr, 0, 0, s * dpr, -left * s * dpr, 0);
  renderRegion(ctx, ex, left, left + off.width / (s * dpr));
  const tc = canvas.getContext('2d');
  tc.clearRect(0, 0, w, h);
  tc.drawImage(off, MARGIN * dpr, 0, w, h, 0, 0, w, h);
}

// Paint the whole scene into one canvas at a given pixel height (for exports and review).
export function renderFull(scene, height = 700, { dpr = 1 } = {}) {
  const ex = expand(scene), s = height / scene.height;
  const cv = document.createElement('canvas');
  cv.width = Math.round(scene.width * s * dpr); cv.height = Math.round(height * dpr);
  const ctx = cv.getContext('2d');
  ctx.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
  renderRegion(ctx, ex, 0, scene.width);
  return { canvas: cv, ex, scale: s };
}

// Mount a scrolling panorama into `root` (which must have a height).
// Options: debug (show object ids and boxes), onPick(obj) when a box is clicked.
export function mount(root, scene, opts = {}) {
  root.innerHTML = '';
  const ex = expand(scene);
  const cssH = root.clientHeight, s = cssH / scene.height, totalW = Math.round(scene.width * s);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const strip = document.createElement('div');
  strip.className = 'vista-strip';
  Object.assign(strip.style, { position: 'relative', width: totalW + 'px', height: cssH + 'px' });
  root.appendChild(strip);
  const tiles = [];
  for (let i = 0; i * TILE < totalW; i++) {
    const cw = Math.min(TILE, totalW - i * TILE), cv = document.createElement('canvas');
    cv.width = Math.round(cw * dpr); cv.height = Math.round(cssH * dpr);
    Object.assign(cv.style, { position: 'absolute', left: i * TILE + 'px', top: 0, width: cw + 'px', height: cssH + 'px' });
    strip.appendChild(cv);
    tiles.push({ i, cv, done: false });
  }
  const paint = t => { if (!t.done) { paintTile(t.cv, ex, t.i, s, dpr, cssH); t.done = true; } };
  const visible = () => {
    const a = root.scrollLeft, b = a + root.clientWidth;
    return tiles.filter(t => t.i * TILE < b + TILE && (t.i + 1) * TILE > a - TILE);
  };
  visible().forEach(paint);
  let timer = 0;
  const later = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const next = visible().find(t => !t.done) || tiles.find(t => !t.done);
      if (next) { paint(next); later(); }
    }, 16);
  };
  root.addEventListener('scroll', () => { visible().forEach(paint); later(); }, { passive: true });
  later();

  if (opts.debug) {
    const layer = document.createElement('div');
    layer.className = 'vista-debug';
    Object.assign(layer.style, { position: 'absolute', inset: 0 });
    strip.appendChild(layer);
    for (const L of ex.layers) for (const o of L.objects) {
      const [l, t, rr, b] = o._box;
      if (!isFinite(l) || !isFinite(t)) continue;
      const el = document.createElement('button');
      el.className = 'vista-box';
      el.title = o.id;
      Object.assign(el.style, { left: l * s + 'px', top: t * s + 'px', width: (rr - l) * s + 'px', height: (b - t) * s + 'px' });
      el.innerHTML = `<span>${o.id}</span>`;
      el.addEventListener('click', () => opts.onPick && opts.onPick(o));
      layer.appendChild(el);
    }
  }
  return { ex, scale: s, width: totalW };
}
