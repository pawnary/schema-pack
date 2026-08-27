<!-- prettier-ignore-start -->
> [!WARNING]
> This is a Work In Progress, and the API is not stable yet. Breaking changes
> may be introduced at any time.
<!-- prettier-ignore-end -->

# @schema-pack/message-pack

Incremental
[MessagePack](https://github.com/msgpack/msgpack/blob/master/spec.md)
encoder/decoder for TypeScript and JavaScript. It targets full compliance with
the MessagePack spec and exposes a pluggable extension system for encoding
custom types.

## Installation

```bash
pnpm add @schema-pack/message-pack@next
```

### Quick start

```ts
import { encode, decode } from '@schema-pack/message-pack';

const buffer = encode({ hello: 'world', values: [1, 2, 3] });

const value = decode(buffer);
// { hello: 'world', values: [1, 2, 3] }
```

For more information, visit the
[documentation](https://pawnary.github.io/schema-pack/docs/message-pack).

## License

MIT
