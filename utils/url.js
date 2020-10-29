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

module.exports = {
  buildJitsiUrl,
  jitsiUrl,
};
