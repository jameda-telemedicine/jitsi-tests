const fs = require("fs");

const takeScreenshot = async (driver) => {
  const now = Date.now();
  const image = await driver.takeScreenshot();
  fs.writeFile(`./out/screenshots/${now}.png`, image, "base64", () => {});
};

module.exports = {
  takeScreenshot,
};
