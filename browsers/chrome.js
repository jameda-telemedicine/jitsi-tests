const { Builder } = require("selenium-webdriver");
const browser = require("selenium-webdriver/chrome");

const browserName = "chrome";

const options = new browser.Options();
options.addArguments(
  "use-fake-device-for-media-stream",
  "use-fake-ui-for-media-stream"
);

const fetchBuilder = () => {
  return new Builder().forBrowser(browserName).setChromeOptions(options);
};

module.exports = {
  browser,
  browserName,
  fetchBuilder,
  options,
};
