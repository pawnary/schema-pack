import { Bench, formatNumber, Task, type BenchOptions, mToNs } from 'tinybench';
import type {
  DataTypeFactoryFn,
  DataTypesFactory,
  SerializerTask,
} from './types.ts';
import { Table } from 'console-table-printer';

function callGarbageCollector(): void {
  process.stdout.write(`Collecting garbage...`);

  if (typeof globalThis.gc === 'function') {
    globalThis.gc();
  } else if (typeof Bun !== 'undefined' && typeof Bun.gc === 'function') {
    Bun.gc();
  } else {
    throw new Error(
      'Garbage collector is not exposed. Please run the benchmark with the --expose-gc flag or use a runtime that exposes the garbage collector.',
    );
  }

  process.stdout.write(` done.\n`);
}

export type SerializerDataTypeBenchOptions<
  TDataTypesFactory extends DataTypesFactory,
  TDataType extends keyof TDataTypesFactory,
> = BenchOptions & {
  dataType: TDataType;
  dataTypeFactory: TDataTypesFactory[TDataType] | DataTypeFactoryFn<unknown>;
  tasks: Map<string, SerializerTask<TDataTypesFactory>>;
};

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
  readonly dataTypeFactory:
    TDataTypesFactory[TDataType] | DataTypeFactoryFn<unknown>;

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
    const dataType = this.dataType;
    const dataTypeFactory = this.dataTypeFactory;

    for (const [name, task] of this.inheritedTasks) {
      let data: ReturnType<TDataTypesFactory[TDataType]>;

      this.add(name, () => task.fn(data), {
        ...task.options,
        beforeEach: function (this: Task) {
          // always generate a new value for each task, to avoid libraries caching
          // effects and ensure that each task is working with a fresh instance of
          // the data type, like a real world scenario.
          data = dataTypeFactory() as ReturnType<TDataTypesFactory[TDataType]>;

          if (task.options?.beforeEach) {
            task.options.beforeEach.call(this);
          }
        },
        beforeAll: function (this: Task, mode) {
          callGarbageCollector();

          if (mode === 'warmup') {
            process.stdout.write(
              `warming up ${dataType as string} "${name}"... `,
            );
          } else {
            process.stdout.write(`running ${dataType as string} "${name}"... `);
          }

          if (task.options?.beforeAll) {
            task.options.beforeAll.call(this, mode);
          }
        },
        afterAll: function (this: Task, mode) {
          if (mode === 'warmup') {
            process.stdout.write(`warmed up.\n`);
          } else {
            process.stdout.write(`ended.\n`);
          }

          if (task.options?.afterAll) {
            task.options.afterAll.call(this, mode);
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
      const state = task.result.state;

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
        { name: 'Task name', alignment: 'left' },
        { name: 'Latency avg (ns)', alignment: 'center' },
        { name: 'Latency med (ns)', alignment: 'center' },
        { name: 'Throughput avg (ops/s)', alignment: 'center' },
        { name: 'Throughput med (ops/s)', alignment: 'center' },
        { name: 'Samples', alignment: 'center' },
      ],
    });

    const places = this.fetchPlaces();

    for (const task of this.tasks) {
      const state = task.result.state;

      if (state !== 'aborted-with-statistics' && state !== 'completed') {
        table.addRow(
          {
            'Task name': task.name,
            'Latency avg (ns)': 'N/A',
            'Latency med (ns)': 'N/A',
            'Throughput avg (ops/s)': 'N/A',
            'Throughput med (ops/s)': 'N/A',
            'Samples': 'N/A',
          },
          { color: 'red' },
        );
        continue;
      }

      const place = places.get(task);

      table.addRow(
        {
          'Task name': task.name,
          'Latency avg (ns)': `${formatNumber(mToNs(task.result.latency.mean))} \xb1 ${task.result.latency.rme.toFixed(2)}%`,
          'Latency med (ns)': `${formatNumber(mToNs(task.result.latency.p50))} \xb1 ${formatNumber(mToNs(task.result.latency.mad))}`,
          'Throughput avg (ops/s)': `${Math.round(task.result.throughput.mean).toString()} \xb1 ${task.result.throughput.rme.toFixed(2)}%`,
          'Throughput med (ops/s)': `${Math.round(task.result.throughput.p50).toString()} \xb1 ${Math.round(task.result.throughput.mad).toString()}`,
          'Samples': task.result.latency.samplesCount.toLocaleString(),
        },
        {
          color:
            place === 1
              ? 'green'
              : place === 2
                ? 'yellow'
                : place === 3
                  ? 'blue'
                  : undefined,
        },
      );
    }

    table.printTable();
  }
}

export default SerializerDataTypeBench;
