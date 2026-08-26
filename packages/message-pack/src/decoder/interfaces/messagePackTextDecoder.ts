export default interface MessagePackTextDecoder<
  TBuffer extends Uint8Array = Uint8Array,
> {
  decode(buffer: TBuffer, startOffset: number, endOffset: number): string;
}
