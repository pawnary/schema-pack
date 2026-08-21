import { readFileSync } from 'node:fs';

import { SchemaBuilder, Fmix32 } from '@schema-pack/schema';

import mocks from '../../../../src/mocks.ts';
import {
  DIFFERENT_SHAPES_FILE_PATH,
  SAME_SHAPES_FILE_PATH,
  DURATION_SECONDS,
} from '../constants.ts';
import runGarbageCollector from '../utils/runGarbageCollector.ts';

function runner(data: unknown): void {
  runGarbageCollector();

  const dataType = Array.isArray(data) ? 'array' : typeof data;

  console.log(`Found ${dataType}. Building schema...`);

  const now = Date.now();
  const times: bigint[] = [];

  do {
    const shapeAlgorithm = new Fmix32();

    const builder = new SchemaBuilder({
      data: data,
      shapeAlgorithm: shapeAlgorithm,
    });

    const startTimeNs = process.hrtime.bigint();
    const schema = builder.getSchema();
    const endTimeNs = process.hrtime.bigint();

    times.push(endTimeNs - startTimeNs);

    // console.log({schema});
    // process.exit(1);
  } while (Date.now() - now < DURATION_SECONDS * 1000);

  const averageTimePerOperation =
    times.reduce((acc, time) => acc + time, BigInt(0)) / BigInt(times.length);

  console.log(`Total time in seconds: ${DURATION_SECONDS} s`);
  console.log(`Total operations: ${times.length}`);
  console.log(`Average time per operation: ${averageTimePerOperation} ns`);
  runGarbageCollector();
}

(() => {
  // console.log(`Reading different shapes data from ${DIFFERENT_SHAPES_FILE_PATH}...`);
  // const differentShapes = JSON.parse(readFileSync(DIFFERENT_SHAPES_FILE_PATH, { encoding: 'utf-8' }));
  // runner(differentShapes);

  // const shameShapes = JSON.parse(readFileSync(SAME_SHAPES_FILE_PATH, { encoding: 'utf-8' }));
  // runner(shameShapes.slice(0, 1000));

  runner(mocks);
})();
