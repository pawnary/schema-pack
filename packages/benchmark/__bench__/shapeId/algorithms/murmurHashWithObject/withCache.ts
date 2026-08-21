/**
 * Variation of the murmurHash algorithm that uses a raw object as cache store
 * instead of a Map.
 */
import { murmurNumeredKeyHash } from '../murmurHash/algorithm.ts';

let keyTokenExact: Record<string, number> = {};
let exactShapes: Record<number, { id: number; keys: string[] }[]> = {};

let nextTokenExact = 1;
let nextExactShapeId = 0;

function getKeyTokenExact(key: string): number {
  if (key in keyTokenExact) {
    return keyTokenExact[key];
  }

  const token = murmurNumeredKeyHash(nextTokenExact++);

  keyTokenExact[key] = token;

  return token;
}

function sameKeysUnordered(a: string[], b: string[]): boolean {
  for (let i = 0; i < a.length; i++) {
    if (!b.includes(a[i])) return false;
  }

  return true;
}

export function tearDown(): void {
  keyTokenExact = {};
  exactShapes = {};
  nextTokenExact = 1;
  nextExactShapeId = 0;
}

export default function murmurHashWithObjectWithCache(obj: Object): number {
  const keys = Object.keys(obj);

  let hash = keys.length;

  for (let i = 0; i < keys.length; i++) {
    hash = (hash + getKeyTokenExact(keys[i])) >>> 0;
  }

  if (hash in exactShapes) {
    const bucket = exactShapes[hash];

    for (let i = 0; i < bucket.length; i++) {
      const shape = bucket[i];

      if (shape.keys.length !== keys.length) continue;

      if (sameKeysUnordered(keys, shape.keys)) {
        return shape.id;
      }
    }
  }

  const id = ++nextExactShapeId;

  if (hash in exactShapes) {
    exactShapes[hash].push({
      id,
      keys,
    });
  } else {
    exactShapes[hash] = [
      {
        id,
        keys,
      },
    ];
  }

  return id;

  // let bucket = exactShapes[hash];

  // if (bucket === undefined) {
  //   const id = ++nextExactShapeId;

  //   exactShapes[hash] = [{
  //     id,
  //     keys,
  //   }];

  //   return id;
  // }

  // for (let i = 0; i < bucket.length; i++) {
  //   const shape = bucket[i];

  //   if (shape.keys.length !== keys.length) continue;

  //   if (sameKeysUnordered(keys, shape.keys)) {
  //     return shape.id;
  //   }
  // }

  // const id = ++nextExactShapeId;

  // bucket.push({
  //   id,
  //   keys,
  // });

  // return id;
}
