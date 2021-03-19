import { WebElement } from 'selenium-webdriver';
import { SCREEN_SHARE } from '../../lib/jitsi/translations';
import { waitSeconds } from '../../lib/time';
import { TaskParams } from '../task';
import JitsiTask from './jitsi';

type ScreenshareStats = {
  total: number;
  screenshare: number;
  participants: number;
};

class JitsiScreenshareTask extends JitsiTask {
  screenshareButton?: WebElement;

  taskName = 'jitsi-screenshare';

  async setupScript(): Promise<void> {
    await this.args.driver.executeScript(`
      if (!Object.prototype.hasOwnProperty.call(window, 'TESTING')) {
        window.TESTING = {};
      }

      window.TESTING.getScreenshareStats = () => {
        let results = {
          total: 0,
          screenshare: 0,
          participants: 0,
        };

        for (const [participantId, participant] of Object.entries(APP.conference._room.participants || {})) {
          results.participants++;

          const tracks = participant._tracks || [];
          const videoTracks = tracks.filter(t => t.type === 'video');
          const screenshareTracks = videoTracks.filter(t => t.videoType === 'desktop');

          results.total += videoTracks.length;
          results.screenshare += screenshareTracks.length;
        }

        return results;
      };
    `);
  }

  async getScreenshareStats(): Promise<ScreenshareStats> {
    const results: ScreenshareStats = await this.args.driver.executeScript(`
      return window.TESTING.getScreenshareStats();
    `);

    return results;
  }

  async toogleScreenshare(): Promise<void> {
    await this.args.driver.executeScript('arguments[0].click()', this.screenshareButton);
    await waitSeconds(5);
  }

  async hasUnsupportedBrowsers(): Promise<boolean> {
    const storageKey = `${this.taskName}-unsupported`;
    if (this.args.browser.type === 'safari') {
      this.system.storage.set(storageKey, 'yes');
    }

    await this.synchro(15_000, `${this.taskName}-browser-check`);

    const unsupported = this.system.storage.get(storageKey);

    if (!unsupported) {
      throw new Error('Unable to get value in the global storage.');
    }

    return unsupported !== 'no';
  }

  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    this.taskName = `${this.taskName}-${this.args.taskIndex}`;
    this.system.storage.set(`${this.taskName}-unsupported`, 'no');

    await this.setupScript();

    await this.synchro(15_000, `${this.taskName}-init`);

    const hasUnsupportedBrowsers = await this.hasUnsupportedBrowsers();
    if (hasUnsupportedBrowsers) {
      console.warn('[WARNING] Skipped jitsi/screenshare task due to the presence of at least one unsupported browser.');
      return;
    }

    const initStats = await this.getScreenshareStats();

    const screenshareText = await this.getJitsiTranslation(SCREEN_SHARE);
    this.screenshareButton = await this.getJitsiToolboxButton(screenshareText);

    await this.toogleScreenshare();

    await this.synchro(15_000, `${this.taskName}-screensharing`);
    const screenshareStats = await this.getScreenshareStats();
    if (screenshareStats.screenshare <= initStats.screenshare) {
      throw new Error('Expected to have more screensharing tracks.');
    }
    if (screenshareStats.participants !== initStats.participants) {
      throw new Error('Number of participants should not change during screenshare.');
    }

    await this.toogleScreenshare();

    await this.synchro(15_000, `${this.taskName}-results`);
    const endStats = await this.getScreenshareStats();
    if (endStats.screenshare !== initStats.screenshare) {
      throw new Error('Expected to have the same amount of screenshares as before the screenshare.');
    }
    if (endStats.participants !== initStats.participants) {
      throw new Error('Number of participants should not change after screenshare.');
    }

    await this.synchro(15_000, `${this.taskName}-end`);
  }
}

export default JitsiScreenshareTask;
