import { Task } from 'tinybench';
import type {
  DataTypesFactory,
  DataTypeFactoryFn,
  SerializerFn,
  SerializerTask,
  SerializerTaskOptions,
} from './types.ts';
import { Table } from 'console-table-printer';
import SerializerDataTypeBench from './serializerDataTypeBench.ts';
import type { CellValue } from 'console-table-printer/dist/src/models/external-table.js';

class SerializerBenchSuite<TDataTypesFactory extends DataTypesFactory> {
  protected tasks = new Map<string, SerializerTask<TDataTypesFactory>>();
  protected dataTypes = new Map<
    keyof TDataTypesFactory,
    DataTypeFactoryFn<
      ReturnType<TDataTypesFactory[keyof TDataTypesFactory]> | unknown
    >
  >();

  protected dataTypesFactory: TDataTypesFactory;

  constructor(dataTypesFactory: TDataTypesFactory) {
    this.dataTypesFactory = dataTypesFactory;
  }

  add(
    name: string,
    fn: SerializerFn<ReturnType<TDataTypesFactory[keyof TDataTypesFactory]>>,
    fnOpts?: SerializerTaskOptions<TDataTypesFactory>,
  ): this {
    if (this.tasks.has(name)) {
      throw new Error(`Task with name "${name}" already exists.`);
    }

    return this.set(name, fn, fnOpts);
  }

  set(
    name: string,
    fn: SerializerFn<ReturnType<TDataTypesFactory[keyof TDataTypesFactory]>>,
    fnOpts?: SerializerTaskOptions<TDataTypesFactory>,
  ): this {
    this.tasks.set(name, {
      name,
      fn,
      options: fnOpts,
    });

    return this;
  }

  withDataType(dataType: keyof TDataTypesFactory): this {
    if (!(dataType in this.dataTypesFactory)) {
      throw new Error(
        `Data type "${dataType as string}" is not supported. Use withCustomDataType() to add a custom data type.`,
      );
    }

    const factory = this.dataTypesFactory[dataType as keyof TDataTypesFactory];

    this.dataTypes.set(dataType as string, factory);

    return this;
  }

  withCustomDataType<T>(name: string, factoryFn: DataTypeFactoryFn<T>): this {
    this.dataTypes.set(name, factoryFn);

    return this;
  }

  run(): void {
    const benches: SerializerDataTypeBench<
      TDataTypesFactory,
      keyof TDataTypesFactory
    >[] = [];

    if (this.dataTypes.size < 1) {
      this.dataTypes = new Map(Object.entries(this.dataTypesFactory));
    }

    for (const [dataType, dataTypeFactory] of this.dataTypes) {
      const tasks = new Map<string, SerializerTask<TDataTypesFactory>>();

      for (const task of this.tasks.values()) {
        if (task.options) {
          if (task.options.skip && task.options.skip.includes(dataType)) {
            continue;
          }

          if (task.options.only && !task.options.only.includes(dataType)) {
            continue;
          }
        }

        tasks.set(task.name, task);
      }

      if (tasks.size > 0) {
        benches.push(
          new SerializerDataTypeBench({
            name: dataType as string,
            dataType: dataType,
            dataTypeFactory,
            tasks: tasks,
            throws: true,
            time: 1000,
          }),
        );
      } else {
        console.log(
          `No tasks found for data type "${dataType as string}". Skipping...`,
        );
      }
    }

    for (const bench of benches) {
      bench.runSync();
    }

    this.printResume(benches);
  }

  // TODO: Consider web support
  printResume(
    benches: SerializerDataTypeBench<
      TDataTypesFactory,
      keyof TDataTypesFactory
    >[],
  ): void {
    const table = new Table({
      columns: [
        {
          name: 'Task',
          alignment: 'left',
        },
        ...benches.map((bench) => ({
          name: bench.dataType as string,
          alignment: 'center',
          transform: (place: CellValue) => {
            let placeColor = '\x1b[37m';

            if (place === 1) {
              placeColor = `\x1b[32m`;
            } else if (place === 2) {
              placeColor = `\x1b[33m`;
            } else if (place === 3) {
              placeColor = `\x1b[34m`;
            }

            return `${placeColor}${place}\x1b[0m`;
          },
        })),
      ],
    });

    const tasks = benches.reduce((carry, bench) => {
      for (const task of bench.tasks) {
        carry.set(task.name, task);
      }

      return carry;
    }, new Map<string, Task>());

    for (const task of tasks.values()) {
      const row: Record<string, any> = {
        Task: task.name,
      };

      for (const bench of benches) {
        const places = bench.fetchPlaces();
        const dataType = bench.dataType;

        const benchTask = bench.tasks.find((t) => t.name === task.name);

        let place: string | number | undefined;

        if (!benchTask) {
          place = 'N/A';
        } else {
          place = places.get(benchTask);

          if (place === undefined) {
            place = 'N/A';
          }
        }

        if (dataType in row) {
          throw new Error(
            `Duplicate data type "${dataType as string}" in row for task "${task.name}".`,
          );
        }

        row[dataType as string] = place;
      }

      table.addRow(row);
    }

    table.printTable();
  }
}

export default SerializerBenchSuite;
