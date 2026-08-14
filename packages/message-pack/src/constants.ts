/**
 * JavaScript numbers are stored as IEEE 754 double precision floating point
 * numbers, which means that they can only safely represent max uint64 as:
 *
 * 2^53 - 1 = 9007199254740991, or Number.MAX_SAFE_INTEGER.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
 */
export const UINT64_MAX = Number.MAX_SAFE_INTEGER;

/**
 * JavaScript numbers are stored as IEEE 754 double precision floating point
 * numbers, which means that they can only safely represent min int64 as:
 *
 * -(2^53 - 1) = -9007199254740991, or Number.MIN_SAFE_INTEGER.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MIN_SAFE_INTEGER
 */
export const INT64_MIN = Number.MIN_SAFE_INTEGER;

/**
 * 4294967295
 */
export const UINT32_MAX = ~0 >>> 0;

/**
 * -2147483648
 */
export const INT32_MIN = -0x80000000;
