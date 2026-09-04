import type { BenchOptions, Task } from 'tinybench';

import type BenchAdapter from './adapters/benchAdapter';
import type InstrumentedBench from './instrumentedBench';

export type InstrumentedBenchEvent =
  | {
      name: 'bench:added';
      bench: InstrumentedBench;
    }
  | {
      name: 'bench:complete';
      bench: InstrumentedBench;
    }
  | {
      name: 'bench:start';
      bench: InstrumentedBench;
    }
  | {
      name: 'task:abort';
      bench: InstrumentedBench;
      task: Task;
      reason?: string;
    }
  | {
      name: 'task:added';
      bench: InstrumentedBench;
      task: Task;
    }
  | {
      name: 'task:start';
      bench: InstrumentedBench;
      task: Task;
    }
  | {
      name: 'task:warmup';
      bench: InstrumentedBench;
      task: Task;
    }
  | {
      name: 'task:complete';
      bench: InstrumentedBench;
      task: Task;
    };

export type InstrumentedBenchOptions = Omit<BenchOptions, 'name'> & {
  adapters: BenchAdapter[];
  name: string;
};
