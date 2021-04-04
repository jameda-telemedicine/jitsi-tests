import fs from 'fs';
import path from 'path';
import DefaultTask from '../default';
import { TaskParams } from '../task';

class DebugScreenshotTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const { browser, driver } = this.args;
    const browserName = browser.name;
    const timestamp = Date.now();
    const dirname = path.resolve();
    const directory = path.resolve(dirname, './out/screenshots');
    const fileName = `${directory}/${timestamp}_${browserName}.png`;
    fs.mkdir(directory, { recursive: true }, () => {});

    const image = await driver.takeScreenshot();

    await fs.promises.writeFile(fileName, image, 'base64');
  }
}

export default DebugScreenshotTask;
