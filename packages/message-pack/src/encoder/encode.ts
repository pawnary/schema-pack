import Encoder from './encoder.ts';

const sharedEncoder = new Encoder();

export default function encode(value: unknown): Uint8Array {
  sharedEncoder.write(value);

  return sharedEncoder.flush();
}
