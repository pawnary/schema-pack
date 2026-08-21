export default function fitIn32Bits(length: number): boolean {
  return length < 0x1_00_00_00_00; // 4294967296
}
