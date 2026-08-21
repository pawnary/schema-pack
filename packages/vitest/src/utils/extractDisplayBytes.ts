export default function extractDisplayBytes(
  received: Uint8Array | number[],
  startOffset = 0,
  endOffset = 10,
): string {
  if (received.length === 0) {
    return 'empty bytes';
  }

  if (received.length > endOffset) {
    let trimmedStart: string;
    let trimmedEnd: string;

    if (received instanceof Uint8Array) {
      trimmedStart = received.subarray(startOffset, endOffset).toString();
      trimmedEnd = received
        .subarray(received.length - endOffset, received.length)
        .toString();
    } else {
      trimmedStart = received.slice(startOffset, endOffset).toString();
      trimmedEnd = received.slice(received.length - endOffset).toString();
    }

    return `Bytes(${trimmedStart},...,${trimmedEnd})`;
  }

  return `Bytes(${received.toString()})`;
}
