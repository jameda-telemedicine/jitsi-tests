const { cencorsSensitiveUrlInformations } = require("../utils/url");

// get current URL
const getCurrentUrl = async (driver) => {
  let currentUrl = await driver.getCurrentUrl();
  return cencorsSensitiveUrlInformations(currentUrl);
};

module.exports = {
  getCurrentUrl,
};
