// Every object type registers a draw function and a rough bounding box.
// draw(K, r, p, env): K = style toolkit, r = this object's own seeded random,
//   p = the object's params from the scene file, env = { x0, x1, scaleAt, scene }.
// box(p) -> [left, top, right, bottom] in scene units, used for culling and the debug overlay.
const types = new Map();

export function define(type, def) {
  if (types.has(type)) throw new Error(`vista: object type "${type}" is defined twice`);
  if (!def.box) def.box = () => [-Infinity, -Infinity, Infinity, Infinity];
  types.set(type, def);
}
export const getType = t => types.get(t);
export const typeNames = () => [...types.keys()];
