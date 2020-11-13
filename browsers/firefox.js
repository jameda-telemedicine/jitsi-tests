const { Builder } = require("selenium-webdriver");
const browser = require("selenium-webdriver/firefox");

const browserName = "firefox";

const options = new browser.Options();
options.setPreference("media.navigator.permission.disabled", true);
options.setPreference("media.navigator.streams.fake", true);

const fetchBuilder = () => {
  return new Builder().forBrowser(browserName).setFirefoxOptions(options);
};

module.exports = {
  browser,
  browserName,
  fetchBuilder,
  options,
};
