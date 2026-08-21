#!/usr/bin/env ts-node

import { createWriteStream, writeFileSync } from 'node:fs';

import { faker } from '@faker-js/faker';
import chalk from 'chalk';

import {
  DIFFERENT_SHAPES_FILE_PATH,
  SAME_SHAPES_FILE_PATH,
} from '../constants.ts';

const TOTAL_OBJECTS = 100_000;
const MAX_KEYS_PER_OBJECT = 10;

function generateObjects(outputFile: string, collisionsMatters: boolean) {
  const existentShapes = new Set<string>();
  const existentKeys: Record<string, 0> = {}; // raw object uses less memory than Set<string> for this purpose
  let objectsCounter = 0;
  let keysCollisionsCounter = 0;
  let shapesCollisionsCounter = 0;
  let existentKeysCounter = 0;

  const startTime = Date.now();

  writeFileSync(outputFile, '', { encoding: 'utf-8' });

  const outputStream = createWriteStream(outputFile, {
    encoding: 'utf-8',
    flags: 'a',
  });

  outputStream.write('[');

  function printCounters() {
    process.stdout.write(
      chalk.white(
        `\r\x1b[KGenerated ${objectsCounter.toLocaleString()} objects, ${existentKeysCounter.toLocaleString()} unique keys, ${keysCollisionsCounter.toLocaleString()} key collisions, ${shapesCollisionsCounter.toLocaleString()} shape collisions...`,
      ),
    );
  }

  let keyCounter = 0;

  ROOT: do {
    const keyCount = faker.number.int({ min: 1, max: MAX_KEYS_PER_OBJECT });

    const keys: string[] = [];

    for (let i = 0; i < keyCount; i++) {
      let key: string;

      if (collisionsMatters) {
        do {
          key = `${faker.word.sample()}_${keyCounter++}`;

          if (key in existentKeys) {
            ++keysCollisionsCounter;
            printCounters();
          } else {
            ++existentKeysCounter;
            existentKeys[key] = 0;
            printCounters();
            break;
          }
        } while (true);
      } else {
        key = faker.word.sample();

        if (key in existentKeys) {
          ++keysCollisionsCounter;
          printCounters();
        } else {
          ++existentKeysCounter;
          existentKeys[key] = 0;
          printCounters();
        }
      }

      keys.push(key);
    }

    if (collisionsMatters) {
      keys.sort();

      const shape = keys.join('');

      if (existentShapes.has(shape)) {
        ++shapesCollisionsCounter;
        printCounters();
        continue;
      }

      existentShapes.add(shape);
    }

    // secure at least 10 repeated shapes in the different shapes file
    const totalSecuredRepeatedShapes = collisionsMatters ? 1 : 10;

    shapesCollisionsCounter += totalSecuredRepeatedShapes - 1;

    for (let i = 0; i < totalSecuredRepeatedShapes; i++) {
      const object: Record<string, string> = {};

      for (const key of keys) {
        object[key] = faker.lorem.word();
      }

      ++objectsCounter;

      outputStream.write(JSON.stringify(object));

      if (objectsCounter < TOTAL_OBJECTS) {
        outputStream.write(',');
      }

      printCounters();

      if (objectsCounter >= TOTAL_OBJECTS) {
        break ROOT;
      }
    }
  } while (objectsCounter < TOTAL_OBJECTS);

  process.stdout.write('\n');

  outputStream.write(']');
  outputStream.end();

  const endTime = Date.now();

  const seconds = (endTime - startTime) / 1000;

  console.log(
    chalk.green(
      `Finished generating ${objectsCounter.toLocaleString()} objects in ${seconds.toFixed(2)} seconds!`,
    ),
  );
}

(() => {
  console.log(
    chalk.green(
      `Generating objects with different shapes in "${DIFFERENT_SHAPES_FILE_PATH}"...`,
    ),
  );
  generateObjects(DIFFERENT_SHAPES_FILE_PATH, true);

  console.log(
    chalk.green(
      `Generating objects with same shapes in "${SAME_SHAPES_FILE_PATH}"...`,
    ),
  );
  generateObjects(SAME_SHAPES_FILE_PATH, false);
})();
