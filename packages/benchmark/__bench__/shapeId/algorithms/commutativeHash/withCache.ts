const keyIds = new Map<string, number>();
let nextKeyId = 1;

const shapesByNumericHash = new Map<
  string,
  { id: number; keys: Set<string> }[]
>();
let nextNumericShapeId = 0;

function getKeyId(key: string): number {
  let id = keyIds.get(key);

  if (id === undefined) {
    id = nextKeyId++;
    keyIds.set(key, id);
  }

  return id;
}

export function tearDown() {
  keyIds.clear();
  shapesByNumericHash.clear();
  nextKeyId = 1;
  nextNumericShapeId = 0;
}

export default function commutativeHashWithCache(obj: Object): number {
  const keys = Object.keys(obj);

  let sum = 0;
  let xor = 0;
  let sumSquares = 0;

  for (const key of keys) {
    const keyId = getKeyId(key);

    sum = (sum + keyId) >>> 0;
    xor ^= keyId;
    sumSquares = (sumSquares + Math.imul(keyId, keyId)) >>> 0;
  }

  const hash = `${keys.length}:${sum}:${xor}:${sumSquares}`;

  let bucket = shapesByNumericHash.get(hash);

  if (!bucket) {
    const id = ++nextNumericShapeId;

    shapesByNumericHash.set(hash, [
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

  const id = ++nextNumericShapeId;

  bucket.push({
    id,
    keys: new Set(keys),
  });

  return id;
}
