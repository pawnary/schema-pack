export default function fitIn8Bits(length: number): boolean {
  return length < 0x1_00; // 256
}
