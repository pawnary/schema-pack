// fastest but using A LOT of more memory
const keyBits = new Map();
let nextBit = 0n;

function getKeyBitMask(key: string): bigint {
  let bit = keyBits.get(key);

  if (bit === undefined) {
    bit = 1n << nextBit;
    keyBits.set(key, bit);
    nextBit++;
  }

  return bit;
}

export function tearDown(): void {
  keyBits.clear();
  nextBit = 0n;
}

export default function bitmaskWithCache(obj: Object): bigint {
  let id = 0n;

  for (const key of Object.keys(obj)) {
    id |= getKeyBitMask(key);
  }

  return id;
}
