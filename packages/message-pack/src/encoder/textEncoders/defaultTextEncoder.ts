import type MessagePackTextEncoder from '../interfaces/messagePackTextEncoder.ts';

/**
 * DefaultTextEncoder is a class that implements the MessagePackTextEncoder
 * interface. It provides functionality to encode strings into UTF-8 bytes,
 * using either a native TextEncoder or a custom encoding method based on the
 * string length and a specified threshold.
 */
class DefaultTextEncoder implements MessagePackTextEncoder {
  /**
   * The native TextEncoder instance used for encoding strings into UTF-8 bytes.
   */
  nativeTextEncoder = new TextEncoder();

  public writeBytes(
    value: string,
    buffer: Uint8Array<ArrayBufferLike>,
  ): number {
    return this.nativeTextEncoder.encodeInto(value, buffer).written;
  }
}

export default DefaultTextEncoder;
