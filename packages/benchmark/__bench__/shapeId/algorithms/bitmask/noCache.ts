let nextBit = 0n;

function getKeyBitMask(_key: string): bigint {
  const bit = 1n << nextBit;

  nextBit++;

  return bit;
}

export function tearDown(): void {
  nextBit = 0n;
}

export default function bitmaskNoCache(obj: Object): bigint {
  let id = 0n;

  for (const key of Object.keys(obj)) {
    id |= getKeyBitMask(key);
  }

  return id;
}
