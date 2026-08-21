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
  float32: () => 1234.56789,
  float64: () => 1234.5678901234567,
  uint8: () => 255,
  uint16: () => 65_535,
  uint32: () => 4_294_967_295,
  uint64: () => Number.MAX_SAFE_INTEGER,
  int8: () => -33,
  int16: () => -129,
  int32: () => -32_769,
  int64: () => Number.MIN_SAFE_INTEGER,
  str8: () => '🔥'.repeat(64), // 255 bytes with 64 length
  // oxlint-disable-next-line no-warning-comments
  // TODO: set str8 to 200 bytes with 50 length?
  // str8: () => 'é'.repeat(50), // 100 bytes with 50 length
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
  // oxlint-disable-next-line no-undefined
  undefined: (): undefined => undefined,
} as const;

export type RecordLike = Record<string | number, unknown>;

export default dataTypesFactory;
