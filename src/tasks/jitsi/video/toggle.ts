import { By, WebElement } from 'selenium-webdriver';
import { TOOLBOX_BUTTON, VIDEO } from '../../../lib/jitsi/css';
import { Bandwith, getStats } from '../../../lib/jitsi/stats';
import { MUTE_VIDEO } from '../../../lib/jitsi/translations';
import { wait, waitSeconds } from '../../../lib/time';
import DefaultTask from '../../default';
import { TaskParams } from '../../task';

/**
 * Mute/unmute video.
 *
 * @param {boolean} [ignoreVideoMinimum] ignore the miniumum number of videos check (default: false).
 * @param {boolean} [ignoreVideoStats] ignore all checks on video statistics (default: false).
 * @param {boolean} [ignoreVideoCount] ignore all checks on the number of videos (default: false).
 */
class JitsiVideoToggleTask extends DefaultTask {
  async getVideoStats(): Promise<Bandwith> {
    const stats = await getStats(this.args.driver);

    if (!stats.bitrate || !stats.bitrate.video) {
      throw new Error('Could not get video bitrate.');
    }

    return stats.bitrate.video;
  }

  async checkVideos(): Promise<number> {
    let videosCount = 0;
    const retries = 10;
    const interval = 500;

    for (let i = 0; i < retries; i += 1) {
      const videos = await this.args.driver.findElements(By.css(VIDEO));
      let displayedVideos: boolean[] = [];

      try {
        displayedVideos = await Promise.all(videos.map(async (video) => video.isDisplayed()));
      } catch (e) {
        if (!`${e.message}`.includes('stale')) {
          throw e;
        }
      }

      videosCount = displayedVideos.reduce((count: number, displayed: boolean) => {
        if (displayed) {
          return count + 1;
        }
        return count;
      }, 0);

      if (videosCount < this.args.participants + 1) {
        await wait(interval);
      } else {
        break;
      }
    }

    return videosCount;
  }

  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const initWaitTime = 70;
    const statsWaitTime = 30;
    const taskName = `video-toggle-${this.args.taskIndex}`;
    const storageKey = `${taskName}-main-count`;
    const isMain = this.args.browser.role === 'main';
    let muteVideoText = 'Toggle mute video';
    let muteButton: WebElement;

    const ignoreVideoMinimum = this.getBooleanArg('ignoreVideoMinimum', false);
    const ignoreVideoStats = this.getBooleanArg('ignoreVideoStats', false);
    const ignoreVideoCount = this.getBooleanArg('ignoreVideoCount', false);

    if (this.args.participants !== 2) {
      throw new Error(`This task expects to have exactly 2 browsers. Found ${this.args.participants}.`);
    }

    await waitSeconds(initWaitTime + statsWaitTime);

    /**
     * Initialization part.
     */
    await this.synchro((initWaitTime + statsWaitTime + 15) * 1_000, `${taskName}-init`);

    // refresh statistic values more often
    await this.args.driver.executeScript(`
      for (const s of APP.conference._room.statistics.rtpStatsMap.values()) {
        s.stop();
        s.statsIntervalMilis = 200;
        s.start();
      }
    `);

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
     * Initial tests.
     */
    let stats;
    let retries;
    let statsFailure;

    if (!ignoreVideoStats) {
      retries = 6;
      statsFailure = true;

      while (retries >= 0) {
        stats = await this.getVideoStats();
        console.log('init', isMain, stats);

        if (stats.download > 0) {
          statsFailure = false;
          break;
        }
        await waitSeconds(5);
        retries -= 1;
      }

      if (statsFailure) {
        throw new Error(`[Init] Expected download value to be >0, but got ${stats?.download}.`);
      }
    }

    const initialVideoCount = await this.checkVideos();

    /**
     * Mute part.
     */
    await this.synchro(60_000, `${taskName}-mute-start`);
    if (isMain) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.args.driver.executeScript('arguments[0].click()', muteButton!);
    }
    await this.synchro(15_000, `${taskName}-mute-end`);

    await waitSeconds(statsWaitTime);

    if (!ignoreVideoStats) {
      retries = 6;
      statsFailure = true;

      while (retries >= 0) {
        stats = await this.getVideoStats();
        console.log('muted', isMain, stats);

        if ((isMain && stats.upload === 0 && stats.download > 0) || (!isMain && stats.download === 0)) {
          statsFailure = false;
          break;
        }
        await waitSeconds(5);
        retries -= 1;
      }

      if (statsFailure) {
        if (isMain && stats?.upload !== 0) {
          throw new Error(`[Muted] Expected upload value to be 0, but got ${stats?.upload}.`);
        }
        if (isMain && (!stats || stats.download <= 0)) {
          throw new Error(`[Muted] Expected download value to be >0, but got ${stats?.download}.`);
        }
        if (!isMain && stats?.download !== 0) {
          throw new Error(`[Muted] Expected download value to be 0, but got ${stats?.download}.`);
        }
      }
    }

    const mutedVideoCount = await this.checkVideos();
    const expectedVideoCount = initialVideoCount - mainCount - 1; // video preview
    if (!ignoreVideoCount) {
      if (!ignoreVideoMinimum && mutedVideoCount < expectedVideoCount) {
        throw new Error(`[Muted] Got ${mutedVideoCount} videos, but at least ${expectedVideoCount} was expected.`);
      }

      // only check the number of videos in the non-main browser
      if (!isMain && mutedVideoCount >= initialVideoCount) {
        throw new Error(`[Muted] Got ${mutedVideoCount} videos ; no video was muted.`);
      }
    }

    /**
     * Unmute part.
     */
    await this.synchro((statsWaitTime + 60) * 1_000, `${taskName}-unmute-start`);
    if (isMain) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.args.driver.executeScript('arguments[0].click()', muteButton!);
    }
    await this.synchro(15_000, `${taskName}-unmute-end`);

    // check if all is working again as at the beginning.
    await waitSeconds(statsWaitTime);

    if (!ignoreVideoStats) {
      retries = 6;
      statsFailure = true;

      while (retries >= 0) {
        stats = await this.getVideoStats();
        console.log('end', isMain, stats);

        if (stats.download > 0) {
          statsFailure = false;
          break;
        }
        await waitSeconds(5);
        retries -= 1;
      }

      if (statsFailure) {
        throw new Error(`[End] Expected download value to be >0, but got ${stats?.download}.`);
      }
    }

    let unmutedVideoCount = await this.checkVideos();
    retries = 4;
    statsFailure = true;

    do {
      if (unmutedVideoCount === initialVideoCount) {
        statsFailure = false;
        break;
      }

      await waitSeconds(5);
      unmutedVideoCount = await this.checkVideos();
      retries -= 1;
    } while (retries >= 0);

    if (statsFailure) {
      throw new Error(`[End] Got ${unmutedVideoCount}, but exactly ${initialVideoCount} was expected.`);
    }

    await this.synchro((statsWaitTime + 60) * 1_000, `${taskName}-end`);
  }
}

export default JitsiVideoToggleTask;
