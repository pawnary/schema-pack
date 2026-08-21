import type MessagePackTextEncoder from '../interfaces/messagePackTextEncoder.ts';

/**
 * DefaultTextEncoder provides functionality to encode strings into UTF-8 bytes,
 * using the native TextEncoder.
 */
class DefaultTextEncoder<
  TBuffer extends Uint8Array = Uint8Array,
> implements MessagePackTextEncoder<TBuffer> {
  /** The native TextEncoder instance used for encoding strings into UTF-8 bytes. */
  nativeTextEncoder = new TextEncoder();

  public writeBytes(value: string, buffer: TBuffer): number {
    return this.nativeTextEncoder.encodeInto(value, buffer).written;
  }
}

export default DefaultTextEncoder;
