import type MessagePackTextEncoder from '../interfaces/messagePackTextEncoder.ts';

class NodeTextEncoder implements MessagePackTextEncoder {
  writeBytes(value: string, buffer: Buffer): number {
    return Buffer.prototype.utf8Write.call(buffer, value, 0, buffer.length);
  }
}

export default NodeTextEncoder;
