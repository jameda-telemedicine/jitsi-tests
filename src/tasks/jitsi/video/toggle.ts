import { By, WebElement } from 'selenium-webdriver';
import { TOOLBOX_BUTTON } from '../../../lib/jitsi/css';
import { MUTE_VIDEO } from '../../../lib/jitsi/translations';
import { waitSeconds } from '../../../lib/time';
import DefaultTask from '../../default';
import { TaskParams } from '../../task';

/**
 * Mute/unmute video.
 */
class JitsiVideoToggleTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const taskName = `video-toggle-${this.args.taskIndex}`;
    const storageKey = `${taskName}-main-count`;
    const isMain = this.args.browser.role === 'main';
    let muteVideoText = 'Toggle mute video';
    let muteButton: WebElement;

    /**
     * Initialization part.
     */
    await this.synchro(15_000, `${taskName}-init`);
    // only do some initializations on browsers with "main" role
    if (isMain) {
      muteVideoText = await this.args.driver.executeScript(
        `return $.i18n.t('${MUTE_VIDEO}');`,
      );

      muteButton = await this.args.driver
        .findElement(By.css(`${TOOLBOX_BUTTON}[aria-label="${muteVideoText}"]`));

      // used to know the number of main browsers
      const mainCount = +(this.system.storage.get(storageKey) || 0) + 1;
      this.system.storage.set(storageKey, `${mainCount}`);
    }
    await this.synchro(15_000, `${taskName}-init-end`);

    // make sure we have at least one main browser and one non-main browser
    const mainCount = +(this.system.storage.get(storageKey) || 0);
    if (mainCount < 1) {
      throw new Error('No main browser found.');
    }
    if (mainCount >= this.args.participants) {
      throw new Error('Non non-main browser found.');
    }

    /**
     * Mute part.
     */
    await this.synchro(5_000, `${taskName}-mute-start`);
    if (isMain) {
      await this.args.driver.executeScript('arguments[0].click()', muteButton!);
    }
    await this.synchro(15_000, `${taskName}-mute-end`);

    await waitSeconds(2);

    /**
     * Unmute part.
     */
    await this.synchro(5_000, `${taskName}-unmute-start`);
    if (isMain) {
      await this.args.driver.executeScript('arguments[0].click()', muteButton!);
    }
    await this.synchro(15_000, `${taskName}-unmute-end`);
  }
}

export default JitsiVideoToggleTask;
