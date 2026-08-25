import DecoderBuffer from './decoderBuffer.ts';

const sharedDecoderBuffer = new DecoderBuffer();

export default function decode<TValue = unknown>(buffer: Uint8Array): TValue {
  sharedDecoderBuffer.setBuffer(buffer);

  return sharedDecoderBuffer.nextValue<TValue>();
}
