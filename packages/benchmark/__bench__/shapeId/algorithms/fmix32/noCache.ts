import { fmix32NumeredKeyHash } from './algorithm.ts';

let nextTokenExact = 1;
let nextExactShapeId = 0;

function getKeyTokenExact(_key: string): number {
  const token = fmix32NumeredKeyHash(nextTokenExact++);

  return token;
}

export function tearDown(): void {
  nextTokenExact = 1;
  nextExactShapeId = 0;
}

export default function fmix32NoCache(obj: Object): number {
  const keys = Object.keys(obj);

  let hash = keys.length;

  for (let i = 0; i < keys.length; i++) {
    hash = (hash + getKeyTokenExact(keys[i])) >>> 0;
  }

  const id = ++nextExactShapeId;

  return id;
}
