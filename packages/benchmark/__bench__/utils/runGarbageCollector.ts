export default function runGarbageCollector() {
  if (!global.gc) {
    throw new Error(
      'Garbage collection is not exposed. Use --expose-gc when running the script.',
    );
  }

  global.gc();
}
