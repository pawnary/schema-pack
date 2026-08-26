import type { Buffer } from 'node:buffer';

import type MessagePackTextDecoder from '../interfaces/messagePackTextDecoder.ts';

class NodeTextDecoder implements MessagePackTextDecoder<Buffer> {
  decode(buffer: Buffer, start: number, end: number): string {
    return buffer.toString('utf8', start, end);
  }
}

export default NodeTextDecoder;
