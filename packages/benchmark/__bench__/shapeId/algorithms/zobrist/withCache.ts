const keyTokens = new Map<string, number>();
const shapesByZobristHash = new Map<
  number,
  { id: number; keys: Set<string> }[]
>();

let nextZobristShapeId = 0;

function randomUint32(): number {
  return (Math.random() * 0x100000000) >>> 0;
}

function getKeyToken(key: string): number {
  let token = keyTokens.get(key);

  if (token === undefined) {
    token = randomUint32();
    keyTokens.set(key, token);
  }

  return token;
}

export function tearDown() {
  keyTokens.clear();
  shapesByZobristHash.clear();
  nextZobristShapeId = 0;
}

export default function zobristWithCache(obj: Object): number {
  const keys = Object.keys(obj);

  let hash = 0;

  for (const key of keys) {
    hash ^= getKeyToken(key);
  }

  let bucket = shapesByZobristHash.get(hash);

  if (!bucket) {
    const id = ++nextZobristShapeId;

    shapesByZobristHash.set(hash, [
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

  const id = ++nextZobristShapeId;

  bucket.push({
    id,
    keys: new Set(keys),
  });

  return id;
}
