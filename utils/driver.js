const { basicAuthUrl } = require("./url");
const { Firefox, Chrome, Safari, Edge } = require("../browsers");

// fetch builder for specific browser
const fetchBrowserDriver = (browserName) => {
  switch (browserName) {
    case "firefox":
      return Firefox.fetchBuilder();

    case "chrome":
      return Chrome.fetchBuilder();

    case "safari":
      return Safari.fetchBuilder();

    case "edge":
      return Edge.fetchBuilder();

    default:
      throw new Error(`unsupported browser type: '${browserName}'`);
  }
};

// initialize driver for a browser
const initDriver = (browser) => {
  const driver = fetchBrowserDriver(browser.type);
  const provider = browser.provider;
  let url;

  switch (provider.type) {
    case "local":
      browser.driver = driver;
      break;

    case "hub":
      url = basicAuthUrl(provider.url, provider.credentials);
      if (url.endsWith("/")) {
        url = `${url}/`;
      }
      browser.driver = driver.usingServer(`${url}/wd/hub`);
      break;

    case "browserstack":
      url = basicAuthUrl(
        "https://hub.browserstack.com/wd/hub",
        provider.credentials
      );
      browser.driver = driver.usingServer(url);
      break;

    default:
      throw new Error(`unsupported provider type: '${provider.type}'`);
  }

  return browser;
};

module.exports = {
  initDriver,
};
