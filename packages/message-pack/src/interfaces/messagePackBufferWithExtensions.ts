import type MessagePackExtension from '../extensions/interfaces/messagePackExtension.ts';

export default interface MessagePackBufferWithExtensions<
  TBuffer extends Uint8Array = Uint8Array,
> {
  /**
   * Adds a MessagePack extension encoder.
   *
   * @param extension The extension to add.
   *
   * @returns The current instance for chaining.
   */
  addExtension<TValue extends object = object>(
    extension: MessagePackExtension<TValue, TBuffer>,
  ): this;

  /**
   * Gets the registered MessagePack extensions.
   *
   * @returns A read-only map of the registered extensions, where the key is the
   *   extension type and the value is the extension instance.
   */
  getExtensions(): ReadonlyMap<number, MessagePackExtension<object, TBuffer>>;
}
