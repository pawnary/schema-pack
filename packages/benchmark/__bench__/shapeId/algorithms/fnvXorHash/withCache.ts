function hashKey(key: string): number {
  let hash = 2166136261;

  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

const shapes = new Map<number, { id: number; keys: Set<string> }[]>();
let nextId = 0;

export function tearDown() {
  shapes.clear();
  nextId = 0;
}

export default function fnvXorHashWithCache(obj: Object): number {
  const keys = Object.keys(obj);

  let hash = 0;

  for (const key of keys) {
    hash ^= hashKey(key);
  }

  let bucket = shapes.get(hash);

  if (!bucket) {
    const id = ++nextId;

    shapes.set(hash, [
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

  const id = ++nextId;

  bucket.push({
    id,
    keys: new Set(keys),
  });

  return id;
}
