import byteToString from './byteToString.ts';

const STRING_DEBUG_BYTES_PAD = 3;
const STRING_DEBUG_BYTES_PAD_THRESHOLD = STRING_DEBUG_BYTES_PAD * 2;

export default function bytesToString(
  buffer: Uint8Array,
  startOffset: number,
  endOffset: number,
  depth: number,
): string {
  let totalBytes = endOffset - startOffset;
  let bytes = ' '.repeat(depth);

  if (totalBytes > STRING_DEBUG_BYTES_PAD_THRESHOLD) {
    const startBytes = buffer.slice(
      startOffset,
      startOffset + STRING_DEBUG_BYTES_PAD,
    );

    for (const byte of startBytes) {
      bytes += `${byteToString(byte)} `;
    }

    bytes += '... ';

    const lastBytes = buffer.slice(
      endOffset - STRING_DEBUG_BYTES_PAD,
      endOffset,
    );

    for (const byte of lastBytes) {
      bytes += `${byteToString(byte)} `;
    }
  } else if (totalBytes === 0) {
    const byte = buffer[startOffset];

    bytes += `${byteToString(byte)} `;
  } else {
    const byteSlice = buffer.slice(startOffset, endOffset);

    for (const byte of byteSlice) {
      bytes += `${byteToString(byte)} `;
    }
  }

  return bytes;
}
