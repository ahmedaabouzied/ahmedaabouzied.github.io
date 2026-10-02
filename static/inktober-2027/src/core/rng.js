// Seeded randomness. Same seed in, same numbers out, on every machine.

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function strHash(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Mix any number of ints/strings into one 32-bit seed.
export function hash(...keys) {
  let h = 2166136261 >>> 0;
  for (const k of keys) {
    const v = typeof k === 'string' ? strHash(k) : k | 0;
    h ^= v; h = Math.imul(h, 16777619); h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  }
  return h >>> 0;
}

export const rngFor = (...keys) => mulberry32(hash(...keys));
