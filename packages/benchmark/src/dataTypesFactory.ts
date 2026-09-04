// oxlint-disable sort-keys unicorn/no-array-fill-with-reference-type

const dataTypesFactory = {
  // MessagePack types, without extensions
  positiveFixint: () => 0,
  fixmap: () => {
    const map: RecordLike = {};

    for (let index = 0; index < 15; index++) {
      map[`key-${index}`] = `value-${index}`;
    }

    return map;
  },
  fixarray: (): unknown[] =>
    new Array(15)
      .fill('aaa', 0, 3)
      .fill(111, 3, 6)
      .fill(true, 6, 9)
      .fill(false, 9, 12)
      .fill(null, 12, 13)
      .fill({ first: 1, second: 2, third: 3 }, 13, 15),
  fixstr: () => 'a'.repeat(15) + '🔥'.repeat(4), // (15 + 16) bytes = 31 bytes with 19 length
  nil: () => null,
  false: () => false,
  true: () => true,
  bin8: () => new Uint8Array(255).fill(1),
  bin16: () => new Uint8Array(65_535).fill(1),
  bin32: () => new Uint8Array(65_536).fill(1),
  float32: () => 12_345.15625, // without loss precision
  float64: () => -12_345.67891,
  uint8: () => 255,
  uint16: () => 65_535,
  uint32: () => 4_294_967_295,
  uint64: () => Number.MAX_SAFE_INTEGER,
  int8: () => -33,
  int16: () => -129,
  int32: () => -32_769,
  int64: () => Number.MIN_SAFE_INTEGER,
  str8: () => '🔥'.repeat(64), // 255 bytes with 64 length
  str16: () => 'a'.repeat(128) + '🔥'.repeat(32), // (128 + 128) bytes = 256 bytes with 160 length
  str32: () => 'a'.repeat(32_768) + '🔥'.repeat(8192), // (32768 + 32768) bytes = 65536 bytes with 40960 length
  array16: (): unknown[] =>
    new Array(65_535)
      .fill('aaa', 0, 10_922)
      .fill(11, 10_922, 10_922 * 2)
      .fill(true, 10_922 * 2, 10_922 * 3)
      .fill(false, 10_922 * 3, 10_922 * 4)
      .fill(null, 10_922 * 4, 10_922 * 5)
      .fill({ first: 1, second: 2, third: 3 }, 10_922 * 5, 65_535),
  array32: (): unknown[] =>
    new Array(65_536)
      .fill('aaa', 0, 10_922)
      .fill(11, 10_922, 10_922 * 2)
      .fill(true, 10_922 * 2, 10_922 * 3)
      .fill(false, 10_922 * 3, 10_922 * 4)
      .fill(null, 10_922 * 4, 10_922 * 5)
      .fill({ first: 1, second: 2, third: 3 }, 10_922 * 5, 65_536),
  map16: () => {
    const map: RecordLike = {};

    for (let index = 0; index < 65_535; index++) {
      map[`key-${index}`] = `value-${index}`;
    }

    return map;
  },
  map32: () => {
    const map: RecordLike = {};

    for (let index = 0; index < 65_536; index++) {
      map[`key-${index}`] = `value-${index}`;
    }

    return map;
  },
  negativeFixint: () => -1,

  // JavaScript types
  undefined: (): undefined => undefined,
  bigint8: (): bigint => -(1n << 7n),
  bigint16: (): bigint => -(1n << 15n),
  bigint32: (): bigint => -(1n << 31n),
  bigint64: (): bigint => -(1n << 63n),
  bigint96: (): bigint => -(1n << 95n),
  bigint128: (): bigint => -(1n << 127n),
  bigint256: (): bigint => -(1n << 255n),
  bigUint8: (): bigint => (1n << 8n) - 1n,
  bigUint16: (): bigint => (1n << 16n) - 1n,
  bigUint32: (): bigint => (1n << 32n) - 1n,
  bigUint64: (): bigint => (1n << 64n) - 1n,
  bigUint96: (): bigint => (1n << 96n) - 1n,
  bigUint128: (): bigint => (1n << 128n) - 1n,
  bigUint256: (): bigint => (1n << 256n) - 1n,
} as const;

export type RecordLike = Record<string | number, unknown>;

export default dataTypesFactory;
