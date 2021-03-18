import { WebElement } from 'selenium-webdriver';
import { SCREEN_SHARE } from '../../lib/jitsi/translations';
import { waitSeconds } from '../../lib/time';
import { TaskParams } from '../task';
import JitsiTask from './jitsi';

class JitsiScreenshareTask extends JitsiTask {
  screenshareButton?: WebElement;

  async toogleScreenshare(): Promise<void> {
    await this.args.driver.executeScript('arguments[0].click()', this.screenshareButton);
    await waitSeconds(2);
  }

  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const screenshareText = await this.getJitsiTranslation(SCREEN_SHARE);
    this.screenshareButton = await this.getJitsiToolboxButton(screenshareText);

    await this.toogleScreenshare();
    await this.toogleScreenshare();
  }
}

export default JitsiScreenshareTask;
