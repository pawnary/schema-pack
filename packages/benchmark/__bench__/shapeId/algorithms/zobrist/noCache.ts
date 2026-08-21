let nextZobristShapeId = 0;

function randomUint32(): number {
  return (Math.random() * 0x100000000) >>> 0;
}

function getKeyToken(_key: string): number {
  const token = randomUint32();

  return token;
}

export function tearDown() {
  nextZobristShapeId = 0;
}

export default function zobristNoCache(obj: Object): number {
  const keys = Object.keys(obj);

  let hash = 0;

  for (const key of keys) {
    hash ^= getKeyToken(key);
  }

  const id = ++nextZobristShapeId;

  return id;
}
