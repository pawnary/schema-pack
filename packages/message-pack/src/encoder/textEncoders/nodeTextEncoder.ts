import type MessagePackTextEncoder from '../interfaces/messagePackTextEncoder.ts';

class NodeTextEncoder implements MessagePackTextEncoder {
  writeBytes(value: string, buffer: Buffer): number {
    // oxlint-disable-next-line typescript/no-unsafe-return typescript/no-unsafe-call typescript/no-unsafe-member-access
    return Buffer.prototype.utf8Write.call(buffer, value, 0, buffer.length);
  }
}

export default NodeTextEncoder;
