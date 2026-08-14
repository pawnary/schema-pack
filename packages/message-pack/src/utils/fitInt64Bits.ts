export default function fitInt64Bits(value: number | bigint): boolean {
  return value <= Number.MAX_SAFE_INTEGER;
}
