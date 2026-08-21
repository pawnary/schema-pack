let nextKeyId = 1;

let nextNumericShapeId = 0;

function getKeyId(_key: string): number {
  const id = nextKeyId++;

  return id;
}

export function tearDown() {
  nextKeyId = 1;
  nextNumericShapeId = 0;
}

export default function commutativeHashNoCache(obj: Object): number {
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

  const id = ++nextNumericShapeId;

  return id;
}
