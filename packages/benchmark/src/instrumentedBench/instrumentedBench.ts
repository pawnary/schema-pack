import { Bench, type Task } from 'tinybench';

import type BenchAdapter from './adapters/benchAdapter.ts';
import type {
  InstrumentedBenchEvent,
  InstrumentedBenchOptions,
} from './types.ts';

class InstrumentedBench extends Bench {
  readonly adapters: readonly BenchAdapter[];

  constructor(options: InstrumentedBenchOptions) {
    super(options);

    this.adapters = options.adapters;

    this.emit({ bench: this, name: 'bench:added' });

    // this.addEventListener('abort', (event) => {
    //   console.log(event.task);
    //   this.emit({
    //     bench: this,
    //     name: 'bench:abort',
    //     reason: String(this.abortController.signal.reason),
    //   });
    //   process.exit(1);
    // });

    this.addEventListener('add', (event) => {
      this.bindTask(event.task);
    });

    this.addEventListener('start', () => {
      this.emit({ bench: this, name: 'bench:start' });
    });

    this.addEventListener('complete', () => {
      this.emit({ bench: this, name: 'bench:complete' });
    });

    // 'add'
    // 'complete'
    // 'start'

    // 'abort'
    // 'cycle'
    // 'error'
    // 'remove'
    // 'reset'
    // 'warmup'
    // 'warning'
  }

  protected bindTask(task: Task): void {
    this.emit({
      bench: this,
      name: 'task:added',
      task,
    });

    task.addEventListener('start', () => {
      this.emit({
        bench: this,
        name: 'task:start',
        task,
      });
    });

    task.addEventListener('warmup', () => {
      this.emit({
        bench: this,
        name: 'task:warmup',
        task,
      });
    });

    task.addEventListener('abort', () => {
      this.emit({
        bench: this,
        name: 'task:abort',
        task,
      });
    });

    task.addEventListener('complete', () => {
      this.emit({
        bench: this,
        name: 'task:complete',
        task,
      });
    });

    // 'cycle'
    // 'error'
    // 'reset'
    // 'warning'

    // 'complete'
    // 'abort'
    // 'warmup'
    //  'start'
  }

  protected emit(event: InstrumentedBenchEvent): void {
    for (const adapter of this.adapters) {
      adapter.handle(event);
    }
  }
}

export default InstrumentedBench;
