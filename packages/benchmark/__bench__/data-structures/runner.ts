import { DURATION_SECONDS } from '../constants.ts';
import runGarbageCollector from '../utils/runGarbageCollector.ts';

// [testName, totalOperations, memoryUsage]
export type TestResult = [string, number, number];
// [suiteName, TestResult[]]
export type SuitesResults = [string, TestResult[]][];

export const keys = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
];

export function runTest(name: string, fn: Function): TestResult {
  console.log(name);

  runGarbageCollector();

  const startMemoryUsage = process.memoryUsage().heapUsed;
  const startTime = Date.now();
  let operations = 0;

  do {
    fn();

    ++operations;
  } while (Date.now() - startTime < DURATION_SECONDS * 1000);

  runGarbageCollector();

  const endMemoryUsage = process.memoryUsage().heapUsed;
  const memoryUsage = endMemoryUsage - startMemoryUsage;

  return [name, operations, memoryUsage];
}

export function printResults(results: SuitesResults) {
  for (const [suiteName, testResult] of results) {
    testResult.sort((a, b) => b[1] - a[1]);

    console.table(
      testResult.map(([name, operations, memoryUsage]) => ({
        suiteName,
        name,
        operations,
        operationsPerSecond: (operations / DURATION_SECONDS).toLocaleString(),
        memoryUsage: `${memoryUsage / 1024} KB`,
      })),
    );
  }
}
