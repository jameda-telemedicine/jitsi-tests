const { Builder } = require("selenium-webdriver");
const browser = require("selenium-webdriver/safari");

const browserName = "safari";

const options = new browser.Options();

const fetchBuilder = () => {
  return new Builder().forBrowser(browserName).setSafariOptions(options);
};

module.exports = {
  browser,
  browserName,
  fetchBuilder,
  options,
};
