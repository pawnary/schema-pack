import { isEqual } from 'es-toolkit/predicate';
import type { HookMode, Task } from 'tinybench';

import InstrumentedBench from './instrumentedBench/instrumentedBench.ts';
import type {
  DataTypeFactoryFn,
  DataTypesFactory,
  Serializer,
  SerializersDataTypeBenchOptions,
} from './types.ts';

function callGarbageCollector(): void {
  if (typeof globalThis.gc === 'function') {
    globalThis.gc();
  } else if (typeof Bun !== 'undefined' && typeof Bun.gc === 'function') {
    Bun.gc();
  } else {
    throw new TypeError(
      'Garbage collector is not exposed. Please run the benchmark with the --expose-gc flag or use a runtime that exposes the garbage collector.',
    );
  }
}

class SerializersDataTypeBench<
  TDataTypesFactory extends DataTypesFactory,
  TDataType extends keyof TDataTypesFactory = keyof TDataTypesFactory,
> {
  protected options: SerializersDataTypeBenchOptions<
    TDataTypesFactory,
    TDataType
  >;
  readonly serializers: Map<string, Serializer<TDataTypesFactory>>;
  readonly dataType: TDataType;
  readonly dataTypeFactory: TDataTypesFactory[TDataType] | DataTypeFactoryFn;
  readonly disableGarbageCollection: boolean;

  readonly encoderBench: InstrumentedBench;
  readonly decoderBench: InstrumentedBench;

  constructor(
    options: SerializersDataTypeBenchOptions<TDataTypesFactory, TDataType>,
  ) {
    const { dataType, serializers, dataTypeFactory, ...benchOptions } = options;
    const dataTypeName = String(dataType);

    this.encoderBench = new InstrumentedBench({
      ...benchOptions,
      name: `Encoding ${dataTypeName}`,
    });

    this.decoderBench = new InstrumentedBench({
      ...benchOptions,
      name: `Decoding ${dataTypeName}`,
    });

    this.dataType = dataType;
    this.dataTypeFactory = dataTypeFactory;
    this.serializers = serializers;
    this.disableGarbageCollection = options.disableGarbageCollection ?? false;
  }

  async setupTasks(): Promise<Task[]> {
    const dataTypeFactory = this.dataTypeFactory;
    const disableGarbageCollection = this.disableGarbageCollection;

    for (const [name, serializer] of this.serializers) {
      // oxlint-disable-next-line no-await-in-loop
      const setup = await serializer.setup();
      let data = dataTypeFactory();

      let encoded = setup.encodeFn(data);
      const decodedData = setup.decodeFn(encoded);

      const abortController = new globalThis.AbortController();

      if (!isEqual(data, decodedData)) {
        abortController.abort(
          `Data type "${String(this.dataType)}" is not supported.`,
        );
      }

      // oxlint-disable-next-line no-inner-declarations
      async function beforeAll(this: Task, mode?: HookMode): Promise<void> {
        if (!disableGarbageCollection) {
          // NOTE: todo; trigger events around garbage collection
          callGarbageCollector();
        }

        if (serializer.options?.beforeAll) {
          await serializer.options.beforeAll.call(this, mode);
        }
      }

      this.encoderBench.add(name, () => setup.encodeFn(data), {
        ...serializer.options,
        beforeAll,
        async beforeEach(this: Task) {
          // always generate a new value for each serializer, to avoid libraries caching
          // effects and ensure that each serializer is working with a fresh instance of
          // the data type, like a real world scenario.
          data = dataTypeFactory();

          if (serializer.options?.beforeEach) {
            await serializer.options.beforeEach.call(this);
          }
        },
        signal: abortController.signal,
      });

      this.decoderBench.add(name, () => setup.decodeFn(encoded), {
        ...serializer.options,
        beforeAll,
        async beforeEach(this: Task) {
          // always generate a new value for each serializer, to avoid libraries caching
          // effects and ensure that each serializer is working with a fresh instance of
          // the data type, like a real world scenario.
          encoded = setup.encodeFn(dataTypeFactory());

          if (serializer.options?.beforeEach) {
            await serializer.options.beforeEach.call(this);
          }
        },
        signal: abortController.signal,
      });
    }

    return [...this.encoderBench.tasks, ...this.decoderBench.tasks];
  }

  async run(): Promise<void> {
    if (
      this.encoderBench.tasks.length === 0 ||
      this.decoderBench.tasks.length === 0
    ) {
      await this.setupTasks();
    }

    await this.encoderBench.run();
    await this.decoderBench.run();
  }
}

export default SerializersDataTypeBench;
