import path from 'node:path';

export const OUTPUT_FOLDER = '../.samples';

export const ABSOLUTE_OUTPUT_FOLDER = path.resolve(
  import.meta.dirname,
  OUTPUT_FOLDER,
);

export const DIFFERENT_SHAPES_FILE_PATH = path.resolve(
  ABSOLUTE_OUTPUT_FOLDER,
  'different-shapes.json',
);
export const SAME_SHAPES_FILE_PATH = path.resolve(
  ABSOLUTE_OUTPUT_FOLDER,
  'same-shapes.json',
);

export const DURATION_SECONDS = 5;
