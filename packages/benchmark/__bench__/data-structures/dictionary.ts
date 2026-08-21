import { DURATION_SECONDS } from '../constants.ts';
import { keys, printResults, runTest, type TestResult } from './runner.ts';

(() => {
  console.log(
    `Running benchmark for dictionary data structures for ${DURATION_SECONDS} seconds...`,
  );

  const results: [string, TestResult[]][] = [];

  results.push([
    `Creation with ${keys.length} keys`,
    [
      runTest(`obj[key] = key`, () => {
        const obj: Record<string, string> = {};

        for (const key of keys) {
          obj[key] = key;
        }
      }),
      runTest(`map.set(key, key)`, () => {
        const map = new Map<string, string>();

        for (const key of keys) {
          map.set(key, key);
        }
      }),
      runTest('Object.fromEntries(keys.map(key => [key, key]))', () => {
        const obj = Object.fromEntries(keys.map((key) => [key, key]));
      }),
      runTest('new Map(keys.map(key => [key, key]))', () => {
        const map = new Map<string, string>(keys.map((key) => [key, key]));
      }),
      runTest('copyObj = {...obj}', () => {
        const copyObj = { ...obj };
      }),
    ],
  ]);

  const obj: Record<string, string> = {};
  const map = new Map<string, string>();

  for (const key of keys) {
    obj[key] = key;
    map.set(key, key);
  }

  results.push([
    `Key update with ${keys.length} keys`,
    [
      runTest(`obj[key] = newValue`, () => {
        const copyObj: Record<string, string> = { ...obj };

        for (const key of keys) {
          copyObj[key] = `new-${key}`;
        }
      }),
      runTest(`map.set(key, newValue)`, () => {
        const copyMap = new Map<string, string>(map);

        for (const key of keys) {
          copyMap.set(key, `new-${key}`);
        }
      }),
    ],
  ]);

  results.push([
    `Key access with ${keys.length} string keys`,
    [
      runTest(`value = obj[key]`, () => {
        for (const key of keys) {
          const value = obj[key];
        }
      }),
      runTest(`value = map.get(key)`, () => {
        for (const key of keys) {
          const value = map.get(key);
        }
      }),
    ],
  ]);

  const numericObj: Record<number, string> = {};
  const numericMap = new Map<number, string>();

  for (let i = 0; i < keys.length; i++) {
    numericObj[i] = keys[i];
    numericMap.set(i, keys[i]);
  }

  results.push([
    `Key access with ${keys.length} numeric keys`,
    [
      runTest(`value = obj[key]`, () => {
        for (let i = 0; i < keys.length; i++) {
          const value = numericObj[i];
        }
      }),
      runTest(`value = map.get(key)`, () => {
        for (let i = 0; i < keys.length; i++) {
          const value = numericMap.get(i);
        }
      }),
    ],
  ]);

  results.push([
    `Key deletion with ${keys.length} keys`,
    [
      runTest(`delete obj[key]`, () => {
        const copyObj: Record<string, string> = { ...obj };

        for (const key of keys) {
          delete copyObj[key];
        }
      }),
      runTest(`destructuring ({removedKey, ...rest} = obj)`, () => {
        let copyObj: Record<string, string> = { ...obj };

        const { [keys[0]]: _, ...rest } = copyObj;

        copyObj = rest;
      }),
      runTest(`Key deletion with ${keys.length} keys (Map)`, () => {
        const copyMap = new Map<string, string>(map);

        for (const key of keys) {
          copyMap.delete(key);
        }
      }),
    ],
  ]);

  results.push([
    `Key existence check with ${keys.length} keys`,
    [
      runTest(`exists = key in obj`, () => {
        for (const key of keys) {
          const exists = key in obj;
        }
      }),
      runTest(`exists = obj.hasOwnProperty(key)`, () => {
        for (const key of keys) {
          const exists = obj.hasOwnProperty(key);
        }
      }),
      runTest(`exists = map.has(key)`, () => {
        for (const key of keys) {
          const exists = map.has(key);
        }
      }),
    ],
  ]);

  printResults(results);

  console.log(`Finished after ${DURATION_SECONDS} seconds.`);
})();
