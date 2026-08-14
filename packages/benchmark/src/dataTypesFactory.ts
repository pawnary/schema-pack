export type RecordLike = Record<string | number, unknown>;

const dataTypesFactory = {
  // MessagePack types, without extensions
  positiveFixint: () => 0,
  fixmap: () => {
    const map: RecordLike = {};

    for (let i = 0; i < 15; i++) {
      map[`key-${i}`] = `value-${i}`;
    }

    return map;
  },
  fixarray: () =>
    new Array(15)
      .fill('aaa', 0, 3)
      .fill(111, 3, 6)
      .fill(true, 6, 9)
      .fill(false, 9, 12)
      .fill(null, 12, 13)
      .fill({ a: 1, b: 2, c: 3 }, 13, 15),
  fixstr: () => 'a'.repeat(15) + '🔥'.repeat(4), // (15 + 16) bytes = 31 bytes with 19 length
  nil: () => null,
  false: () => false,
  true: () => true,
  bin8: () => new Uint8Array(255).fill(1),
  bin16: () => new Uint8Array(65535).fill(1),
  bin32: () => new Uint8Array(65536).fill(1),
  float32: () => 1234.56789,
  float64: () => 1234.5678901234567,
  uint8: () => 255,
  uint16: () => 65535,
  uint32: () => 4294967295,
  uint64: () => Number.MAX_SAFE_INTEGER,
  int8: () => -33,
  int16: () => -129,
  int32: () => -32769,
  int64: () => Number.MIN_SAFE_INTEGER,
  str8: () => '🔥'.repeat(64), // 255 bytes with 64 length
  // TODO: set str8 to 200 bytes with 50 length?
  // str8: () => 'é'.repeat(50), // 100 bytes with 50 length
  str16: () => 'a'.repeat(128) + '🔥'.repeat(32), // (128 + 128) bytes = 256 bytes with 160 length
  str32: () => 'a'.repeat(32768) + '🔥'.repeat(8192), // (32768 + 32768) bytes = 65536 bytes with 40960 length
  array16: () =>
    new Array(65535)
      .fill('aaa', 0, 10922)
      .fill(11, 10922, 10922 * 2)
      .fill(true, 10922 * 2, 10922 * 3)
      .fill(false, 10922 * 3, 10922 * 4)
      .fill(null, 10922 * 4, 10922 * 5)
      .fill({ a: 1, b: 2, c: 3 }, 10922 * 5, 65535),
  array32: () =>
    new Array(65536)
      .fill('aaa', 0, 10922)
      .fill(11, 10922, 10922 * 2)
      .fill(true, 10922 * 2, 10922 * 3)
      .fill(false, 10922 * 3, 10922 * 4)
      .fill(null, 10922 * 4, 10922 * 5)
      .fill({ a: 1, b: 2, c: 3 }, 10922 * 5, 65536),
  map16: () => {
    const map: RecordLike = {};

    for (let i = 0; i < 65535; i++) {
      map[`key-${i}`] = `value-${i}`;
    }

    return map;
  },
  map32: () => {
    const map: RecordLike = {};

    for (let i = 0; i < 65536; i++) {
      map[`key-${i}`] = `value-${i}`;
    }

    return map;
  },
  negativeFixint: () => -1,

  // JavaScript types
  undefined: () => undefined,
  // bigint: () => (1234n << 1234n) ^ (5678n << 567n) ^ 890n,
  // bigint65: () => 9223372036854775807n, // 2^63 - 1
} as const;

export default dataTypesFactory;
