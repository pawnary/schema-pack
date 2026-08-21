import { readFileSync } from 'node:fs';

import chalk from 'chalk';

import { DURATION_SECONDS } from '../constants.ts';
import runGarbageCollector from '../utils/runGarbageCollector.ts';

export type AlgorithmFunction = (object: Object) => number | bigint | string;
export type TearDownFunction = () => void;

function runAlgorithm(
  fn: AlgorithmFunction,
  tearDownFunction: TearDownFunction,
  objects: Object[],
  validateShapeId: boolean,
): [number, number] {
  runGarbageCollector();

  let counter = 0;

  console.log(
    `Processing objects in ${fn.name} for ${DURATION_SECONDS} seconds...`,
  );
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  ROOT: while (true) {
    for (const obj of objects) {
      const left = fn(obj);
      counter++;

      if (validateShapeId) {
        const right = fn(obj);

        counter++;

        if (left !== right) {
          console.info({ left, right });
          throw new Error(
            `Validation failed for shape ID algorithm "${fn.name}". The same object produced different shape IDs: ${left} and ${right}.`,
          );
        }
      }

      if (Date.now() - startTime >= DURATION_SECONDS * 1000) {
        break ROOT;
      }
    }
  }

  const endMemory = process.memoryUsage().heapUsed;
  const memoryUsed = endMemory - startMemory;

  tearDownFunction();

  runGarbageCollector();

  return [counter, memoryUsed];
}

export default function shapeIdRunner(
  filePath: string,
  algorithms: [AlgorithmFunction, TearDownFunction][],
  validateShapeId: boolean,
) {
  runGarbageCollector();

  console.log(chalk.green(`Reading objects from "${filePath}"...`));

  const startTime = Date.now();

  const objects = JSON.parse(readFileSync(filePath, { encoding: 'utf-8' }));

  console.log(
    chalk.green(
      `Read ${objects.length.toLocaleString()} objects in ${(Date.now() - startTime) / 1000} seconds.`,
    ),
  );

  const results: [string, number, number][] = [];

  for (const [algorithm, tearDown] of algorithms) {
    process.stdout.write(
      chalk.green(`Running "${algorithm.name}" algorithm...`),
    );
    const [totalOperations, memoryUsed] = runAlgorithm(
      algorithm,
      tearDown,
      objects,
      validateShapeId,
    );

    results.push([algorithm.name, totalOperations, memoryUsed]);
  }

  // sort by total operations in descending order
  results.sort((a, b) => b[1] - a[1]);

  console.table(
    results.map(([name, totalOperations, memoryUsed]) => ({
      algorithm: name,
      totalOperations: totalOperations.toLocaleString(),
      operationsPerSecond: `${(totalOperations / DURATION_SECONDS).toLocaleString()} ops/sec aprox`,
      memoryUsedPerOperation: `${(memoryUsed / totalOperations).toFixed(2)} bytes/op aprox`,
      memoryUsedInMB: `${(memoryUsed / 1024 / 1024).toFixed(2)} MB aprox`,
    })),
  );

  runGarbageCollector();
}
