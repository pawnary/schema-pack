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
  // Declared as a property signature on purpose: `strictFunctionTypes` does not apply to
  // method declarations, so a method signature would compare `buffer` bivariantly and accept
  // a decoder built for a narrower buffer type (for example Buffer) wherever TBuffer is
  // Uint8Array. The property form restores contravariant parameter checking.
  // oxlint-disable-next-line typescript/method-signature-style
  writeBytes: (source: string, buffer: TBuffer) => number;
}
