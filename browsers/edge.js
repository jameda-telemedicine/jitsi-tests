const { Builder } = require("selenium-webdriver");
const browser = require("selenium-webdriver/edge");

const browserName = "MicrosoftEdge";

const options = new browser.Options();
options.addArguments(
  "use-fake-device-for-media-stream",
  "use-fake-ui-for-media-stream"
);

const fetchBuilder = (capabilities) => {
  let builder = new Builder();
  if (capabilities) {
    builder = builder.withCapabilities(capabilities);
  }
  return builder.forBrowser(browserName).setEdgeOptions(options);
};

module.exports = {
  browser,
  browserName,
  fetchBuilder,
  options,
};