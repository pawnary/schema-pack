<!-- prettier-ignore-start -->
> [!WARNING]
> This is a Work In Progress, and the API is not stable yet. Breaking changes
> may be introduced at any time.
<!-- prettier-ignore-end -->

# @schema-pack/benchmark

A benchmark suite for comparing serializer implementations across representative
data types, built on top of [tinybench](https://github.com/tinylibs/tinybench).
Register a serializer as a task, pick (or define) the data types to run it
against, and get a ranked latency/throughput comparison against any other
serializers you register alongside it.

## Installation

```bash
pnpm add -D @schema-pack/benchmark
```

> `tinybench` and `console-table-printer` are declared as devDependencies of
> this package but are imported at runtime by its exported classes — make sure
> both are installed alongside it.

## Requirements

- A garbage-collector-exposing runtime: run Node with the `--expose-gc` flag, or
  use Bun (which exposes `Bun.gc()` natively). The suite triggers a collection
  before each task to reduce noise between runs, and throws if no GC hook is
  available.

## Data types

A "data type" here isn't a JavaScript/TypeScript type — it's a name paired with
a factory function that produces one representative sample value for it (a small
number, a large map, a long string, and so on). `SerializerBenchSuite` runs
every registered serializer against each data type independently and reports
results per category, so you can see that a serializer is fast at plain numbers
but slow at large maps, instead of getting a single number that averages that
away.

`dataTypesFactory` is a ready-made set of these; you can also define your own
(see [Custom data type factories](#custom-data-type-factories) below).

## Usage

```ts
import { dataTypesFactory, SerializerBenchSuite } from '@schema-pack/benchmark';
import { yourSerializationFunction } from 'your-serializer';

const suite = new SerializerBenchSuite(dataTypesFactory);

suite.add('my custom library', (value) => yourSerializationFunction(value));
suite.run();
```

**Example with [`@schema-pack/message-pack`](../message-pack/README.md) vs
[`@msgpack/msgpack`](https://github.com/msgpack/msgpack-javascript):**

Create a `bench.ts` file with the following contents:

```ts
import { dataTypesFactory, SerializerBenchSuite } from '@schema-pack/benchmark';
import { Encoder } from '@schema-pack/message-pack';
import { encode } from '@msgpack/msgpack';

const suite = new SerializerBenchSuite(dataTypesFactory);

const encoder = new Encoder();

suite.add('@schema-pack/message-pack', (value) => encoder.encode(value));
suite.add('@msgpack/msgpack', (value) => encode(value));
suite.run();
```

```bash
node --expose-gc ./bench.ts
```

This runs every registered task against every data type in `dataTypesFactory`
(or a chosen subset — see below), printing a per-data-type latency/throughput
table plus a final ranking table across all data types.

## Custom data type factories

`dataTypesFactory` is just an object implementing `DataTypesFactory` — a map of
names to zero-argument factory functions that each produce a value:

```ts
type DataTypeFactoryFn<TValue = unknown> = () => TValue;

interface DataTypesFactory<TValue = unknown> {
  [key: string]: DataTypeFactoryFn<TValue>;
}
```

Any object matching that shape can be passed to `new SerializerBenchSuite(...)`
in place of the default `dataTypesFactory`, which is useful whenever the
built-in factory doesn't produce the kind of input your benchmark needs — you're
not limited to the data types it ships with. Build one from scratch with
whatever names and values fit your benchmark:

```ts
import type { DataTypesFactory } from '@schema-pack/benchmark';

const customDataTypesFactory: DataTypesFactory = {
  smallObject: () => ({ id: 1, name: 'Ada' }),
  numberList: () => [1, 2, 3, 4, 5],
  greeting: () => 'hello world',
  // ...one entry per data type you want to cover
};

export default customDataTypesFactory;
```

Pass it straight to `SerializerBenchSuite` instead of the default factory:

```ts
import { SerializerBenchSuite } from '@schema-pack/benchmark';

import customDataTypesFactory from './customDataTypesFactory.ts';

const suite = new SerializerBenchSuite(customDataTypesFactory);

suite
  .add('JSON.stringify', (value) => JSON.stringify(value))
  .withDataType('smallObject') // restrict the run to one data type; omit to run all of them
  .run();
```

For a one-off addition instead of a whole parallel factory, use
`.withCustomDataType(name, factoryFn)` on the suite itself (see [API](#api)
below).

## API

- **`SerializerBenchSuite(dataTypesFactory)`** — the entry point. A fluent
  builder:
  - `.add(name, fn, options?)` / `.set(name, fn, options?)` — register a
    serializer task to benchmark. `options` accepts standard tinybench
    `FnOptions`, plus `only`/`skip` arrays of data type names to scope the task
    to.
  - `.withDataType(name)` — restrict the run to specific data types from the
    factory (by default, every data type in `dataTypesFactory` is run).
  - `.withCustomDataType(name, factoryFn)` — add an ad-hoc data type that isn't
    in the default factory.
  - `.run()` — executes all tasks per data type and prints the results.
- **`SerializerDataTypeBench`** — a `tinybench` `Bench` subclass that runs one
  data type against all registered tasks. Used internally by
  `SerializerBenchSuite`, but usable standalone for finer control.
- **`dataTypesFactory`** — the default set of representative values for every
  MessagePack data type (`positiveFixint`, `fixmap`, `fixarray`, `fixstr`,
  `nil`, `false`, `true`, `bin8`/`16`/`32`, `float32`/`64`,
  `uint8`/`16`/`32`/`64`, `int8`/`16`/`32`/`64`, `str8`/`16`/`32`,
  `array16`/`32`, `map16`/`32`, `negativeFixint`), plus a plain `undefined`
  case.

## License

MIT
