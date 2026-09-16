export default interface MessagePackTextDecoder<
  TBuffer extends Uint8Array = Uint8Array,
> {
  // decode(buffer: TBuffer, startOffset: number, endOffset: number): string;

  /** Decodes a portion of the buffer into a string. */
  // Declared as a property signature on purpose: `strictFunctionTypes` does not apply to
  // method declarations, so a method signature would compare `buffer` bivariantly and accept
  // a decoder built for a narrower buffer type (for example Buffer) wherever TBuffer is
  // Uint8Array. The property form restores contravariant parameter checking.
  // oxlint-disable-next-line typescript/method-signature-style
  decode: (buffer: TBuffer, startOffset: number, endOffset: number) => string;
}
