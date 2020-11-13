const { jitsiFlow } = require("../tests/jitsi");
const { initDriver } = require("./driver");

// run one test
const runTest = async (test) => {
  console.log(`Running test: ${test.name}…`);
  const browsers = [];

  // init drivers
  for (const browser of test.browsers) {
    console.log(` - init browser driver for ${browser.name} (${browser.type})`);
    browsers.push(initDriver(browser));
  }

  // run test
  try {
    if (!test.target) {
      throw new Error(`no target defined for the test '${test.name}'`);
    }

    switch (test.target.type) {
      case "jitsi":
        await Promise.all(
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
  }
};

// run all tests one by one
const runTests = async (tests) => {
  for (const test of tests) {
    await runTest(test);
  }
};

module.exports = {
  runTests,
};
