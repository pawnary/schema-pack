export default function fitIn16Bits(length: number): boolean {
  return length < 0x1_00_00; // 65536
}
