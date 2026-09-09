import type MessagePackEncoder from '../../encoder/interfaces/messagePackEncoder.ts';
import type MessagePackExtensionBase from './messagePackExtensionBase.ts';

export default interface MessagePackBuiltInExtension<
  TValue extends object = object,
  TBuffer extends Uint8Array = Uint8Array,
> extends MessagePackExtensionBase<TValue, TBuffer> {
  /**
   * Encodes the given value into the provided encoder buffer according to the
   * MessagePack format.
   *
   * This method must set all the values needed to correctly serialize this
   * extension. That includes setting the flags, field sizes, and preparing any
   * other information required for the extension to be encoded correctly.
   *
   * @param value - The value to be encoded.
   * @param encoder - The main encoder instance where the data will be written.
   */
  encodeInto(value: TValue, encoder: MessagePackEncoder<TBuffer>): void;
}
