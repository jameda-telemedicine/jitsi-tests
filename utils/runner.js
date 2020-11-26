const builder = require("junit-report-builder");
const { waitSeconds } = require("../steps/time");

const { jitsiFlow } = require("../tests/jitsi");
const { initDriver } = require("./driver");

const addItemsToSuite = (suite, items) => {
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
      case "failure":
        testCase.failure(item.message);
        testCase.time(item.duration / 1000);
        stats.failure++;
        break;

      case "skipped":
        testCase.skipped();
        stats.skipped++;
        break;

      default:
        testCase.time(item.duration / 1000);
        stats.success++;
        break;
    }
  });

  return stats;
};

// run one test
const runTest = async (test, report) => {
  console.log(`Running test: ${test.name}…`);
  const suite = report.testSuite().name(test.name);
  const browsers = [];

  // init drivers
  for (const browser of test.browsers) {
    console.log(
      ` - init browser driver for ${browser.name} (${browser.type})…`
    );

    const testDriverInit = suite
      .testCase()
      .name(`${browser.name} driver initialization`);
    try {
      browsers.push(initDriver(browser));
    } catch (e) {
      testDriverInit.failure(e.message);
    }
  }

  // run test
  const testTargetInit = suite.testCase().name(`run test ${test.name}`);
  let flowResults = [];
  try {
    if (!test.target) {
      throw new Error(`no target defined for the test '${test.name}'`);
    }

    switch (test.target.type) {
      case "jitsi":
        flowResults = await Promise.allSettled(
          browsers.map((browser) =>
            jitsiFlow(browser, test.target.url, test.participants)
          )
        );
        break;

      default:
        throw new Error(`unsupported target type (${test.target.type})`);
    }
  } catch (e) {
    console.error(` - !! FAILED: ${e.message}`);
    testTargetInit.failure(e.message);
  }

  let suites = [];
  flowResults.map((res) => {
    if (res.status == "fulfilled") {
      suites.push(res.value);
    } else {
      console.log(res.reason);
      testTargetInit.failure(res.reason.message);
    }
  });

  return addItemsToSuite(suite, suites);
};

// run all tests one by one
const runTests = async (tests) => {
  const waitTimeAfterFailure = 60;
  const report = builder.newBuilder();

  for (const test of tests) {
    const testStats = await runTest(test, report);
    console.log(
      ` -> ${testStats.success} success, ${testStats.failure} failed and ${testStats.skipped} skipped`
    );
    if (testStats.failure > 0) {
      console.error(
        ` --> some tests failed (waiting ${waitTimeAfterFailure}sec)`
      );
      await waitSeconds(waitTimeAfterFailure);
    }
  }

  report.writeTo("test-report.xml");
};

module.exports = {
  runTests,
};
