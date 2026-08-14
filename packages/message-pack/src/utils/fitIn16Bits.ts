export default function fitIn16Bits(length: number): boolean {
  return length < 0x10000; // 65536
}
