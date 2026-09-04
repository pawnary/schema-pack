import type { InstrumentedBenchEvent } from '../types';

export default interface BenchAdapter {
  handle(event: InstrumentedBenchEvent): void;
}
