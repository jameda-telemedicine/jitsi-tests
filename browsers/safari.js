const { Builder } = require("selenium-webdriver");
const browser = require("selenium-webdriver/safari");

const browserName = "safari";

const options = new browser.Options();

const fetchBuilder = (capabilities) => {
  let builder = new Builder();
  if (capabilities) {
    builder = builder.withCapabilities(capabilities);
  }
  return builder.forBrowser(browserName).setSafariOptions(options);
};

module.exports = {
  browser,
  browserName,
  fetchBuilder,
  options,
};
