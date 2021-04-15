import { By, WebElement } from 'selenium-webdriver';
import { waitSeconds } from '../../../lib/time';
import { TaskParams } from '../../task';
import ApprtcTask from '../apprtc';

class ApprtcCallStartTask extends ApprtcTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const button: WebElement = await this.args.driver.findElement(
      By.id('confirm-join-button'),
    );

    await this.args.driver.executeScript('arguments[0].click()', button);
    await waitSeconds(5);
    await this.synchro(30_000);
  }
}

export default ApprtcCallStartTask;
