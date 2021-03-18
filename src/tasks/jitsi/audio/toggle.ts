import { By, WebElement } from 'selenium-webdriver';
import { TOOLBOX_BUTTON } from '../../../lib/jitsi/css';
import { Bandwith, getStats } from '../../../lib/jitsi/stats';
import { MUTE_AUDIO } from '../../../lib/jitsi/translations';
import { waitSeconds } from '../../../lib/time';
import DefaultTask from '../../default';
import { TaskParams } from '../../task';

/**
 * Mute/unmute audio.
 */
class JitsiAudioToggleTask extends DefaultTask {
  async getAudioStats(): Promise<Bandwith> {
    const stats = await getStats(this.args.driver);
    console.log('===', JSON.stringify(stats));
    if (!stats.bitrate || !stats.bitrate.audio) {
      throw new Error('Could not get audio bitrate.');
    }

    return stats.bitrate.audio;
  }

  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const initWaitTime = 60;
    const statsWaitTime = 20;
    const taskName = `audio-toggle-${this.args.taskIndex}`;
    const storageKey = `${taskName}-main-count`;
    const isMain = this.args.browser.role === 'main';
    let muteAudioText = 'Toggle mute audio';
    let muteButton: WebElement;

    if (this.args.participants !== 2) {
      throw new Error(`This task expects to have exactly 2 browsers. Found ${this.args.participants}.`);
    }

    // refresh statistic values more often
    await this.args.driver.executeScript(`
      for (const s of APP.conference._room.statistics.rtpStatsMap.values()) {
        s.stop();
        s.statsIntervalMilis = 200;
        s.start();
      }
    `);

    await waitSeconds(initWaitTime + statsWaitTime);

    /**
     * Initialization part.
     */
    await this.synchro((initWaitTime + statsWaitTime + 15) * 1_000, `${taskName}-init`);

    // only do some initializations on browsers with "main" role
    if (isMain) {
      muteAudioText = await this.args.driver.executeScript(
        `return $.i18n.t('${MUTE_AUDIO}');`,
      );

      muteButton = await this.args.driver
        .findElement(By.css(`${TOOLBOX_BUTTON}[aria-label="${muteAudioText}"]`));

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
     * Initial tests.
     */
    let stats = await this.getAudioStats();
    // if (stats.download <= 0) {
    //   throw new Error(`[Init] Expected download value to be >0, but got ${stats.download}.`);
    // }
    console.log('init', isMain, stats);

    /**
     * Mute part.
     */
    await this.synchro(15_000, `${taskName}-mute-start`);
    if (isMain) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.args.driver.executeScript('arguments[0].click()', muteButton!);
    }
    await this.synchro(15_000, `${taskName}-mute-end`);

    await waitSeconds(statsWaitTime);
    stats = await this.getAudioStats();
    // if (isMain && stats.upload !== 0) {
    //   throw new Error(`[Muted] Expected upload value to be 0, but got ${stats.upload}.`);
    // }
    // if (isMain && stats.download <= 0) {
    //   throw new Error(`[Muted] Expected download value to be >0, but got ${stats.download}.`);
    // }
    // if (!isMain && stats.download !== 0) {
    //   throw new Error(`[Muted] Expected download value to be 0, but got ${stats.download}.`);
    // }
    console.log('muted', isMain, stats);

    /**
     * Unmute part.
     */
    await this.synchro((statsWaitTime + 15) * 1_000, `${taskName}-unmute-start`);
    if (isMain) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.args.driver.executeScript('arguments[0].click()', muteButton!);
    }
    await this.synchro(15_000, `${taskName}-unmute-end`);

    // check if all is working again as at the beginning.
    await waitSeconds(statsWaitTime);
    stats = await this.getAudioStats();
    // if (stats.download <= 0) {
    //   throw new Error(`[End] Expected download value to be >0, but got ${stats.download}.`);
    // }
    console.log('end', isMain, stats);

    await this.synchro((statsWaitTime + 15) * 1_000, `${taskName}-end`);
  }
}

export default JitsiAudioToggleTask;
