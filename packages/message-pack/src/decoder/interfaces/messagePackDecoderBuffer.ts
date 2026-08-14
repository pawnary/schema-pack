import type MessagePackTextDecoder from './messagePackTextDecoder.ts';

export default interface MessagePackDecoderBuffer<
  TBuffer extends Uint8Array = Uint8Array,
> {
  view: DataView;
  buffer: TBuffer;
  textDecoder: MessagePackTextDecoder;
  offset: number;

  nextValue<T = unknown>(): T;
}
