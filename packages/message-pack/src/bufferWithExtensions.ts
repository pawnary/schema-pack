import type MessagePackExtension from './extensions/interfaces/messagePackExtension.ts';
import type MessagePackBufferWithExtensions from './interfaces/messagePackBufferWithExtensions.ts';

abstract class BufferWithExtensions<
  TBuffer extends Uint8Array = Uint8Array,
> implements MessagePackBufferWithExtensions<TBuffer> {
  protected extensions: Map<number, MessagePackExtension<unknown, TBuffer>>;

  constructor() {
    this.extensions = new Map();
  }

  addExtension(extension: MessagePackExtension<unknown, TBuffer>): this {
    if (this.extensions.has(extension.type)) {
      throw new Error(`Extension with type ${extension.type} already exists`);
    }

    if (extension.type < 0) {
      throw new Error(
        `Extension type must be a non-negative integer, got ${extension.type}. Extensions between -128 and -1 are reserved for internal use. Use addInternalExtension() to register an internal extension.`,
      );
    }

    if (extension.type > 127) {
      throw new Error(
        `Extension type must be in the range 0 to 127, got ${extension.type}`,
      );
    }

    this.extensions.set(extension.type, extension);

    return this;
  }

  addInternalExtension(
    extension: MessagePackExtension<unknown, TBuffer>,
  ): this {
    if (this.extensions.has(extension.type)) {
      throw new Error(`Extension with type ${extension.type} already exists`);
    }

    if (extension.type >= 0) {
      throw new Error(
        `Internal extension type must be a negative integer, got ${extension.type}. Use addExtension() to register a custom extension.`,
      );
    }

    if (extension.type < -128) {
      throw new Error(
        `Internal extension type must be in the range -128 to -1, got ${extension.type}`,
      );
    }

    this.extensions.set(extension.type, extension);

    return this;
  }

  fetchExtension(type: number): MessagePackExtension<unknown, TBuffer> {
    const extension = this.extensions.get(type);

    if (!extension) {
      throw new Error(`Extension with type ${type} not found`);
    }

    return extension;
  }
}

export default BufferWithExtensions;
