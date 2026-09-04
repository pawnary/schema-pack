import { styleText } from 'node:util';

import { Table } from 'console-table-printer';
import { createLogUpdate } from 'log-update';
import { formatNumber, mToNs, type Task } from 'tinybench';

import type InstrumentedBench from '../instrumentedBench';
import type { InstrumentedBenchEvent } from '../types';
import type BenchAdapter from './benchAdapter';

const statesWithResults = new Set(['aborted-with-statistics', 'completed']);

function hasResults(task: Task): task is Task & {
  result: { state: 'aborted-with-statistics' | 'completed' };
} {
  return statesWithResults.has(task.result.state);
}

class CLIAdapter implements BenchAdapter {
  currentBench?: InstrumentedBench;

  logUpdate = createLogUpdate(process.stdout, { showCursor: true });

  fetchBenchPlaces(bench: InstrumentedBench): WeakMap<Task, number> {
    const places = new WeakMap<Task, number>();

    for (const task of bench.tasks) {
      if (!hasResults(task)) {
        continue;
      }

      const latencyMean = task.result.latency.mean;
      let place = 1;

      for (const otherTask of bench.tasks) {
        if (otherTask === task || !hasResults(otherTask)) {
          continue;
        }

        const otherLatencyMean = otherTask.result.latency.mean;

        if (otherLatencyMean < latencyMean) {
          place++;
        }
      }

      places.set(task, place);
    }

    return places;
  }

  renderTable(event: InstrumentedBenchEvent): string {
    const bench = this.currentBench;

    let tableTitle = 'Loading...';

    if (bench) {
      tableTitle = bench.name ?? 'unknown';
    }

    // oxlint-disable-next-line default-case - all cases are handled explicitly
    switch (event.name) {
      case 'bench:added': {
        tableTitle = `${tableTitle} (added)`;
        break;
      }
      case 'bench:complete': {
        tableTitle = `${tableTitle} (completed)`;
        break;
      }
      case 'bench:start': {
        tableTitle = `${tableTitle} (running...)`;
        break;
      }
      case 'task:abort': {
        tableTitle = `${tableTitle} (task aborted)`;
        break;
      }
      case 'task:added': {
        tableTitle = `${tableTitle} (task added)`;
        break;
      }
      case 'task:complete': {
        tableTitle = `${tableTitle} (task completed)`;
        break;
      }
      case 'task:start': {
        tableTitle = `${tableTitle} (running task...)`;
        break;
      }
      case 'task:warmup': {
        tableTitle = `${tableTitle} (warming up task...)`;
        break;
      }
    }

    const table = new Table({
      columns: [
        { alignment: 'center', name: 'State' },
        { alignment: 'left', name: 'Task name' },
        { alignment: 'center', name: 'Latency avg (ns)' },
        { alignment: 'center', name: 'Latency med (ns)' },
        { alignment: 'center', name: 'Throughput avg (ops/s)' },
        { alignment: 'center', name: 'Throughput med (ops/s)' },
        { alignment: 'center', name: 'Samples' },
      ],
      title: tableTitle,
    });

    if (!bench) {
      return table.render();
    }

    const places = this.fetchBenchPlaces(bench);

    for (const task of bench.tasks) {
      let state: string = task.result.state;
      let latencyAvg = '-';
      let latencyMed = '-';
      let throughputAvg = '-';
      let throughputMed = '-';
      let samples = '-';
      let rowColor: string | undefined;

      if (task.result.state === 'started') {
        state = styleText('yellow', state);
      } else if (task.result.state === 'completed') {
        state = styleText('green', state);

        latencyAvg = `${formatNumber(mToNs(task.result.latency.mean))} \u00B1 ${task.result.latency.rme.toFixed(2)}%`;
        latencyMed = `${formatNumber(mToNs(task.result.latency.p50))} \u00B1 ${formatNumber(mToNs(task.result.latency.mad))}`;
        throughputAvg = `${Math.round(task.result.throughput.mean).toString()} \u00B1 ${task.result.throughput.rme.toFixed(2)}%`;
        throughputMed = `${Math.round(task.result.throughput.p50).toString()} \u00B1 ${Math.round(task.result.throughput.mad).toString()}`;
        samples = task.result.latency.samplesCount.toLocaleString();

        const place = places.get(task);

        if (place === 1) {
          rowColor = 'green';
        } else if (place === 2) {
          rowColor = 'yellow';
        } else if (place === 3) {
          rowColor = 'blue';
        }
      } else if (task.result.state === 'aborted') {
        rowColor = 'red';
      }

      table.addRow(
        {
          'Latency avg (ns)': latencyAvg,
          'Latency med (ns)': latencyMed,
          Samples: samples,
          State: state,
          'Task name': task.name,
          'Throughput avg (ops/s)': throughputAvg,
          'Throughput med (ops/s)': throughputMed,
        },
        { color: rowColor },
      );
    }

    return table.render();
  }

  handle(event: InstrumentedBenchEvent): void {
    if (event.name === 'bench:added') {
      if (!this.currentBench) {
        this.currentBench = event.bench;
        // this.currentDataType = event.bench.dataType
      }
    } else if (
      event.name === 'bench:start' ||
      event.name === 'task:warmup' ||
      event.name === 'task:start'
    ) {
      this.currentBench = event.bench;
    }

    const table = this.renderTable(event);

    if (event.name === 'bench:complete') {
      this.logUpdate.persist(table);
    } else {
      this.logUpdate(table);
    }
  }
}

export default CLIAdapter;
