# @schema-pack/message-pack

A [MessagePack](https://github.com/msgpack/msgpack/blob/master/spec.md)
encoder/decoder for TypeScript and JavaScript. It targets full compliance with
the MessagePack spec and exposes a pluggable extension system for encoding
custom types.

## Installation

```bash
pnpm add @schema-pack/message-pack
```

## Quick start

```ts
import { Decoder, Encoder } from '@schema-pack/message-pack';

const encoder = new Encoder();
const bytes = encoder.encode({ hello: 'world', values: [1, 2, 3] });

const decoder = new Decoder();
const value = decoder.decode(bytes);
// { hello: 'world', values: [1, 2, 3] }
```

## The 64-bit integer caveat

JavaScript numbers are IEEE 754 double-precision floats, so they can only
represent integers safely between `Number.MIN_SAFE_INTEGER` and
`Number.MAX_SAFE_INTEGER` (±(2^53 - 1)) — exported here as `INT64_MIN` and
`UINT64_MAX`. MessagePack's native `uint 64` / `int 64` formats, however, cover
the _full_ 64-bit range.

By default, the encoder and decoder read and write these formats as regular JS
`number`s, which is safe as long as your values stay within that safe integer
range. If you need the full 64-bit range — or want to work with `bigint`
directly — register the built-in `BigIntExtension`:

```ts
import { BigIntExtension, Decoder, Encoder } from '@schema-pack/message-pack';

const extension = new BigIntExtension(); // extension type 0-127, defaults to 0

const encoder = new Encoder().addExtension(extension);
const decoder = new Decoder().addExtension(extension);

const bytes = encoder.encode(123_456_789_012_345_678_901_234_567_890n);
decoder.decode(bytes); // 123456789012345678901234567890n
```

Values within the safe integer range are still encoded as native MessagePack
`uint`/`int` formats even with the extension registered — `BigIntExtension` only
takes over once a `bigint` value falls outside that range.

## Built-in extensions

- **`BigIntExtension`** — encodes/decodes `bigint` values outside the safe
  integer range, using a variable-length representation of the value's magnitude
  plus sign.
- **`TimestampDateExtension`** — encodes/decodes JS `Date` objects using the
  standard MessagePack
  [timestamp extension type](https://github.com/msgpack/msgpack/blob/master/spec.md#timestamp-extension-type)
  (`-1`), automatically choosing the 32-bit, 64-bit, or 96-bit format based on
  the date's range and precision. Because it uses the reserved timestamp type,
  register it as an _internal_ extension:

```ts
import {
  Decoder,
  Encoder,
  TimestampDateExtension,
} from '@schema-pack/message-pack';

const extension = new TimestampDateExtension();

const encoder = new Encoder().addInternalExtension(extension);
const decoder = new Decoder().addInternalExtension(extension);

const bytes = encoder.encode(new Date());
decoder.decode(bytes); // Date instance
```

## Writing your own extensions

Implement the `MessagePackExtension<TValue, TBuffer>` interface (or extend the
abstract `UntypedExtension` helper, which takes care of storing `type`):

```ts
interface MessagePackExtension<
  TValue = unknown,
  TBuffer extends Uint8Array = Uint8Array,
> {
  readonly type: number;
  encode(
    value: object | bigint,
    buffer: MessagePackEncoderBuffer<TBuffer>,
  ): void;
  decode(decoderBuffer: MessagePackDecoderBuffer, size: number): TValue;
}
```

Then register it on both the encoder and the decoder:

- `addExtension(extension)` — custom extension types, in the range `0` to `127`.
- `addExtensionType(type, extension)` — same as above, with the type passed as a
  separate argument.
- `addInternalExtension(extension)` — reserved types, in the range `-128` to
  `-1`, used for spec-defined extensions such as timestamps.
- `fetchExtension(type)` — look up a registered extension by its type.

Inside `encode()`, the buffer argument exposes low-level writers (`writeUint8`,
`writeUint32`, `writeBin`, `ensureCapacity`, `view`, `offset`, etc.) for
building a custom binary payload — see the `MessagePackEncoderBuffer` interface
for the full API.

## Encoder options

| Option                    | Default                          | Description                                                                                                                                                                                                               |
| ------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialBufferSize`       | `1024`                           | Initial size of the encoding buffer; grows automatically as needed.                                                                                                                                                       |
| `newBufferFn`             | `(size) => new Uint8Array(size)` | Factory used to allocate new buffers.                                                                                                                                                                                     |
| `initialSharedBufferSize` | `1024`                           | Initial size of the shared buffer used when encoding strings, to reduce allocations.                                                                                                                                      |
| `textEncoder`             | `DefaultTextEncoder`             | Encoder used to turn strings into bytes. A `NodeTextEncoder` is also provided for faster string encoding on Node.                                                                                                         |
| `sortKeys`                | `false`                          | Sort object keys before encoding, for deterministic output.                                                                                                                                                               |
| `forceFloat32`            | `false`                          | Always encode floating point numbers as `float32` instead of `float64`. This may lose precision for values that don't fit exactly in 32 bits (e.g. `1.2`) — only enable it if you know your floats can round-trip safely. |

## Decoder options

| Option              | Default                          | Description                                                         |
| ------------------- | -------------------------------- | ------------------------------------------------------------------- |
| `initialBufferSize` | `1024`                           | Initial size of the decoding buffer; grows automatically as needed. |
| `newBufferFn`       | `(size) => new Uint8Array(size)` | Factory used to allocate new buffers.                               |

## Error handling

The encoder and decoder currently throw plain `Error`s for invalid usage — e.g.
registering a duplicate or out-of-range extension type, looking up an extension
that isn't registered, or decoding a malformed timestamp payload. There's no
dedicated error class hierarchy yet, so catch `Error` and inspect `message` if
you need to branch on failure.

## License

MIT
