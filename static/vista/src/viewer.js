// Viewer page: pick a scene, scroll it sideways, inspect objects to curate them.
import { loadScene, mount, paperTexture } from './vista.js';

const scroller = document.getElementById('scroller');
const nav = document.getElementById('nav');
const inspect = document.getElementById('inspect');
const $ = id => document.getElementById(id);

let scenes = [], current = null, scene = null, debug = false, view = null;

// A scene is released on its date, at midnight in the viewer's own time zone.
const today = new Date(); today.setHours(0, 0, 0, 0);
const released = s => !s.date || new Date(s.date + 'T00:00') <= today;
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

async function start() {
  const all = await (await fetch('scenes/index.json', { cache: 'no-store' })).json();
  scenes = all.filter(released);
  for (const s of scenes) {
    const b = document.createElement('button');
    b.textContent = s.name; b.dataset.id = s.id;
    b.addEventListener('click', () => open(s.id));
    nav.appendChild(b);
  }
  const dbg = document.createElement('button');
  dbg.id = 'debug'; dbg.textContent = 'Show objects'; dbg.setAttribute('aria-pressed', 'false');
  dbg.addEventListener('click', () => { debug = !debug; dbg.setAttribute('aria-pressed', String(debug)); if (!debug) inspect.hidden = true; draw(true); });
  nav.appendChild(dbg);
  $('next').addEventListener('click', () => { const i = scenes.findIndex(s => s.id === current); if (i < scenes.length - 1) open(scenes[i + 1].id); });
  const want = (location.hash || '').slice(1);
  await open(scenes.some(s => s.id === want) ? want : scenes[scenes.length - 1].id);
}

async function open(id) {
  current = id;
  scene = await loadScene(`scenes/${id}.json`);
  for (const b of nav.querySelectorAll('button[data-id]')) b.setAttribute('aria-pressed', String(b.dataset.id === id));
  $('title').textContent = scene.name;
  $('desc').textContent = scene.description ?? '';
  const d = scene.date ? new Date(scene.date + 'T00:00') : null;
  $('seal').replaceChildren(Object.assign(document.createElement('span'), { textContent: d ? MONTH[d.getMonth()] : 'seed' }), Object.assign(document.createElement('b'), { textContent: d ? d.getDate() : scene.seed }));
  $('next').hidden = scenes.findIndex(s => s.id === id) >= scenes.length - 1;
  document.documentElement.style.setProperty('--paper', scene.paper ?? '#ebe3cf');
  document.title = `${scene.name} · Vista`;
  try { history.replaceState(null, '', '#' + id); } catch (e) { /* sandboxed */ }
  inspect.hidden = true;
  scroller.scrollLeft = 0;
  draw(false);
}

function draw(keepScroll) {
  const ratio = keepScroll && view ? scroller.scrollLeft / Math.max(1, view.width) : 0;
  view = mount(scroller, scene, { debug, onPick: show });
  const strip = scroller.firstElementChild;
  strip.style.backgroundImage = `url(${paperTexture(scene.paper)})`;
  scroller.scrollLeft = ratio * view.width;
}

function show(o) {
  const params = Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('_') && k !== 'id'));
  const reroll = (o.seed * 2654435761 + 7) >>> 0;
  const snippets = {
    remove: `"${o.id}": { "remove": true }`,
    reroll: `"${o.id}": { "seed": ${reroll} }`,
  };
  inspect.innerHTML = `
    <h2>${o.id}</h2>
    <dl><dt>type</dt><dd>${o.type}</dd><dt>x, y</dt><dd>${Math.round(o.x ?? 0)}, ${Math.round(o.y ?? 0)}</dd>
    <dt>scale</dt><dd>${(o.scale ?? 1).toFixed(3)}</dd><dt>seed</dt><dd>${o.seed}</dd></dl>
    <p>Paste one of these into the scene file's "edits" to fix this object, or tell Claude its id.</p>
    <pre id="snip">${snippets.reroll}</pre>
    <div class="row">
      <button data-k="reroll">Reroll</button><button data-k="remove">Remove</button><button id="copy">Copy</button><button id="close">Close</button>
    </div>
    <details><summary style="font-size:11px;cursor:pointer">All params</summary><pre>${JSON.stringify(params, null, 1)}</pre></details>`;
  inspect.hidden = false;
  inspect.querySelectorAll('button[data-k]').forEach(b => b.addEventListener('click', () => { $('snip').textContent = snippets[b.dataset.k]; }));
  $('copy').addEventListener('click', async () => {
    const text = $('snip').textContent;
    try { await navigator.clipboard.writeText(text); $('copy').textContent = 'Copied'; }
    catch { const r = document.createRange(); r.selectNodeContents($('snip')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); $('copy').textContent = 'Selected'; }
  });
  $('close').addEventListener('click', () => { inspect.hidden = true; });
}

// vertical wheel scrolls sideways; drag to pan
scroller.addEventListener('wheel', e => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { scroller.scrollLeft += e.deltaY * (e.deltaMode === 1 ? 16 : 1); e.preventDefault(); }
}, { passive: false });
let dragX = null, startLeft = 0, moved = false;
scroller.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; dragX = e.clientX; startLeft = scroller.scrollLeft; moved = false; });
addEventListener('pointermove', e => { if (dragX == null) return; const dx = e.clientX - dragX; if (Math.abs(dx) > 3) { moved = true; scroller.classList.add('drag'); } scroller.scrollLeft = startLeft - dx; });
addEventListener('pointerup', () => { dragX = null; scroller.classList.remove('drag'); });
scroller.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
addEventListener('keydown', e => {
  if (e.target.closest('button')) return;
  if (e.key === 'ArrowRight') scroller.scrollBy({ left: 160 });
  if (e.key === 'ArrowLeft') scroller.scrollBy({ left: -160 });
});
let rt = 0;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => scene && draw(true), 150); });
addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id !== current && scenes.some(s => s.id === id)) open(id); });

start().catch(err => { scroller.innerHTML = `<p style="padding:120px 16px;font-size:13px">Could not load the scene: ${err.message}</p>`; });
