import fs from 'fs';
import DefaultTask from '../default';
import { TaskParams } from '../task';

class DebugScreenshotTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const { browser, driver } = this.args;
    const browserName = browser.name;
    const timestamp = Date.now();
    const fileName = `./out/screenshots/${timestamp}_${browserName}.png`;
    const image = await driver.takeScreenshot();

    await fs.promises.writeFile(fileName, image, 'base64');
  }
}

export default DebugScreenshotTask;
