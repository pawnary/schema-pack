import type MessagePackExtension from '../extensions/interfaces/messagePackExtension.ts';

export default interface MessagePackBufferWithExtensions<
  TBuffer extends Uint8Array = Uint8Array,
> {
  /**
   * Adds a MessagePack extension encoder.
   *
   * @param extension The extension to add.
   * @returns The current instance for chaining.
   */
  addExtension(extension: MessagePackExtension<unknown, TBuffer>): this;
}
