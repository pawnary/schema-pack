import type { ExtensionEncoder } from '../../encoder/types.ts';
import type MessagePackExtensionBase from './messagePackExtensionBase.ts';
import type { Constructor } from './types.ts';

export default interface MessagePackExtension<
  TValue extends object = object,
  TBuffer extends Uint8Array = Uint8Array,
> extends MessagePackExtensionBase<TValue, TBuffer> {
  /**
   * Encodes the given value into the provided buffer according to the
   * MessagePack format.
   *
   * @param value - The value to be encoded. This can be of any type, but the
   *   implementation should handle specific types as needed.
   * @param encoder - The extension encoder where the data will be written.
   */
  encode(
    value: InstanceType<Constructor<TValue>>,
    encoder: ExtensionEncoder<TBuffer>,
  ): void;
}
