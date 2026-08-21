import type MessagePackTextDecoder from './messagePackTextDecoder.ts';

export default interface MessagePackDecoderBuffer<
  TBuffer extends Uint8Array = Uint8Array,
> {
  view: DataView;
  buffer: TBuffer;
  textDecoder: MessagePackTextDecoder;
  offset: number;

  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters
  nextValue<TValue = unknown>(): TValue;
}
