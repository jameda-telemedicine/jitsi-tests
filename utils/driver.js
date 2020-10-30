const { Chrome, Firefox } = require("../browsers");
const { config } = require("../utils/config");

const buildBrowserDriver = (browser) => {
  switch (browser) {
    case "firefox":
      return Firefox.buildDriver(config);

    case "chrome":
      return Chrome.buildDriver(config);

    default:
      throw new Error(`unsupported browser: '${browser}'`);
  }
};

module.exports = {
  buildBrowserDriver,
};
