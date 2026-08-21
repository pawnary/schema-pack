import { murmurNumeredKeyHash } from '../murmurHash/algorithm.ts';

// variation of murmur hash algorith using XOR operation to generate shape hash
const keyTokensXor = new Map<string, number>();
const shapesByTokenHash = new Map<
  number,
  { id: number; keys: Set<string> }[]
>();

let nextToken = 1;
let nextTokenShapeId = 0;

function getKeyTokenXor(key: string): number {
  let token = keyTokensXor.get(key);

  if (token === undefined) {
    token = murmurNumeredKeyHash(nextToken++);
    keyTokensXor.set(key, token);
  }

  return token;
}

export function tearDown(): void {
  keyTokensXor.clear();
  shapesByTokenHash.clear();
  nextToken = 1;
  nextTokenShapeId = 0;
}

export default function murmurHashTokenXorWithCache(obj: Object): number {
  const keys = Object.keys(obj);

  let hash = 0;

  for (const key of keys) {
    hash ^= getKeyTokenXor(key);
  }

  let bucket = shapesByTokenHash.get(hash);

  if (!bucket) {
    const id = ++nextTokenShapeId;

    shapesByTokenHash.set(hash, [
      {
        id,
        keys: new Set(keys),
      },
    ]);

    return id;
  }

  for (const shape of bucket) {
    if (shape.keys.size !== keys.length) continue;

    let same = true;

    for (const key of keys) {
      if (!shape.keys.has(key)) {
        same = false;
        break;
      }
    }

    if (same) {
      return shape.id;
    }
  }

  const id = ++nextTokenShapeId;

  bucket.push({
    id,
    keys: new Set(keys),
  });

  return id;
}
