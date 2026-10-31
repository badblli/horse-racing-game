/** A source of uniformly distributed numbers in [0, 1). */
export type Rng = () => number

/** Mulberry32: small, fast and good enough for a game; the same seed gives the same sequence. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Derives the seed of a named stream such as `roster` or `round:2:4`.
 * Each stream is independent, so drawing from one never shifts another.
 */
export function deriveSeed(seed: number, stream: string): number {
  // FNV-1a over the seed and stream name, then MurmurHash3's finaliser to spread the bits.
  const key = `${seed >>> 0}:${stream}`
  let hash = 0x811c9dc5
  for (let i = 0; i < key.length; i++) {
    hash = Math.imul(hash ^ key.charCodeAt(i), 0x01000193)
  }
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b)
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35)
  return (hash ^ (hash >>> 16)) >>> 0
}

/** A fresh session seed from the platform's cryptographic generator. */
export function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0
}

/** An integer in [min, max], both inclusive. */
export function randomInt(rng: Rng, min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new RangeError(`Invalid integer range [${min}, ${max}]`)
  }
  return min + Math.floor(rng() * (max - min + 1))
}

/** `count` distinct items in random order, without changing `items`. */
export function sampleWithoutReplacement<T>(items: readonly T[], count: number, rng: Rng): T[] {
  if (!Number.isInteger(count) || count < 0 || count > items.length) {
    throw new RangeError(`Cannot sample ${count} of ${items.length} items`)
  }
  // Partial Fisher–Yates: only the first `count` positions are shuffled.
  const pool = [...items]
  for (let i = 0; i < count; i++) {
    const j = randomInt(rng, i, pool.length - 1)
    const picked = pool[j] as T
    pool[j] = pool[i] as T
    pool[i] = picked
  }
  return pool.slice(0, count)
}

/** A shuffled copy of `items`. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  return sampleWithoutReplacement(items, items.length, rng)
}
