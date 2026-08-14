import type MessagePackTextDecoder from '../interfaces/messagePackTextDecoder.ts';

class DefaultTextDecoder implements MessagePackTextDecoder {
  protected textDecoder: TextDecoder;

  constructor() {
    this.textDecoder = new TextDecoder();
  }

  decode(buffer: Uint8Array, start: number, end: number): string {
    return this.textDecoder.decode(buffer.subarray(start, end));
  }
}

export default DefaultTextDecoder;
