export default interface MessagePackTextDecoder {
  decode(buffer: Uint8Array, startOffset: number, endOffset: number): string;
}
