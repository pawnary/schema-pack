const keyIds = new Map<string, number>();
const shapesByKeyIds = new Map<string, number>();

let nextKeyId = 1;
let nextShapeId = 0;

function getKeyId(key: string): number {
  let id = keyIds.get(key);

  if (id === undefined) {
    id = nextKeyId++;
    keyIds.set(key, id);
  }

  return id;
}

export function tearDown(): void {
  keyIds.clear();
  shapesByKeyIds.clear();
  nextKeyId = 1;
  nextShapeId = 0;
}

export default function sortedNumericalKeysWithCache(obj: Object): number {
  const keys = Object.keys(obj);
  const ids = new Array<number>(keys.length);

  for (let i = 0; i < keys.length; i++) {
    ids[i] = getKeyId(keys[i]);
  }

  ids.sort((a, b) => a - b);

  const signature = ids.join('');

  let shapeId = shapesByKeyIds.get(signature);

  if (shapeId === undefined) {
    shapeId = ++nextShapeId;
    shapesByKeyIds.set(signature, shapeId);
  }

  return shapeId;
}
