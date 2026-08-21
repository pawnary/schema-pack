import { fmix32NumeredKeyHash } from './algorithm.ts';

const keyTokenExact = new Map<string, number>();
const exactShapes = new Map<number, { id: number; keys: string[] }[]>();

let nextTokenExact = 1;
let nextExactShapeId = 0;

function getKeyTokenExact(key: string): number {
  let token = keyTokenExact.get(key);

  if (token === undefined) {
    token = fmix32NumeredKeyHash(nextTokenExact++);
    keyTokenExact.set(key, token);
  }

  return token;
}

function sameKeysUnordered(a: string[], b: string[]): boolean {
  for (let i = 0; i < a.length; i++) {
    if (!b.includes(a[i])) return false;
  }

  return true;
}

export function tearDown(): void {
  keyTokenExact.clear();
  exactShapes.clear();
  nextTokenExact = 1;
  nextExactShapeId = 0;
}

export default function fmix32WithCache(obj: Object): number {
  const keys = Object.keys(obj);

  let hash = keys.length;

  for (let i = 0; i < keys.length; i++) {
    hash = (hash + getKeyTokenExact(keys[i])) >>> 0;
  }

  let bucket = exactShapes.get(hash);

  if (bucket === undefined) {
    const id = ++nextExactShapeId;

    exactShapes.set(hash, [
      {
        id,
        keys,
      },
    ]);

    return id;
  }

  for (let i = 0; i < bucket.length; i++) {
    const shape = bucket[i];

    if (shape.keys.length !== keys.length) continue;

    if (sameKeysUnordered(keys, shape.keys)) {
      return shape.id;
    }
  }

  const id = ++nextExactShapeId;

  bucket.push({
    id,
    keys,
  });

  return id;
}
