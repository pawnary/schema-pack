import type { Chunk } from '../types.ts';
import bytesToString from './bytesToString.ts';
import byteToString from './byteToString.ts';

/**
 * output a chunk as a string, including its children and additional bytes.
 *
 * E.G.:
 *
 * JSON value:
 *
 * ```json
 * {
 *   "a": 1,
 *   "b": 2
 * }
 * ```
 *
 * MessagePack bytes:
 *
 * ```
 * 130 161 97 1 161 98 2
 * ```
 *
 * Output:
 *
 * ```
 * 130 - Message pack fix map flag (128) of length 2
 *   161 - Map key: Message pack fix string flag (160) of length 1
 *         97  - "a"
 *     1 - Map value: Message pack fix positive int: 1
 *   161 - Map key: Message pack fix string flag (160) of length 1
 *         98  - "b"
 *     2 - Map value: Message pack fix positive int: 2
 * ```
 */
export default function chunkToString(
  buffer: Uint8Array,
  chunk: Chunk,
  depth = 0,
): string {
  let output = `${'  '.repeat(depth)}${byteToString(chunk.flag)} - ${chunk.description}\n`;

  const newDepth = depth + 1;

  if (chunk.additionalBytes) {
    for (const additionalByte of chunk.additionalBytes) {
      output += `${bytesToString(buffer, additionalByte.startOffset, additionalByte.endOffset + 1, newDepth)} - ${additionalByte.description}\n`;
    }
  }

  if (chunk.informationBytes) {
    output += `${bytesToString(buffer, chunk.informationBytes.startOffset, chunk.informationBytes.endOffset + 1, newDepth + 9)} - ${chunk.informationBytes.description}\n`;
  }

  if (chunk.children) {
    for (const child of chunk.children) {
      output += `${chunkToString(buffer, child, newDepth)}`;
    }
  }

  return output;
}
