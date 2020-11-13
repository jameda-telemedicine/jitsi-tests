const builder = require("junit-report-builder");

const { jitsiFlow } = require("../tests/jitsi");
const { initDriver } = require("./driver");

// run one test
const runTest = async (test, report) => {
  const suite = report.testSuite().name(test.name);
  console.log(`Running test: ${test.name}…`);
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
  const testTargetInit = suite.testCase().name(`test target`);
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
    return;
  }
};

// run all tests one by one
const runTests = async (tests) => {
  const report = builder.newBuilder();

  for (const test of tests) {
    await runTest(test, report);
  }

  report.writeTo("test-report.xml");
};

module.exports = {
  runTests,
};
