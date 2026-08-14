export default function fitIn32Bits(length: number): boolean {
  return length < 0x100000000; // 4294967296
}
