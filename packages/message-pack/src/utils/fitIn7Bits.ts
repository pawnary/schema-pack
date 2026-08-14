export default function fitIn7Bits(length: number): boolean {
  return length < 0x80; // 128
}
