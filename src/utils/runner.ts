import { newBuilder } from 'junit-report-builder';
import { ThenableWebDriver } from 'selenium-webdriver';
import { waitSeconds } from '../steps/time';
import { initDriver } from './driver';
import { startTest, TestStep } from './tests';
import { buildInstanceUrl } from './url';
import {
  createTaskSystem,
  resolveAndCreateTask,
  TaskArgs,
} from '../tasks/task';
import {
  BrowserTask,
  InitializedBrowser,
  InternalBrowser,
} from '../types/browsers';
import { InternalTest } from '../types/tests';

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
  console.log(`- Running test: ${test.name}…`);
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
  const { scenario, instance } = test;
  const { tasks } = scenario;
  const targetUrl = buildInstanceUrl(instance);
  let flowResults: PromiseSettledResult<TestStep[]>[] = [];

  const taskSystem = createTaskSystem();

  flowResults = await Promise.allSettled(
    browsers.map(async (browser) => {
      const { step, end } = startTest(browser.name);
      const driver = await step('build driver', () => browser.driver.build()) as unknown as ThenableWebDriver;
      const internalBrowser: InternalBrowser = browser;
      delete internalBrowser.driver;
      const browserTask: BrowserTask = internalBrowser;

      // eslint-disable-next-line no-restricted-syntax
      for (const task of tasks) {
        const { name } = task;

        const args: TaskArgs = {
          name,
          params: task.params,
          participants: test.participants,
          driver,
          browser: browserTask,
          debug: true,
        };

        await step(name, async () => (await resolveAndCreateTask(task, args, taskSystem)).run());
      }

      await Promise.allSettled([driver.close()]);
      if (!browser.provider.isLocal) {
        await Promise.allSettled([driver.quit()]);
      }

      return end();
    }),
  );

  const suites: TestStep[][] = [];
  flowResults.forEach((res) => {
    if (res.status === 'fulfilled') {
      suites.push(res.value);
    } else {
      console.error('ERROR: something went bad during a browser flow:', res.reason);
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
