import { newBuilder } from 'junit-report-builder';
import { waitSeconds } from '../steps/time';

import { jitsiFlow } from '../tests/jitsi';
import { InitializedBrowser, InternalTest } from '../types';
import { initDriver } from './driver';
import { TestStep } from './tests';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addItemsToSuite = (suite: any, items: TestStep[]) => {
  const stats = {
    failure: 0,
    skipped: 0,
    success: 0,
  };

  // sort items by start time
  const sortedItems = items.flat().sort((a, b) => a.start - b.start);

  // add every item to the suite
  sortedItems.forEach((item) => {
    const testCase = suite.testCase().name(`[${item.browser}] ${item.name}`);

    switch (item.status) {
      case 'failure':
        testCase.failure(item.message);
        if (item.duration) {
          testCase.time(item.duration / 1000);
        }
        stats.failure += 1;
        break;

      case 'skipped':
        testCase.skipped();
        stats.skipped += 1;
        break;

      default:
        if (item.duration) {
          testCase.time(item.duration / 1000);
        }
        stats.success += 1;
        break;
    }
  });

  return stats;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runTest = async (test: InternalTest, report: any) => {
  console.log(`Running test: ${test.name}…`);
  const suite = report.testSuite().name(test.name);
  const browsers: InitializedBrowser[] = [];

  // init drivers
  test.browsers.forEach((browser) => {
    console.log(
      ` - init browser driver for ${browser.name} (${browser.type})…`,
    );

    const testDriverInit = suite
      .testCase()
      .name(`${browser.name} driver initialization`);
    try {
      browsers.push(initDriver(browser));
    } catch (e) {
      testDriverInit.failure(e.message);
    }
  });

  // run test
  const testTargetInit = suite.testCase().name(`run test ${test.name}`);
  let flowResults: PromiseSettledResult<TestStep[]>[] = [];
  try {
    if (!test.target) {
      throw new Error(`no target defined for the test '${test.name}'`);
    }

    switch (test.target.type) {
      case 'jitsi':
        flowResults = await Promise.allSettled(
          browsers.map((browser) => jitsiFlow(browser, test.target.url, test.participants)),
        );
        break;

      default:
        throw new Error(`unsupported target type (${test.target.type})`);
    }
  } catch (e) {
    console.error(` - !! FAILED: ${e.message}`);
    testTargetInit.failure(e.message);
  }

  const suites: TestStep[][] = [];
  flowResults.forEach((res) => {
    if (res.status === 'fulfilled') {
      suites.push(res.value);
    } else {
      console.log(res.reason);
      testTargetInit.failure(res.reason.message);
    }
  });

  return addItemsToSuite(suite, suites.flat());
};

// run all tests one by one
export const runTests = async (tests: InternalTest[]): Promise<void> => {
  const waitTimeAfterFailure = 60;
  const report = newBuilder();

  // eslint-disable-next-line no-restricted-syntax
  for (const test of tests) {
    const testStats = await runTest(test, report);
    console.log(
      ` -> ${testStats.success} success, ${testStats.failure} failed and ${testStats.skipped} skipped`,
    );
    if (testStats.failure > 0) {
      console.error(
        ` --> some tests failed (waiting ${waitTimeAfterFailure}sec)`,
      );
      await waitSeconds(waitTimeAfterFailure);
    }
  }

  report.writeTo('test-report.xml');
};
