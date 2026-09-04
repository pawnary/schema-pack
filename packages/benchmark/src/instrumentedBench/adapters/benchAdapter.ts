import type { InstrumentedBenchEvent } from '../types.ts';

export default interface BenchAdapter {
  handle(event: InstrumentedBenchEvent): void;
}
