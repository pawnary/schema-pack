import Decoder from './decoder.ts';

const sharedDecoder = new Decoder();

export default function decode<TValue = unknown>(buffer: Uint8Array): TValue {
  sharedDecoder.setBuffer(buffer);

  return sharedDecoder.nextValue<TValue>();
}
