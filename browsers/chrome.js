const { Builder } = require("selenium-webdriver");
const browser = require("selenium-webdriver/chrome");

const browserName = "chrome";

const options = new browser.Options();
options.addArguments(
  "use-fake-device-for-media-stream",
  "use-fake-ui-for-media-stream"
);

const buildDriver = (config) => {
  let type = "local";
  if (config && config.type) {
    type = config.type;
  }

  switch (type) {
    case "local":
      return new Builder()
        .forBrowser(browserName)
        .setChromeOptions(options)
        .build();

    case "browserstack":
      return new Builder()
        .usingServer(
          `https://${config.username}:${config.accessKey}@hub.browserstack.com/wd/hub`
        )
        .forBrowser(browserName)
        .setChromeOptions(options)
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
