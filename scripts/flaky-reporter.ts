
import {
  type FullConfig,
  type FullResult,
  type Reporter,
  type TestCase,
  type TestResult,
} from '@playwright/test/reporter';
import fs from 'node:fs';
import path from 'node:path';

type FlakyTestRecord = {
  title: string;
  file: string;
  project: string;
  retry: number;
  durationMs: number;
};

class FlakyTestReporter implements Reporter {
  private flakyTests: FlakyTestRecord[] = [];

  onBegin(_config: FullConfig): void {
    this.flakyTests = [];
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    // A test is flaky when it passes after at least one retry.
    if (result.status !== 'passed' || result.retry === 0) {
      return;
    }

    const record: FlakyTestRecord = {
      title: test.titlePath().filter(Boolean).join(' > '),
      file: path.relative(process.cwd(), test.location.file),
      project: test.parent.project()?.name ?? 'unknown',
      retry: result.retry,
      durationMs: result.duration,
    };

    this.flakyTests.push(record);
  }

  async onEnd(_result: FullResult): Promise<void> {
    const outputDir = path.resolve('artifacts');
    const outputFile = path.join(outputDir, 'flaky-tests.md');

    fs.mkdirSync(outputDir, { recursive: true });

    const lines = [
      '# Flaky Test Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      `Flaky tests detected: ${this.flakyTests.length}`,
      '',
    ];

    if (this.flakyTests.length === 0) {
      lines.push('No tests passed after a retry in this run.');
    } else {
      lines.push(
        '| Test | File | Project | Retry | Duration (ms) |',
        '|---|---|---|---:|---:|',
      );

      for (const test of this.flakyTests) {
        lines.push(
          `| ${test.title} | ${test.file} | ${test.project} | ${test.retry} | ${test.durationMs} |`,
        );
      }
    }

    fs.writeFileSync(outputFile, `${lines.join('\n')}\n`, 'utf8');

    console.log(`\nFlaky test report written to: ${outputFile}`);
    console.log(`Flaky tests detected: ${this.flakyTests.length}`);
  }
}

export default FlakyTestReporter;
