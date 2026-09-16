import type MessagePackTextDecoder from './messagePackTextDecoder.ts';

export default interface MessagePackDecoder<
  TBuffer extends Uint8Array = Uint8Array,
> {
  view: DataView;
  buffer: TBuffer;
  textDecoder: MessagePackTextDecoder<TBuffer>;
  offset: number;
  nextValue<TValue = unknown>(): TValue;
}
