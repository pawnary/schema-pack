export default function byteToString(byte: number): string {
  return byte.toString().padStart(3, ' ');
}
