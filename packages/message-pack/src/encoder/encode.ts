import EncoderBuffer from './encoderBuffer.ts';

const sharedEncoderBuffer = new EncoderBuffer();

export default function encode(value: unknown): Uint8Array {
  sharedEncoderBuffer.write(value);

  return sharedEncoderBuffer.flush();
}
