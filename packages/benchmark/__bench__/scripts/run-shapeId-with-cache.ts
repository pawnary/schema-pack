#!/usr/bin/env ts-node

import chalk from 'chalk';

import {
  DIFFERENT_SHAPES_FILE_PATH,
  SAME_SHAPES_FILE_PATH,
} from '../constants.ts';
import bitmaskWithCache, {
  tearDown as bitmaskWithCacheTearDown,
} from '../shapeId/algorithms/bitmask/withCache.ts';
import commutativeHashWithCache, {
  tearDown as commutativeHashWithCacheTearDown,
} from '../shapeId/algorithms/commutativeHash/withCache.ts';
import fmix32WithCache, {
  tearDown as fmix32WithCacheTearDown,
} from '../shapeId/algorithms/fmix32/withCache.ts';
import fnvXorHashWithCache, {
  tearDown as fnvXorHashWithCacheTearDown,
} from '../shapeId/algorithms/fnvXorHash/withCache.ts';
import murmurHashTokenXorWithCache, {
  tearDown as murmurHashTokenXorWithCacheTearDown,
} from '../shapeId/algorithms/murmurHashTokenXor/withCache.ts';
import murmurHashWithObjectWithCache, {
  tearDown as murmurHashWithObjectWithCacheTearDown,
} from '../shapeId/algorithms/murmurHashWithObject/withCache.ts';
import sortedNumericalKeysWithCache, {
  tearDown as sortedNumericalKeysWithCacheTearDown,
} from '../shapeId/algorithms/sortedNumericalKeys/withCache.ts';
import sortedStringKeysWithCache, {
  tearDown as sortedStringKeysWithCacheTearDown,
} from '../shapeId/algorithms/sortedStringKeys/withCache.ts';
import zobristWithCache, {
  tearDown as zobristWithCacheTearDown,
} from '../shapeId/algorithms/zobrist/withCache.ts';
import runner, {
  type AlgorithmFunction,
  type TearDownFunction,
} from '../shapeId/runner.ts';

(() => {
  console.log(
    chalk.bgGreen(
      '###############################################################',
    ),
  );
  console.log(
    chalk.bgGreen(
      `# Running shape ID algorithms ${chalk.bgGreen.bold('with')} caching (no collisions)... #`,
    ),
  );
  console.log(
    chalk.bgGreen(
      '###############################################################',
    ),
  );

  const withCacheAlgorithms: [AlgorithmFunction, TearDownFunction][] = [
    [murmurHashWithObjectWithCache, murmurHashWithObjectWithCacheTearDown],
    [fmix32WithCache, fmix32WithCacheTearDown],
    [murmurHashTokenXorWithCache, murmurHashTokenXorWithCacheTearDown],
    [bitmaskWithCache, bitmaskWithCacheTearDown],
    [commutativeHashWithCache, commutativeHashWithCacheTearDown],
    [fnvXorHashWithCache, fnvXorHashWithCacheTearDown],
    [sortedStringKeysWithCache, sortedStringKeysWithCacheTearDown],
    [sortedNumericalKeysWithCache, sortedNumericalKeysWithCacheTearDown],
    [zobristWithCache, zobristWithCacheTearDown],
  ];

  runner(DIFFERENT_SHAPES_FILE_PATH, withCacheAlgorithms, true);

  console.log(
    chalk.bgGreen(
      '#################################################################',
    ),
  );
  console.log(
    chalk.bgGreen(
      `# Running shape ID algorithms ${chalk.bgGreen.bold('with')} caching (with collisions)... #`,
    ),
  );
  console.log(
    chalk.bgGreen(
      '#################################################################',
    ),
  );

  runner(SAME_SHAPES_FILE_PATH, withCacheAlgorithms, true);
})();
