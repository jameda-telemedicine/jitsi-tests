import fs from 'fs';
import { ThenableWebDriver } from 'selenium-webdriver';

export const takeScreenshot = async (driver: ThenableWebDriver): Promise<void> => {
  const now = Date.now();
  const fileName = `./out/screenshots/${now}.png`;
  const image = await driver.takeScreenshot();

  await fs.promises.writeFile(fileName, image, 'base64');
};
