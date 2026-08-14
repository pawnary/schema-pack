export default function fitIn8Bits(length: number): boolean {
  return length < 0x100; // 256
}
