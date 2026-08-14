import type MessagePackTextEncoder from './messagePackTextEncoder.ts';
import type MessagePackBufferWithExtensions from '../../interfaces/messagePackBufferWithExtensions.ts';
import type MessagePackExtension from '../../extensions/interfaces/messagePackExtension.ts';
import type { ExtensionEncoderBuffer } from '../types.ts';

/**
 * Defines the core methods for managing a buffer. It serves as the foundation
 * for buffer management in the encoding process, allowing for efficient
 * handling of binary data while adhering to the MessagePack format.
 */
export default interface MessagePackEncoderBuffer<
  TBuffer extends Uint8Array = Uint8Array,
> extends MessagePackBufferWithExtensions<TBuffer> {
  /*********************
   * Buffer management *
   *********************/
  /**
   * Returns the underlying buffer. This method provides access to the raw
   * data that has been written to the buffer.
   */
  buffer: TBuffer;

  /**
   * the current position in the buffer, which indicates where the next
   * write operation will occur. This position is updated as data is written to
   * the buffer.
   */
  offset: number;

  /**
   * Returns a `DataView` object that provides a low-level interface for reading
   * and writing multiple number types in the buffer. This view allows for
   * efficient manipulation of binary data, enabling the encoding of various
   * MessagePack data types directly into the buffer.
   */
  view: DataView;

  /**
   * This encoder is responsible for converting strings into their
   * corresponding byte representations according to the MessagePack
   * specification.
   */
  readonly textEncoder: MessagePackTextEncoder;

  /**
   * Ensures that the buffer has enough capacity to write the specified number
   * of bytes.
   *
   * If the current buffer does not have enough capacity, it will be resized to
   * accommodate the new data.
   *
   * This method is crucial for efficient buffer management, as it minimizes
   * the number of allocations and copies by resizing the buffer in larger
   * increments when necessary.
   *
   * @param sizeToWrite - The number of bytes that need to be written to the
   * buffer. The method will ensure that there is enough capacity for this
   * amount of data.
   */
  ensureCapacity(sizeToWrite: number): this;

  /**
   * Resizes the buffer to the specified new size. This method is called when
   * the current buffer does not have enough capacity to accommodate new data.
   *
   * @param newSize - The new size for the buffer. The method will resize the
   * buffer to this size.
   */
  resizeBuffer(newSize: number): this;

  /**
   * Resets the buffer to its initial state. This method is typically called
   * before starting a new encoding operation to ensure that the buffer is empty
   * and ready for new data.
   */
  resetBuffer(): this;

  /**
   * Flushes the buffer, returning the underlying Uint8Array containing the
   * encoded data. This method is typically called after all data has been
   * written to the buffer, and it provides access to the final encoded output.
   */
  flush(): TBuffer;

  /************************************
   * MessagePack primitive data types *
   ************************************/
  /**
   * Writes a MessagePack positive fixint stores a 7-bit positive integer in 1 byte.
   *
   * ```
   * positive fixint:
   * +--------+
   * |0XXXXXXX|
   * +--------+
   * ```
   */
  writePositiveFixInt(value: number): this;

  /**
   * Writes a MessagePack negative fixint stores a 5-bit negative integer in 1 byte.
   *
   * ```
   * negative fixint:
   * +--------+
   * |111YYYYY|
   * +--------+
   * ```
   */
  writeNegativeFixInt(value: number): this;

  /**
   * Writes binary data.
   *
   * ```
   * +========+
   * |  data  |
   * +========+
   * ```
   */
  writeBin(bytes: Uint8Array): this;

  /**
   * Writes a MessagePack float 32 stores a floating point number in IEEE 754
   * single precision floating point number format.
   *
   * ```
   * float 32:
   * +--------+--------+--------+--------+
   * |XXXXXXXX|XXXXXXXX|XXXXXXXX|XXXXXXXX|
   * +--------+--------+--------+--------+
   * ```
   */
  writeFloat32(value: number): this;

  /**
   * Writes a MessagePack float 64 stores a floating point number in IEEE 754
   * double precision floating point number format.
   *
   * ```
   * float 64:
   * +--------+--------+--------+--------+--------+--------+--------+--------+
   * |YYYYYYYY|YYYYYYYY|YYYYYYYY|YYYYYYYY|YYYYYYYY|YYYYYYYY|YYYYYYYY|YYYYYYYY|
   * +--------+--------+--------+--------+--------+--------+--------+--------+
   * ```
   */
  writeFloat64(value: number): this;

  /**
   * Writes a MessagePack uint 8 stores a 8-bit unsigned integer.
   *
   * ```
   * uint 8:
   * +--------+
   * |ZZZZZZZZ|
   * +--------+
   * ```
   */
  writeUint8(value: number): this;

  /**
   * Writes a MessagePack uint 16 stores a 16-bit big-endian unsigned integer.
   *
   * ```
   * uint 16:
   * +--------+--------+
   * |ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+
   * ```
   */
  writeUint16(value: number): this;

  /**
   * Writes a MessagePack uint 32 stores a 32-bit big-endian unsigned integer.
   *
   * ```
   * uint 32:
   * +--------+--------+--------+--------+
   * |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+--------+
   * ```
   */
  writeUint32(value: number): this;

  /**
   * Writes a MessagePack uint 64 stores a 64-bit big-endian unsigned integer.
   *
   * ```
   * uint 64:
   * +--------+--------+--------+--------+--------+--------+--------+--------+
   * |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+--------+--------+--------+--------+--------+
   * ```
   */
  writeUint64(value: number): this;

  /**
   * Writes a MessagePack int 8 stores a 8-bit signed integer.
   *
   * ```
   * int 8:
   * +--------+
   * |ZZZZZZZZ|
   * +--------+
   * ```
   */
  writeInt8(value: number): this;

  /**
   * Writes a MessagePack int 16 stores a 16-bit big-endian signed integer.
   *
   * ```
   * int 16:
   * +--------+--------+
   * |ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+
   * ```
   */
  writeInt16(value: number): this;

  /**
   * Writes a MessagePack int 32 stores a 32-bit big-endian signed integer.
   *
   * ```
   * int 32:
   * +--------+--------+--------+--------+
   * |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+--------+
   * ```
   */
  writeInt32(value: number): this;

  /**
   * Writes a MessagePack int 64 stores a 64-bit big-endian signed integer.
   *
   * ```
   * int 64:
   * +--------+--------+--------+--------+--------+--------+--------+--------+
   * |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+--------+--------+--------+--------+--------+
   * ```
   */
  writeInt64(value: number): this;

  /**
   * Writes a UTF-8 string into the buffer.
   *
   * ```
   * +========+
   * |  data  |
   * +========+
   * ```
   */
  writeStr(value: string): this;

  /***********************
   * MessagePack symbols *
   ***********************/
  /**
   * Writes a MessagePack nil format byte stores nil in 1 byte.
   *
   * ```
   * nil:
   * +--------+
   * |  0xc0  |
   * +--------+
   * ```
   */
  writeNilSymbol(): this;

  /**
   * Writes a MessagePack false format byte stores false in 1 byte.
   *
   * ```
   * false:
   * +--------+
   * |  0xc2  |
   * +--------+
   * ```
   */
  writeFalseSymbol(): this;

  /**
   * Writes a MessagePack true format byte stores true in 1 byte.
   *
   * ```
   * true:
   * +--------+
   * |  0xc3  |
   * +--------+
   * ```
   */
  writeTrueSymbol(): this;

  /**
   * Writes a MessagePack fixmap header for a map whose length is up to 15
   * elements.
   *
   * ```
   * fixmap:
   * +--------+
   * |1000XXXX|
   * +--------+
   * ```
   */
  writeFixMapSymbol(size: number): this;

  /**
   * Writes a MessagePack fixarray header for an array whose length is up to 15
   * elements.
   *
   * ```
   * fixarray:
   * +--------+
   * |1001XXXX|
   * +--------+
   * ```
   */
  writeFixArraySymbol(size: number): this;

  /**
   * Writes a MessagePack fixstr header for a string whose byte length is up to
   * 31 bytes.
   *
   * ```
   * fixstr:
   * +--------+
   * |101XXXXX|
   * +--------+
   * ```
   */
  writeFixStrSymbol(size: number): this;

  /**
   * Writes a MessagePack bin 8 header for a byte array whose length is up to
   * (2^8)-1 bytes.
   *
   * ```
   * bin 8:
   * +--------+--------+
   * |  0xc4  |XXXXXXXX|
   * +--------+--------+
   * ```
   */
  writeBin8Symbol(size: number): this;

  /**
   * Writes a MessagePack bin 16 header for a byte array whose length is up to
   * (2^16)-1 bytes.
   *
   * ```
   * bin 16:
   * +--------+--------+--------+
   * |  0xc5  |YYYYYYYY|YYYYYYYY|
   * +--------+--------+--------+
   * ```
   */
  writeBin16Symbol(size: number): this;

  /**
   * Writes a MessagePack bin 32 header for a byte array whose length is up to
   * (2^32)-1 bytes.
   *
   * ```
   * bin 32:
   * +--------+--------+--------+--------+--------+
   * |  0xc6  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+--------+--------+
   * ```
   */
  writeBin32Symbol(size: number): this;

  /**
   * Writes a MessagePack float 32 format byte.
   *
   * ```
   * float 32:
   * +--------+
   * |  0xca  |
   * +--------+
   * ```
   */
  writeFloat32Symbol(): this;

  /**
   * Writes a MessagePack float 64 format byte.
   *
   * ```
   * float 64:
   * +--------+
   * |  0xcb  |
   * +--------+
   * ```
   */
  writeFloat64Symbol(): this;

  /**
   * Writes a MessagePack uint 8 format byte.
   *
   * ```
   * uint 8:
   * +--------+
   * |  0xcc  |
   * +--------+
   * ```
   */
  writeUint8Symbol(): this;

  /**
   * Writes a MessagePack uint 16 format byte.
   *
   * ```
   * uint 16:
   * +--------+
   * |  0xcd  |
   * +--------+
   * ```
   */
  writeUint16Symbol(): this;

  /**
   * Writes a MessagePack uint 32 format byte.
   *
   * ```
   * uint 32:
   * +--------+
   * |  0xce  |
   * +--------+
   * ```
   */
  writeUint32Symbol(): this;

  /**
   * Writes a MessagePack uint 64 format byte.
   *
   * ```
   * uint 64:
   * +--------+
   * |  0xcf  |
   * +--------+
   * ```
   */
  writeUint64Symbol(): this;

  /**
   * Writes a MessagePack int 8 format byte.
   *
   * ```
   * int 8:
   * +--------+
   * |  0xd0  |
   * +--------+
   * ```
   */
  writeInt8Symbol(): this;

  /**
   * Writes a MessagePack int 16 format byte.
   *
   * ```
   * int 16:
   * +--------+
   * |  0xd1  |
   * +--------+
   * ```
   */
  writeInt16Symbol(): this;

  /**
   * Writes a MessagePack int 32 format byte.
   *
   * ```
   * int 32:
   * +--------+
   * |  0xd2  |
   * +--------+
   * ```
   */
  writeInt32Symbol(): this;

  /**
   * Writes a MessagePack int 64 format byte.
   *
   * ```
   * int 64:
   * +--------+
   * |  0xd3  |
   * +--------+
   * ```
   */
  writeInt64Symbol(): this;

  /**
   * Writes a MessagePack str 8 header for a string whose byte length is up to
   * (2^8)-1 bytes.
   *
   * ```
   * str 8:
   * +--------+--------+
   * |  0xd9  |YYYYYYYY|
   * +--------+--------+
   * ```
   */
  writeStr8Symbol(size: number): this;

  /**
   * Writes a MessagePack str 16 header for a string whose byte length is up to
   * (2^16)-1 bytes.
   *
   * ```
   * str 16:
   * +--------+--------+--------+
   * |  0xda  |ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+
   * ```
   */
  writeStr16Symbol(size: number): this;

  /**
   * Writes a MessagePack str 32 header for a string whose byte length is up to
   * (2^32)-1 bytes.
   *
   * ```
   * str 32:
   * +--------+--------+--------+--------+--------+
   * |  0xdb  |AAAAAAAA|AAAAAAAA|AAAAAAAA|AAAAAAAA|
   * +--------+--------+--------+--------+--------+
   * ```
   */
  writeStr32Symbol(size: number): this;

  /**
   * Writes a MessagePack array 16 header for an array whose length is up to
   * (2^16)-1 elements.
   *
   * ```
   * array 16:
   * +--------+--------+--------+
   * |  0xdc  |YYYYYYYY|YYYYYYYY|
   * +--------+--------+--------+
   * ```
   */
  writeArray16Symbol(size: number): this;

  /**
   * Writes a MessagePack array 32 header for an array whose length is up to
   * (2^32)-1 elements.
   *
   * ```
   * array 32:
   * +--------+--------+--------+--------+--------+
   * |  0xdd  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+--------+--------+
   * ```
   */
  writeArray32Symbol(size: number): this;

  /**
   * Writes a MessagePack map 16 header for a map whose length is up to
   * (2^16)-1 elements.
   *
   * ```
   * map 16:
   * +--------+--------+--------+
   * |  0xde  |YYYYYYYY|YYYYYYYY|
   * +--------+--------+--------+
   * ```
   */
  writeMap16Symbol(size: number): this;

  /**
   * Writes a MessagePack map 32 header for a map whose length is up to
   * (2^32)-1 elements.
   *
   * ```
   * map 32:
   * +--------+--------+--------+--------+--------+
   * |  0xdf  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+--------+--------+
   * ```
   */
  writeMap32Symbol(size: number): this;

  /**
   * Writes a MessagePack fixext 1 header for an extension whose data length is
   * 1 byte.
   *
   * ```
   * fixext 1:
   * +--------+--------+
   * |  0xd4  |  type  |
   * +--------+--------+
   * ```
   */
  writeFixExt1Symbol(type: number): this;

  /**
   * Writes a MessagePack fixext 2 header for an extension whose data length is
   * 2 bytes.
   *
   * ```
   * fixext 2:
   * +--------+--------+
   * |  0xd5  |  type  |
   * +--------+--------+
   * ```
   */
  writeFixExt2Symbol(type: number): this;

  /**
   * Writes a MessagePack fixext 4 header for an extension whose data length is
   * 4 bytes.
   *
   * ```
   * fixext 4:
   * +--------+--------+
   * |  0xd6  |  type  |
   * +--------+--------+
   * ```
   */
  writeFixExt4Symbol(type: number): this;

  /**
   * Writes a MessagePack fixext 8 header for an extension whose data length is
   * 8 bytes.
   *
   * ```
   * fixext 8:
   * +--------+--------+
   * |  0xd7  |  type  |
   * +--------+--------+
   * ```
   */
  writeFixExt8Symbol(type: number): this;

  /**
   * Writes a MessagePack fixext 16 header for an extension whose data length
   * is 16 bytes.
   *
   * ```
   * fixext 16:
   * +--------+--------+
   * |  0xd8  |  type  |
   * +--------+--------+
   * ```
   */
  writeFixExt16Symbol(type: number): this;

  /**
   * Writes a MessagePack ext 8 header for an extension whose data length is up
   * to (2^8)-1 bytes.
   *
   * ```
   * ext 8:
   * +--------+--------+--------+
   * |  0xc7  |XXXXXXXX|  type  |
   * +--------+--------+--------+
   * ```
   */
  writeExt8Symbol(type: number, size: number): this;

  /**
   * Writes a MessagePack ext 16 header for an extension whose data length is
   * up to (2^16)-1 bytes.
   *
   * ```
   * ext 16:
   * +--------+--------+--------+--------+
   * |  0xc8  |YYYYYYYY|YYYYYYYY|  type  |
   * +--------+--------+--------+--------+
   * ```
   */
  writeExt16Symbol(type: number, size: number): this;

  /**
   * Writes a MessagePack ext 32 header for an extension whose data length is
   * up to (2^32)-1 bytes.
   *
   * ```
   * ext 32:
   * +--------+--------+--------+--------+--------+--------+
   * |  0xc9  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|  type  |
   * +--------+--------+--------+--------+--------+--------+
   * ```
   */
  writeExt32Symbol(type: number, size: number): this;

  /*************
   * Shortcuts *
   *************/
  /**
   * Writes an unknown value using the MessagePack format family selected for its
   * runtime type.
   */
  write(value: unknown): this;

  /**
   * Writes a string using the MessagePack str format family.
   *
   * ```
   * fixstr:
   * +--------+========+
   * |101XXXXX|  data  |
   * +--------+========+
   *
   * str 8:
   * +--------+--------+========+
   * |  0xd9  |YYYYYYYY|  data  |
   * +--------+--------+========+
   *
   * str 16:
   * +--------+--------+--------+========+
   * |  0xda  |ZZZZZZZZ|ZZZZZZZZ|  data  |
   * +--------+--------+--------+========+
   *
   * str 32:
   * +--------+--------+--------+--------+--------+========+
   * |  0xdb  |AAAAAAAA|AAAAAAAA|AAAAAAAA|AAAAAAAA|  data  |
   * +--------+--------+--------+--------+--------+========+
   * ```
   */
  writeString(value: string): this;

  /**
   * Writes a MessagePack number using integer or floating point formats.
   *
   * ```
   * positive fixint:
   * +--------+
   * |0XXXXXXX|
   * +--------+
   *
   * negative fixint:
   * +--------+
   * |111YYYYY|
   * +--------+
   *
   * uint 8:
   * +--------+--------+
   * |  0xcc  |ZZZZZZZZ|
   * +--------+--------+
   *
   * uint 16:
   * +--------+--------+--------+
   * |  0xcd  |ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+
   *
   * uint 32:
   * +--------+--------+--------+--------+--------+
   * |  0xce  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+--------+--------+
   *
   * uint 64:
   * +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   * |  0xcf  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   *
   * int 8:
   * +--------+--------+
   * |  0xd0  |ZZZZZZZZ|
   * +--------+--------+
   *
   * int 16:
   * +--------+--------+--------+
   * |  0xd1  |ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+
   *
   * int 32:
   * +--------+--------+--------+--------+--------+
   * |  0xd2  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+--------+--------+
   *
   * int 64:
   * +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   * |  0xd3  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|
   * +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   *
   * float 32:
   * +--------+--------+--------+--------+--------+
   * |  0xca  |XXXXXXXX|XXXXXXXX|XXXXXXXX|XXXXXXXX|
   * +--------+--------+--------+--------+--------+
   *
   * float 64:
   * +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   * |  0xcb  |YYYYYYYY|YYYYYYYY|YYYYYYYY|YYYYYYYY|YYYYYYYY|YYYYYYYY|YYYYYYYY|YYYYYYYY|
   * +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   * ```
   */
  writeNumber(value: number): this;

  /**
   * Writes a record as a MessagePack map using fixmap, map 16, or map 32.
   *
   * ```
   * fixmap:
   * +--------+~~~~~~~~~~~~~~~~~+
   * |1000XXXX|    N*2 objects  |
   * +--------+~~~~~~~~~~~~~~~~~+
   *
   * map 16:
   * +--------+--------+--------+~~~~~~~~~~~~~~~~~+
   * |  0xde  |YYYYYYYY|YYYYYYYY|    N*2 objects  |
   * +--------+--------+--------+~~~~~~~~~~~~~~~~~+
   *
   * map 32:
   * +--------+--------+--------+--------+--------+~~~~~~~~~~~~~~~~~+
   * |  0xdf  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|    N*2 objects  |
   * +--------+--------+--------+--------+--------+~~~~~~~~~~~~~~~~~+
   * ```
   */
  writeMap<K extends string | number, T>(value: Record<K, T>): this;

  /**
   * Writes an array using the MessagePack array format family.
   *
   * ```
   * fixarray:
   * +--------+~~~~~~~~~~~~~~~~~+
   * |1001XXXX|    N objects    |
   * +--------+~~~~~~~~~~~~~~~~~+
   *
   * array 16:
   * +--------+--------+--------+~~~~~~~~~~~~~~~~~+
   * |  0xdc  |YYYYYYYY|YYYYYYYY|    N objects    |
   * +--------+--------+--------+~~~~~~~~~~~~~~~~~+
   *
   * array 32:
   * +--------+--------+--------+--------+--------+~~~~~~~~~~~~~~~~~+
   * |  0xdd  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|    N objects    |
   * +--------+--------+--------+--------+--------+~~~~~~~~~~~~~~~~~+
   * ```
   */
  writeArray(value: unknown[]): this;

  /**
   * Writes a JavaScript object using the MessagePack format.
   *
   * @param value - The JavaScript object to be encoded and written to the buffer.
   */
  writeObject(value: object): this;

  /**
   * Encode a bigint value into the buffer. This method handles the encoding of
   * signed 64-bit integers, ensuring that they are correctly represented in the
   * MessagePack format.
   *
   * Maximum int64
   *
   * @param value - The bigint value to be encoded and written to the buffer.
   * The method will determine the appropriate encoding based on the value's
   * size and sign.
   */
  // writeBigInt64(value: bigint): this;

  // writeBigUint64(value: bigint): this;

  /**
   * Writes a Uint8Array using the MessagePack bin format family.
   *
   * ```
   * bin 8:
   * +--------+--------+========+
   * |  0xc4  |XXXXXXXX|  data  |
   * +--------+--------+========+
   *
   * bin 16:
   * +--------+--------+--------+========+
   * |  0xc5  |YYYYYYYY|YYYYYYYY|  data  |
   * +--------+--------+--------+========+
   *
   * bin 32:
   * +--------+--------+--------+--------+--------+========+
   * |  0xc6  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|  data  |
   * +--------+--------+--------+--------+--------+========+
   * ```
   */
  writeUint8Array(value: Uint8Array): this;

  /**
   * Writes a MessagePack extension using fixext 1, fixext 2, fixext 4,
   * fixext 8, fixext 16, ext 8, ext 16, or ext 32.
   *
   * ```
   * fixext 1:
   * +--------+--------+--------+
   * |  0xd4  |  type  |  data  |
   * +--------+--------+--------+
   *
   * fixext 2:
   * +--------+--------+--------+--------+
   * |  0xd5  |  type  |       data      |
   * +--------+--------+--------+--------+
   *
   * fixext 4:
   * +--------+--------+--------+--------+--------+--------+
   * |  0xd6  |  type  |                data               |
   * +--------+--------+--------+--------+--------+--------+
   *
   * fixext 8:
   * +--------+--------+--------+--------+--------+--------+--------+--------+--------+--------+
   * |  0xd7  |  type  |                                  data                                 |
   * +--------+--------+--------+--------+--------+--------+--------+--------+--------+--------+
   *
   * fixext 16:
   * +--------+--------+--------+--------+--------+--------+--------+--------+--------+--------+
   * |  0xd8  |  type  |                                  data                                 |
   * +--------+--------+--------+--------+--------+--------+--------+--------+--------+--------+
   * +--------+--------+--------+--------+--------+--------+--------+--------+
   * |                             data (cont.)                       |
   * +--------+--------+--------+--------+--------+--------+--------+--------+
   *
   * ext 8:
   * +--------+--------+--------+========+
   * |  0xc7  |XXXXXXXX|  type  |  data  |
   * +--------+--------+--------+========+
   *
   * ext 16:
   * +--------+--------+--------+--------+========+
   * |  0xc8  |YYYYYYYY|YYYYYYYY|  type  |  data  |
   * +--------+--------+--------+--------+========+
   *
   * ext 32:
   * +--------+--------+--------+--------+--------+--------+========+
   * |  0xc9  |ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|ZZZZZZZZ|  type  |  data  |
   * +--------+--------+--------+--------+--------+--------+========+
   *
   * XXXXXXXX is a 8-bit unsigned integer which represents N.
   * YYYYYYYY_YYYYYYYY is a 16-bit big-endian unsigned integer which
   * represents N.
   * ZZZZZZZZ_ZZZZZZZZ_ZZZZZZZZ_ZZZZZZZZ is a big-endian 32-bit unsigned
   * integer which represents N.
   * N is the length of data.
   * type is a signed 8-bit integer.
   * ```
   */
  writeExtension(
    extension: MessagePackExtension,
    buffer: ExtensionEncoderBuffer<TBuffer>,
  ): this;
}
