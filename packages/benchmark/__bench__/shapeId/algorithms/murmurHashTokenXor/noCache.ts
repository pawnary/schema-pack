import { murmurNumeredKeyHash } from '../murmurHash/algorithm.ts';

let nextToken = 1;
let nextTokenShapeId = 0;

function getKeyTokenXor(_key: string): number {
  const token = murmurNumeredKeyHash(nextToken++);

  return token;
}

export function tearDown(): void {
  nextToken = 1;
  nextTokenShapeId = 0;
}

export default function murmurHashTokenXorNoCache(obj: Object): number {
  const keys = Object.keys(obj);

  let hash = 0;

  for (const key of keys) {
    hash ^= getKeyTokenXor(key);
  }

  const id = ++nextTokenShapeId;

  return id;
}
