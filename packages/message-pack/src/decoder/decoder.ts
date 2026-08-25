import type MessagePackExtension from '../extensions/interfaces/messagePackExtension.ts';
import DecoderBuffer from './decoderBuffer.ts';
import type { DecoderBufferOptions } from './types.ts';

class Decoder<TBuffer extends Uint8Array = Uint8Array> {
  protected decoderBuffer: DecoderBuffer<TBuffer>;

  constructor(options?: DecoderBufferOptions<TBuffer>) {
    this.decoderBuffer = new DecoderBuffer(options);
  }

  decode<TValue = unknown>(encodedBuffer: TBuffer): TValue {
    const decoderBuffer = this.decoderBuffer;

    decoderBuffer.setBuffer(encodedBuffer);

    return decoderBuffer.nextValue<TValue>();
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
    this.decoderBuffer.addExtension({ type, ...extension });

    return this;
  }
}

export default Decoder;
