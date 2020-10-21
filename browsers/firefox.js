const { Builder } = require("selenium-webdriver");
const browser = require("selenium-webdriver/firefox");

const browserName = "firefox";

const options = new browser.Options();
options.setPreference("media.navigator.permission.disabled", true);
options.setPreference("media.navigator.streams.fake", true);

const buildDriver = (config) => {
  let type = "local";
  if (config && config.type) {
    type = config.type;
  }

  switch (type) {
    case "local":
      return new Builder()
        .forBrowser(browserName)
        .setFirefoxOptions(options)
        .build();

    case "browserstack":
      return new Builder()
        .usingServer(
          `https://${config.username}:${config.accessKey}@hub.browserstack.com/wd/hub`
        )
        .forBrowser(browserName)
        .setFirefoxOptions(options)
        .build();

    default:
      throw new Error(`unsupported type: '${type}'`);
  }
};

module.exports = {
  browser,
  browserName,
  buildDriver,
  options,
};
