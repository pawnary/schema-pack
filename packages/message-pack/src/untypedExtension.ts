import type MessagePackDecoderBuffer from './decoder/interfaces/messagePackDecoderBuffer.ts';
import type { ExtensionEncoder } from './encoder/types.ts';
import type MessagePackExtension from './extensions/interfaces/messagePackExtension.ts';

abstract class UntypedExtension<
  TValue = unknown,
  TBuffer extends Uint8Array = Uint8Array,
> implements MessagePackExtension<TValue, TBuffer> {
  readonly type: number;

  /**
   * @param type - The extension type for BigInt values. Can be a integer
   *   between 0 and 127, default is 0.
   */
  constructor(type = 0) {
    this.type = type;
  }

  abstract encode(
    value: object | bigint,
    encoder: ExtensionEncoder<TBuffer>,
  ): void;

  abstract decode(
    decoderBuffer: MessagePackDecoderBuffer,
    size: number,
  ): TValue;
}

export default UntypedExtension;
