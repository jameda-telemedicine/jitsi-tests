import { By, WebElement } from 'selenium-webdriver';
import { TOOLBOX_BUTTON } from '../../../lib/jitsi/css';
import {
  fetchStats, setupStats, updateStats, filterStats, JitsiStatsItemOutboundRtp, isInboundRtp, isVideo, isOutboundRtp,
} from '../../../lib/jitsi/stats';
import { MUTE_VIDEO } from '../../../lib/jitsi/translations';
import { waitSeconds } from '../../../lib/time';
import DefaultTask from '../../default';
import { TaskParams } from '../../task';

type StatsValues = { in: number; out: number; };

/**
 * Mute/unmute video.
 */
class JitsiVideoToggleTask extends DefaultTask {
  async checkStats(): Promise<StatsValues> {
    await setupStats(this.args.driver);
    await waitSeconds(1);

    for (let i = 0; i < 5; i += 1) {
      await updateStats(this.args.driver);
      await waitSeconds(1);
    }

    const stats = await fetchStats(this.args.driver);
    const filteredStats = filterStats(stats);
    if (!filteredStats) {
      throw new Error('Stats are empty.');
    }

    const flatStats = filteredStats.map((s) => s.items).flat();
    const inboundStats = flatStats
      .filter(isInboundRtp).filter(isVideo)
      .map((s) => ({ id: s.id, timestamp: s.timestamp, bytes: s.stat_bytesReceived }));
    const outboundStats = flatStats
      .filter(isOutboundRtp).filter(isVideo)
      .map((s) => ({ id: s.id, timestamp: s.timestamp, bytes: s.stat_bytesSent }));

    const inFirst = inboundStats[0].bytes;
    const inLast = inboundStats[inboundStats.length - 1].bytes;

    const outFirst = outboundStats[0].bytes;
    const outLast = outboundStats[outboundStats.length - 1].bytes;

    const videoStats = {
      in: inLast - inFirst,
      out: outLast - outFirst,
    };

    if (videoStats.in < 0 || videoStats.out < 0) {
      throw new Error(`Invalid stats: ${JSON.stringify(
        {
          videoStats,
          inboundStats,
          outboundStats,
        },
      )}.`);
    }

    return videoStats;
  }

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
     * Initial tests.
     */
    // let stats = await this.checkStats();
    // if (stats.in <= 0 || stats.out <= 0) {
    //   throw new Error(`[Init] Expected to send and receive video bytes. Stats: ${JSON.stringify(stats)}`);
    // }

    /**
     * Mute part.
     */
    await this.synchro(5_000, `${taskName}-mute-start`);
    if (isMain) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.args.driver.executeScript('arguments[0].click()', muteButton!);
    }
    await this.synchro(15_000, `${taskName}-mute-end`);

    await waitSeconds(2);
    // stats = await this.checkStats();
    // if (stats.in <= 0 || stats.out <= 0) {
    //   throw new Error(`[Muted] Expected to send and receive video bytes. Stats: ${JSON.stringify(stats)}`);
    // }

    /**
     * Unmute part.
     */
    await this.synchro(5_000, `${taskName}-unmute-start`);
    if (isMain) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.args.driver.executeScript('arguments[0].click()', muteButton!);
    }
    await this.synchro(15_000, `${taskName}-unmute-end`);

    // check if all is working again as at the beginning.
    // stats = await this.checkStats();
    // if (stats.in <= 0 || stats.out <= 0) {
    //   throw new Error(`[End of test] Expected to send and receive video bytes. Stats: ${JSON.stringify(stats)}`);
    // }

    await this.synchro(15_000, `${taskName}-end`);
  }
}

export default JitsiVideoToggleTask;
