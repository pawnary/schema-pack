import type BenchAdapter from './instrumentedBench/adapters/benchAdapter.ts';
import CLIAdapter from './instrumentedBench/adapters/cliAdapter.ts';
import SerializersDataTypeBench from './serializersDataTypeBench.ts';
import type {
  DataTypeFactoryFn,
  DataTypesFactory,
  Serializer,
  SerializersBenchSuiteOptions,
} from './types.ts';

class SerializersBenchSuite<TDataTypesFactory extends DataTypesFactory> {
  protected serializers = new Map<string, Serializer<TDataTypesFactory>>();
  protected dataTypes = new Map<keyof TDataTypesFactory, DataTypeFactoryFn>();

  protected dataTypesFactory: TDataTypesFactory;
  protected adapter: BenchAdapter;

  constructor(options: SerializersBenchSuiteOptions<TDataTypesFactory>) {
    this.dataTypesFactory = options.dataTypesFactory;
    this.adapter = new CLIAdapter();
  }

  add(options: Serializer<TDataTypesFactory>): this {
    if (this.serializers.has(options.name)) {
      throw new Error(`Task with name "${options.name}" already exists.`);
    }

    this.serializers.set(options.name, options);
    return this;
  }

  onlyDataType(dataType: keyof TDataTypesFactory): this {
    if (!(dataType in this.dataTypesFactory)) {
      throw new Error(
        `Data type "${String(dataType)}" is not supported. Use onlyCustomDataType() to add a custom data type.`,
      );
    }

    const factory = this.dataTypesFactory[dataType];

    this.dataTypes.set(dataType, factory);

    return this;
  }

  onlyDataTypes(dataTypes: (keyof TDataTypesFactory)[]): this {
    for (const dataType of dataTypes) {
      this.onlyDataType(dataType);
    }

    return this;
  }

  onlyCustomDataType<TValue>(
    name: string,
    factoryFn: DataTypeFactoryFn<TValue>,
  ): this {
    this.dataTypes.set(name, factoryFn);

    return this;
  }

  async run(): Promise<void> {
    const benches: SerializersDataTypeBench<
      TDataTypesFactory,
      keyof TDataTypesFactory
    >[] = [];

    if (this.dataTypes.size === 0) {
      this.dataTypes = new Map(Object.entries(this.dataTypesFactory));
    }

    for (const [dataType, dataTypeFactory] of this.dataTypes) {
      const serializers = new Map<string, Serializer<TDataTypesFactory>>();

      for (const serializer of this.serializers.values()) {
        if (serializer.options?.skip?.includes(dataType)) {
          continue;
        }
        if (
          serializer.options?.only &&
          !serializer.options.only.includes(dataType)
        ) {
          continue;
        }

        serializers.set(serializer.name, serializer);
      }

      // const dataTypeName = String(dataType);

      if (serializers.size <= 0) {
        //   // console.log(
        //   //   `No serializers found for data type "${dataTypeName}". Skipping...`,
        //   // );

        continue;
      }

      const bench = new SerializersDataTypeBench({
        adapters: [this.adapter],
        dataType,
        dataTypeFactory,
        serializers,
        throws: false,
        time: 1000,
      });

      benches.push(bench);
    }

    for (const bench of benches) {
      // oxlint-disable-next-line no-await-in-loop
      await bench.run();
    }

    // this.printResume(benches);
  }

  // Note: Consider web support
  // printResume(
  //   benches: SerializersDataTypeBench<
  //     TDataTypesFactory,
  //     keyof TDataTypesFactory
  //   >[],
  // ): void {
  //   const table = new Table({
  //     columns: [
  //       {
  //         alignment: 'left',
  //         name: 'Task',
  //       },
  //       ...benches.map((bench) => ({
  //         alignment: 'center',
  //         name: String(bench.dataType),
  //         transform: (place: CellValue): string => {
  //           let placeColor = '\u001B[37m';

  //           if (place === 1) {
  //             placeColor = `\u001B[32m`;
  //           } else if (place === 2) {
  //             placeColor = `\u001B[33m`;
  //           } else if (place === 3) {
  //             placeColor = `\u001B[34m`;
  //           }

  //           return `${placeColor}${place}\u001B[0m`;
  //         },
  //       })),
  //     ],
  //   });

  //   const tasks = new Map<string, Task>();

  //   for (const bench of benches) {
  //     for (const task of bench.tasks) {
  //       tasks.set(task.name, task);
  //     }
  //   }

  //   for (const task of tasks.values()) {
  //     const row: Record<string, unknown> = {
  //       Task: task.name,
  //     };

  //     for (const bench of benches) {
  //       const places = bench.fetchPlaces();
  //       const { dataType } = bench;
  //       const dataTypeName = String(dataType);

  //       const benchTask = bench.tasks.find(
  //         (taskItem) => taskItem.name === task.name,
  //       );

  //       let place: string | number | undefined;

  //       if (benchTask) {
  //         place = places.get(benchTask);

  //         if (place === undefined) {
  //           place = 'N/A';
  //         }
  //       } else {
  //         place = 'N/A';
  //       }

  //       if (dataType in row) {
  //         throw new Error(
  //           `Duplicate data type "${dataTypeName}" in row for task "${task.name}".`,
  //         );
  //       }

  //       row[dataTypeName] = place;
  //     }

  //     table.addRow(row);
  //   }

  //   table.printTable();
  // }
}

export default SerializersBenchSuite;
