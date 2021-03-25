import { newBuilder } from 'junit-report-builder';
import { ThenableWebDriver } from 'selenium-webdriver';
import { waitSeconds } from '../lib/time';
import { initDriver } from './driver';
import { startTest, TestStep } from './tests';
import { buildInstanceUrl } from './url';
import {
  createTaskSystem,
  resolveAndCreateTask,
  TaskArgs,
  TaskObject,
  TaskSystem,
} from '../tasks/task';
import {
  BrowserTask,
  InitializedBrowser,
  InternalBrowser,
} from '../types/browsers';
import { InternalTest } from '../types/tests';
import { InternalInstance } from '../types/instances';

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

const removeBrowserDriver = (browser: InitializedBrowser): BrowserTask => {
  const internalBrowser: InternalBrowser = browser;
  delete internalBrowser.driver;
  return internalBrowser;
};

type BrowserFlowArgs = {
  browser: InitializedBrowser;
  targetUrl: string;
  participants: number;
  tasks: TaskObject[];
  taskSystem: TaskSystem;
  instance: InternalInstance;
  browserIndex: number;
};

const browserFlow = async (args: BrowserFlowArgs) => {
  const {
    browser, taskSystem, participants, targetUrl, instance, browserIndex,
  } = args;

  const { step, end } = startTest(browser.name);
  const driver = await step('build driver', () => browser.driver.build()) as unknown as ThenableWebDriver;
  await step('open instance', () => driver.get(targetUrl));
  const browserTask: BrowserTask = removeBrowserDriver(browser);
  const storage = new Map<string, string>();

  let i = 0;
  for (const task of args.tasks) {
    const { name } = task;

    const taskArgs: TaskArgs = {
      name,
      params: task.params,
      participants,
      driver,
      browser: browserTask,
      debug: false,
      instance,
      browserIndex,
      taskIndex: i,
      storage,
    };

    i += 1;

    await step(name, async () => (await resolveAndCreateTask(task, taskArgs, taskSystem)).run());
  }

  await Promise.allSettled([driver.close()]);
  if (!browser.provider.isLocal) {
    await Promise.allSettled([driver.quit()]);
  }

  return end();
};

const initDrivers = (browsers: InternalBrowser[]): InitializedBrowser[] => {
  const initializedBrowsers: InitializedBrowser[] = [];

  // init drivers
  browsers.forEach((browser) => {
    try {
      initializedBrowsers.push(initDriver(browser));
    } catch (e) {
      console.error(`  ERROR: unable to init driver for for ${browser.name} (${browser.type}):`, e.message);
    }
  });

  return initializedBrowsers;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runTest = async (test: InternalTest, report: any) => {
  console.log(`- Running test: ${test.name}…`);
  const suite = report.testSuite().name(test.name);
  const browsers = initDrivers(test.browsers);
  const { scenario, instance } = test;
  const { room } = instance;

  if (!instance.suffixed && instance.randomSuffix) {
    instance.suffixed = true;
    let randomSuffix = '';
    if (!room.endsWith('-')) {
      randomSuffix = '-';
    }
    const randomNumber = Math.floor(Math.random() * 1_000_000_000);
    instance.room = `${room}${randomSuffix}${randomNumber}`;
  }

  const { tasks } = scenario;
  const targetUrl = buildInstanceUrl(instance);
  const taskSystem = createTaskSystem();

  const flowResults = await Promise.allSettled(
    browsers.map(async (browser, browserIndex) => browserFlow({
      browser,
      targetUrl,
      taskSystem,
      participants: test.participants,
      tasks,
      instance,
      browserIndex,
    })),
  );

  const suites: TestStep[][] = [];
  flowResults.forEach((res) => {
    if (res.status === 'fulfilled') {
      suites.push(res.value);
    } else {
      console.error('  ERROR: something went bad during a browser flow:', res.reason);
    }
  });

  return addItemsToSuite(suite, suites.flat());
};

// run all tests one by one
export const runTests = async (tests: InternalTest[]): Promise<void> => {
  const waitTimeAfterFailure = 60;
  const report = newBuilder();

  const parallelTests = tests.filter((test) => test.instance.parallel);
  const nonParallelTests = tests.filter((test) => !test.instance.parallel);

  await Promise.all(parallelTests.map(async (test) => {
    const testStats = await runTest(test, report);
    console.log(
      `  -> ${testStats.success} success, ${testStats.failure} failed and ${testStats.skipped} skipped (${test.name})`,
    );
  }));

  // eslint-disable-next-line no-restricted-syntax
  for (const test of nonParallelTests) {
    const testStats = await runTest(test, report);
    console.log(
      `  -> ${testStats.success} success, ${testStats.failure} failed and ${testStats.skipped} skipped`,
    );
    if (testStats.failure > 0) {
      if (test.instance.randomSuffix) {
        console.error(
          '  --> some tests failed',
        );
      } else {
        console.error(
          `  --> some tests failed (waiting ${waitTimeAfterFailure}sec)`,
        );
        await waitSeconds(waitTimeAfterFailure);
      }
    }
  }

  report.writeTo('test-report.xml');
};
