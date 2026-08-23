import { Table } from 'console-table-printer';
import { Bench, formatNumber, mToNs, type Task } from 'tinybench';

import type {
  DataTypeFactoryFn,
  DataTypesFactory,
  SerializerDataTypeBenchOptions,
  SerializerTask,
} from './types.ts';

function callGarbageCollector(): void {
  process.stdout.write(`Collecting garbage...`);

  if (typeof globalThis.gc === 'function') {
    globalThis.gc();
  } else if (typeof Bun !== 'undefined' && typeof Bun.gc === 'function') {
    Bun.gc();
  } else {
    throw new TypeError(
      'Garbage collector is not exposed. Please run the benchmark with the --expose-gc flag or use a runtime that exposes the garbage collector.',
    );
  }

  process.stdout.write(` done.\n`);
}

function assertSyncFunction(
  fn: unknown,
  message = 'The provided function is not a synchronous function.',
): asserts fn is (...args: unknown[]) => unknown {
  if (!(typeof fn === 'function' && fn.constructor.name !== 'AsyncFunction')) {
    throw new TypeError(message);
  }
}

class SerializerDataTypeBench<
  TDataTypesFactory extends DataTypesFactory,
  TDataType extends keyof TDataTypesFactory,
> extends Bench {
  protected options: SerializerDataTypeBenchOptions<
    TDataTypesFactory,
    TDataType
  >;
  protected inheritedTasks: Map<string, SerializerTask<TDataTypesFactory>>;
  readonly dataType: TDataType;
  readonly dataTypeFactory: TDataTypesFactory[TDataType] | DataTypeFactoryFn;

  constructor(
    options: SerializerDataTypeBenchOptions<TDataTypesFactory, TDataType>,
  ) {
    const { dataType, tasks, dataTypeFactory, ...benchOptions } = options;

    super(benchOptions);

    this.dataType = dataType;
    this.dataTypeFactory = dataTypeFactory;
    this.inheritedTasks = tasks;
  }

  override runSync(): Task[] {
    const { dataType } = this;
    const { dataTypeFactory } = this;

    for (const [name, task] of this.inheritedTasks) {
      let data: ReturnType<TDataTypesFactory[TDataType]>;

      this.add(name, () => task.fn(data), {
        ...task.options,
        afterAll(this: Task, mode) {
          if (mode === 'warmup') {
            process.stdout.write(`warmed up.\n`);
          } else {
            process.stdout.write(`ended.\n`);
          }

          if (task.options?.afterAll) {
            assertSyncFunction(
              task.options.afterAll,
              'The afterAll hook must be a synchronous function. Asynchronous functions are not supported in the afterAll hook.',
            );

            task.options.afterAll.call(this, mode);
          }
        },
        beforeAll(this: Task, mode) {
          callGarbageCollector();

          const dataTypeName = String(dataType);

          if (mode === 'warmup') {
            process.stdout.write(`warming up ${dataTypeName} "${name}"... `);
          } else {
            process.stdout.write(`running ${dataTypeName} "${name}"... `);
          }

          if (task.options?.beforeAll) {
            assertSyncFunction(
              task.options.beforeAll,
              'The beforeAll hook must be a synchronous function. Asynchronous functions are not supported in the beforeAll hook.',
            );

            task.options.beforeAll.call(this, mode);
          }
        },
        beforeEach(this: Task) {
          // always generate a new value for each task, to avoid libraries caching
          // effects and ensure that each task is working with a fresh instance of
          // the data type, like a real world scenario.
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion
          data = dataTypeFactory() as ReturnType<TDataTypesFactory[TDataType]>;

          if (task.options?.beforeEach) {
            assertSyncFunction(
              task.options.beforeEach,
              'The beforeEach hook must be a synchronous function. Asynchronous functions are not supported in the beforeEach hook.',
            );

            task.options.beforeEach.call(this);
          }
        },
      });
    }

    const result = super.runSync();

    this.printTable();

    return result;
  }

  fetchPlaces(): WeakMap<Task, number> {
    const places = new WeakMap<Task, number>();

    for (const task of this.tasks) {
      const { state } = task.result;

      if (state !== 'aborted-with-statistics' && state !== 'completed') {
        continue;
      }

      const latency = task.result.latency.mean;

      let place = 1;

      for (const otherTask of this.tasks) {
        if (otherTask === task) {
          continue;
        }

        const otherState = otherTask.result.state;

        if (
          otherState !== 'aborted-with-statistics' &&
          otherState !== 'completed'
        ) {
          continue;
        }

        const otherLatency = otherTask.result.latency.mean;

        if (otherLatency < latency) {
          place++;
        }
      }

      places.set(task, place);
    }

    return places;
  }

  printTable(): void {
    const table = new Table({
      columns: [
        { alignment: 'left', name: 'Task name' },
        { alignment: 'center', name: 'Latency avg (ns)' },
        { alignment: 'center', name: 'Latency med (ns)' },
        { alignment: 'center', name: 'Throughput avg (ops/s)' },
        { alignment: 'center', name: 'Throughput med (ops/s)' },
        { alignment: 'center', name: 'Samples' },
      ],
    });

    const places = this.fetchPlaces();

    for (const task of this.tasks) {
      const { state } = task.result;

      if (state !== 'aborted-with-statistics' && state !== 'completed') {
        table.addRow(
          {
            'Latency avg (ns)': 'N/A',
            'Latency med (ns)': 'N/A',
            Samples: 'N/A',
            'Task name': task.name,
            'Throughput avg (ops/s)': 'N/A',
            'Throughput med (ops/s)': 'N/A',
          },
          { color: 'red' },
        );
        continue;
      }

      const place = places.get(task);

      let color: string | undefined;

      if (place === 1) {
        color = 'green';
      } else if (place === 2) {
        color = 'yellow';
      } else if (place === 3) {
        color = 'blue';
      }

      table.addRow(
        {
          'Latency avg (ns)': `${formatNumber(mToNs(task.result.latency.mean))} \u00B1 ${task.result.latency.rme.toFixed(2)}%`,
          'Latency med (ns)': `${formatNumber(mToNs(task.result.latency.p50))} \u00B1 ${formatNumber(mToNs(task.result.latency.mad))}`,
          Samples: task.result.latency.samplesCount.toLocaleString(),
          'Task name': task.name,
          'Throughput avg (ops/s)': `${Math.round(task.result.throughput.mean).toString()} \u00B1 ${task.result.throughput.rme.toFixed(2)}%`,
          'Throughput med (ops/s)': `${Math.round(task.result.throughput.p50).toString()} \u00B1 ${Math.round(task.result.throughput.mad).toString()}`,
        },
        {
          color,
        },
      );
    }

    table.printTable();
  }
}

export default SerializerDataTypeBench;
