/** An interface for encoding strings into MessagePack format. */
export default interface MessagePackTextEncoder<
  TBuffer extends Uint8Array = Uint8Array,
> {
  /**
   * Writes a string to the provided buffer using the MessagePack format.
   *
   * @param source - The string to be encoded and written to the buffer.
   * @param buffer - The buffer where the encoded string will be written.
   *
   * @returns The number of bytes written to the buffer.
   */
  writeBytes(source: string, buffer: TBuffer): number;
}
