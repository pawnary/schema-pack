import type MessagePackExtension from '../extensions/interfaces/messagePackExtension.ts';
import DecoderBuffer from './decoderBuffer.ts';

// export function isArrayBufferLike(buffer: unknown): buffer is ArrayBufferLike {
//   return (
//     buffer instanceof ArrayBuffer || (typeof SharedArrayBuffer !== "undefined" && buffer instanceof SharedArrayBuffer)
//   );
// }

class Decoder<TBuffer extends Uint8Array = Uint8Array> {
  protected decoderBuffer: DecoderBuffer;

  constructor() {
    this.decoderBuffer = new DecoderBuffer();
  }

  // decode<T extends any = unknown>(value: ArrayLike<number> | ArrayBufferView | ArrayBufferLike): T {
  decode<T = unknown>(encodedBuffer: Uint8Array): T {
    // if (value instanceof Uint8Array) {
    //   this.buffer = value;
    // } else if (ArrayBuffer.isView(value)) {
    //   this.buffer = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    // } else if (isArrayBufferLike(value)) {
    //   this.buffer = new Uint8Array(value, 0, value.byteLength);
    // } else {
    //   this.buffer = Uint8Array.from(value);
    // }
    const decoderBuffer = this.decoderBuffer;

    // decoderBuffer.buffer = encodedBuffer;
    // decoderBuffer.offset = 0;
    // decoderBuffer.view = new DataView(encodedBuffer.buffer, encodedBuffer.byteOffset, encodedBuffer.byteLength);
    decoderBuffer.setBuffer(encodedBuffer);

    return decoderBuffer.nextValue<T>();
  }

  addExtension(extension: MessagePackExtension<unknown, TBuffer>): this {
    this.decoderBuffer.addExtension(extension);

    return this;
  }

  addInternalExtension(
    extension: MessagePackExtension<unknown, TBuffer>,
  ): this {
    this.decoderBuffer.addInternalExtension(extension);

    return this;
  }

  addExtensionType(
    type: number,
    extension: Omit<MessagePackExtension<unknown, TBuffer>, 'type'>,
  ): this {
    this.decoderBuffer.addExtension(Object.assign({ type }, extension));

    return this;
  }
}

export default Decoder;
