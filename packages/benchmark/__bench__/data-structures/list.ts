import { DURATION_SECONDS } from '../constants.ts';
import { keys, printResults, runTest, type TestResult } from './runner.ts';

(() => {
  console.log(
    `Running benchmark for list data structures for ${DURATION_SECONDS} seconds...`,
  );

  const results: [string, TestResult[]][] = [];

  results.push([
    `Creation with ${keys.length} keys`,
    [
      runTest(`array.push`, () => {
        const arr: string[] = [];

        for (const key of keys) {
          arr.push(key);
        }
      }),
      runTest(`array[index] = value`, () => {
        const arr: string[] = [];

        for (let i = 0; i < keys.length; i++) {
          arr[i] = keys[i];
        }
      }),
      runTest(`array[index] = value + pre allocation`, () => {
        const arr: string[] = new Array(keys.length);

        for (let i = 0; i < keys.length; i++) {
          arr[i] = keys[i];
        }
      }),
      runTest(`array constructor`, () => {
        const arr: string[] = [...keys];
      }),
      runTest(`set constructor`, () => {
        const set = new Set<string>(keys);
      }),
      runTest(`set.add`, () => {
        const set = new Set<string>();

        for (const key of keys) {
          set.add(key);
        }
      }),
    ],
  ]);

  results.push([
    `Key update with ${keys.length} keys`,
    [
      runTest(`array[index] = newValue`, () => {
        const arr: string[] = [...keys];

        for (let i = 0; i < keys.length; i++) {
          arr[i] = `new-${keys[i]}`;
        }
      }),
      runTest(`set.delete + set.add`, () => {
        const set = new Set<string>(keys);

        for (const key of keys) {
          set.delete(key);
          set.add(`new-${key}`);
        }
      }),
    ],
  ]);

  results.push([
    `Key lookup with ${keys.length} keys`,
    [
      runTest(`array.includes(key)`, () => {
        const arr: string[] = [...keys];

        for (const key of keys) {
          const exists = arr.includes(key);
        }
      }),
      runTest(`array.find(value => value === key)`, () => {
        const arr: string[] = [...keys];

        for (const key of keys) {
          const exists = arr.find((value) => value === key) !== undefined;
        }
      }),
      runTest(`array.indexOf(key)`, () => {
        const arr: string[] = [...keys];

        for (const key of keys) {
          const exists = arr.indexOf(key) !== -1;
        }
      }),
      runTest(`array for loop`, () => {
        const arr: string[] = [...keys];

        for (const key of keys) {
          let exists = false;

          for (const value of arr) {
            if (value === key) {
              exists = true;
              break;
            }
          }
        }
      }),
      runTest(`set.has(key)`, () => {
        const set = new Set<string>(keys);

        for (const key of keys) {
          const exists = set.has(key);
        }
      }),
    ],
  ]);

  results.push([
    `Key deletion with ${keys.length} keys`,
    [
      runTest(`array.splice(index, 1)`, () => {
        let arr: string[] = [...keys];

        for (const key of keys) {
          const index = arr.indexOf(key);
          if (index !== -1) {
            arr.splice(index, 1);
          }
        }
      }),
      runTest(`set.delete(key)`, () => {
        const set = new Set<string>(keys);

        for (const key of keys) {
          set.delete(key);
        }
      }),
    ],
  ]);

  results.push([
    `Intersections with ${keys.length} keys`,
    [
      runTest(`array.filter + array.includes`, () => {
        const arr1: string[] = [...keys];
        const arr2: string[] = [...keys];

        const intersection = arr1.filter((value) => arr2.includes(value));
      }),
      runTest(`array for loop + array.includes + array.push`, () => {
        const arr1: string[] = [...keys];
        const arr2: string[] = [...keys];

        const intersection: string[] = [];

        for (const value of arr1) {
          if (arr2.includes(value)) {
            intersection.push(value);
          }
        }
      }),
      runTest(`array for loop + array.find + array.push`, () => {
        const arr1: string[] = [...keys];
        const arr2: string[] = [...keys];

        const intersection: string[] = [];

        for (const value of arr1) {
          if (arr2.find((v) => v === value) !== undefined) {
            intersection.push(value);
          }
        }
      }),
      runTest(`set.intersection`, () => {
        const set1 = new Set<string>(keys);
        const set2 = new Set<string>(keys);

        const intersection = set1.intersection(set2);
      }),
      runTest(`set for loop + set.has + set.add`, () => {
        const set1 = new Set<string>(keys);
        const set2 = new Set<string>(keys);

        const intersection = new Set<string>();

        for (const value of set1) {
          if (set2.has(value)) {
            intersection.add(value);
          }
        }
      }),
    ],
  ]);

  printResults(results);

  console.log(`Finished after ${DURATION_SECONDS} seconds.`);
})();
