const { config } = require("./config");

const buildJitsiUrl = (config) => {
  const base = config.base.endsWith("/") ? config.base : `${config.base}/`;
  let params = "?analytics.disabled=true";
  if (config.jwt && config.jwt !== "") {
    params = `${params}&jwt=${config.jwt}`;
  }
  return `${base}${config.room}${params}`;
};

const jitsiUrl = buildJitsiUrl(config);

const getCurrentUrl = async (driver) => {
  let currentUrl = await driver.getCurrentUrl();
  if (config.jwt && config.jwt !== "") {
    currentUrl = `${currentUrl}`.replace(`jwt=${config.jwt}`, "jwt=********");
  }
  return currentUrl;
};

module.exports = {
  buildJitsiUrl,
  jitsiUrl,
  getCurrentUrl,
};
