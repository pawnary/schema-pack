import type MessagePackTextDecoder from '../interfaces/messagePackTextDecoder.ts';

class DefaultTextDecoder<
  TBuffer extends Uint8Array = Uint8Array,
> implements MessagePackTextDecoder<TBuffer> {
  protected textDecoder: TextDecoder;

  constructor() {
    this.textDecoder = new TextDecoder();
  }

  decode(buffer: TBuffer, start: number, end: number): string {
    return this.textDecoder.decode(buffer.subarray(start, end));
  }
}

export default DefaultTextDecoder;
