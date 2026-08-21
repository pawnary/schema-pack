# schema-pack

A repository for building and testing serialization tooling in
TypeScript/JavaScript — encoders/decoders, byte-level debugging, benchmarking,
and test utilities for binary formats.

## Packages

| Package                                                | Description                                                             |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| [`@schema-pack/message-pack`](./packages/message-pack) | MessagePack encoder/decoder.                                            |
| [`@schema-pack/debugger`](./packages/debugger)         | Byte-level inspector for binary serialization formats.                  |
| [`@schema-pack/benchmark`](./packages/benchmark)       | Benchmark suite comparing serializer implementations across data types. |
| [`@schema-pack/vitest`](./packages/vitest)             | Vitest matchers for asserting on `Uint8Array` byte content.             |

See each package's README for installation and usage details specific to it.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setting up the repo, available scripts, and the tooling used.

## License

MIT
