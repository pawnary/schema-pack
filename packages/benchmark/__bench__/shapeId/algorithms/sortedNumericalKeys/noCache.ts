let nextKeyIdFast = 1;
let nextShapeIdFast = 0;

function getKeyIdFast(_key: string): number {
  const id = nextKeyIdFast++;

  return id;
}

export function tearDown(): void {
  nextKeyIdFast = 1;
  nextShapeIdFast = 0;
}

export default function sortedNumericalKeysNoCache(obj: Object): number {
  const keys = Object.keys(obj);
  const ids = new Array<number>(keys.length);

  for (let i = 0; i < keys.length; i++) {
    ids[i] = getKeyIdFast(keys[i]);
  }

  ids.sort((a, b) => a - b);

  const shapeId = ++nextShapeIdFast;

  return shapeId;
}
