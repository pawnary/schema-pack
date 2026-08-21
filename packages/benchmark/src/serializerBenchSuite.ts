// oxlint-disable no-console -- Consider web support
import { Table } from 'console-table-printer';
import type { CellValue } from 'console-table-printer/dist/src/models/external-table.js';
import type { Task } from 'tinybench';

import SerializerDataTypeBench from './serializerDataTypeBench.ts';
import type {
  DataTypeFactoryFn,
  DataTypesFactory,
  SerializerFn,
  SerializerTask,
  SerializerTaskOptions,
} from './types.ts';

class SerializerBenchSuite<TDataTypesFactory extends DataTypesFactory> {
  protected tasks = new Map<string, SerializerTask<TDataTypesFactory>>();
  protected dataTypes = new Map<keyof TDataTypesFactory, DataTypeFactoryFn>();

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
      fn,
      name,
      options: fnOpts,
    });

    return this;
  }

  withDataType(dataType: keyof TDataTypesFactory): this {
    if (!(dataType in this.dataTypesFactory)) {
      throw new Error(
        `Data type "${String(dataType)}" is not supported. Use withCustomDataType() to add a custom data type.`,
      );
    }

    const factory = this.dataTypesFactory[dataType];

    this.dataTypes.set(dataType, factory);

    return this;
  }

  withCustomDataType<TValue>(
    name: string,
    factoryFn: DataTypeFactoryFn<TValue>,
  ): this {
    this.dataTypes.set(name, factoryFn);

    return this;
  }

  run(): void {
    const benches: SerializerDataTypeBench<
      TDataTypesFactory,
      keyof TDataTypesFactory
    >[] = [];

    if (this.dataTypes.size === 0) {
      this.dataTypes = new Map(Object.entries(this.dataTypesFactory));
    }

    for (const [dataType, dataTypeFactory] of this.dataTypes) {
      const tasks = new Map<string, SerializerTask<TDataTypesFactory>>();

      const name = String(dataType);

      for (const task of this.tasks.values()) {
        if (task.options?.skip?.includes(name)) {
          continue;
        }

        if (task.options?.only && !task.options.only.includes(name)) {
          continue;
        }

        tasks.set(task.name, task);
      }

      if (tasks.size > 0) {
        benches.push(
          new SerializerDataTypeBench({
            dataType,
            dataTypeFactory,
            name,
            tasks,
            throws: true,
            time: 1000,
          }),
        );
      } else {
        console.log(`No tasks found for data type "${name}". Skipping...`);
      }
    }

    for (const bench of benches) {
      bench.runSync();
    }

    this.printResume(benches);
  }

  // Note: Consider web support
  printResume(
    benches: SerializerDataTypeBench<
      TDataTypesFactory,
      keyof TDataTypesFactory
    >[],
  ): void {
    const table = new Table({
      columns: [
        {
          alignment: 'left',
          name: 'Task',
        },
        ...benches.map((bench) => ({
          alignment: 'center',
          name: String(bench.dataType),
          transform: (place: CellValue): string => {
            let placeColor = '\u001B[37m';

            if (place === 1) {
              placeColor = `\u001B[32m`;
            } else if (place === 2) {
              placeColor = `\u001B[33m`;
            } else if (place === 3) {
              placeColor = `\u001B[34m`;
            }

            return `${placeColor}${place}\u001B[0m`;
          },
        })),
      ],
    });

    const tasks = new Map<string, Task>();

    for (const bench of benches) {
      for (const task of bench.tasks) {
        tasks.set(task.name, task);
      }
    }

    for (const task of tasks.values()) {
      const row: Record<string, unknown> = {
        Task: task.name,
      };

      for (const bench of benches) {
        const places = bench.fetchPlaces();
        const { dataType } = bench;
        const dataTypeName = String(dataType);

        const benchTask = bench.tasks.find(
          (taskItem) => taskItem.name === task.name,
        );

        let place: string | number | undefined;

        if (benchTask) {
          place = places.get(benchTask);

          if (place === undefined) {
            place = 'N/A';
          }
        } else {
          place = 'N/A';
        }

        if (dataType in row) {
          throw new Error(
            `Duplicate data type "${dataTypeName}" in row for task "${task.name}".`,
          );
        }

        row[dataTypeName] = place;
      }

      table.addRow(row);
    }

    table.printTable();
  }
}

export default SerializerBenchSuite;
