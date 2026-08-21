function hashKey(key: string): number {
  let hash = 2166136261;

  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

let nextId = 0;

export function tearDown() {
  nextId = 0;
}

export default function fnvXorHashNoCache(obj: Object): number {
  const keys = Object.keys(obj);

  let hash = 0;

  for (const key of keys) {
    hash ^= hashKey(key);
  }

  const id = ++nextId;

  return id;
}
