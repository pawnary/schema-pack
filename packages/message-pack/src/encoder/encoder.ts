import type MessagePackExtension from '../extensions/interfaces/messagePackExtension.ts';
import EncoderBuffer from './encoderBuffer.ts';
import type { EncoderBufferOptions } from './types.ts';

/**
 * The `Encoder` class is responsible for encoding JavaScript values into the
 * MessagePack format.
 *
 * This class is just a wrapper around the buffer, which does the actual
 * encoding. The buffer is responsible for managing the encoding process and
 * handling extensions.
 */
class Encoder<TBuffer extends Uint8Array = Uint8Array> {
  buffer: EncoderBuffer<TBuffer>;

  constructor(options?: Partial<EncoderBufferOptions<TBuffer>>) {
    this.buffer = new EncoderBuffer<TBuffer>(options);
  }

  encode(value: unknown): TBuffer {
    const buffer = this.buffer;

    buffer.write(value);

    return buffer.flush();
  }

  addExtension(extension: MessagePackExtension<unknown, TBuffer>): this {
    this.buffer.addExtension(extension);

    return this;
  }

  addInternalExtension(
    extension: MessagePackExtension<unknown, TBuffer>,
  ): this {
    this.buffer.addInternalExtension(extension);

    return this;
  }

  addExtensionType(
    type: number,
    extension: Omit<MessagePackExtension<unknown, TBuffer>, 'type'>,
  ): this {
    this.buffer.addExtension({ type, ...extension });

    return this;
  }

  fetchExtension(type: number): MessagePackExtension<unknown, TBuffer> {
    return this.buffer.fetchExtension(type);
  }
}

export default Encoder;
