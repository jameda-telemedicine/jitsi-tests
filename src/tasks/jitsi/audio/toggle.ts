import { WebElement } from 'selenium-webdriver';
import { MUTE_AUDIO } from '../../../lib/jitsi/translations';
import { waitSeconds } from '../../../lib/time';
import { TaskParams } from '../../task';
import JitsiTask from '../jitsi';

type AudioStats = {
  muted: number;
  total: number;
  participants: number;
};

/**
 * Mute/unmute audio.
 */
class JitsiAudioToggleTask extends JitsiTask {
  muteButton?: WebElement;

  muteAudioText = 'Toggle mute audio';

  async setupScript(): Promise<void> {
    await this.args.driver.executeScript(`
      if (!Object.prototype.hasOwnProperty.call(window, 'TESTING')) {
        window.TESTING = {};
      }

      window.TESTING.getAudioStats = () => {
        let results = {
          muted: 0,
          total: 0,
          participants: 0,
        };

        for (const [participantId, participant] of Object.entries(APP.conference._room.participants || {})) {
          results.participants++;

          const tracks = participant._tracks || [];
          const audioTracks = tracks.filter(t => t.type === 'audio');
          const mutedTracks = audioTracks.filter(t => t.muted);

          results.total += audioTracks.length;
          results.muted += mutedTracks.length;
        }

        return results;
      };
    `);
  }

  async getAudioStats(): Promise<AudioStats> {
    const results: AudioStats = await this.args.driver.executeScript(`
      return window.TESTING.getAudioStats();
    `);

    return results;
  }

  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const statsWaitTime = 2;
    const taskName = `audio-toggle-${this.args.taskIndex}`;
    const storageKey = `${taskName}-main-count`;
    const isMain = this.args.browser.role === 'main';

    if (this.args.participants < 2) {
      throw new Error(`This task expects to have at least 2 browsers. Found ${this.args.participants}.`);
    }

    /**
     * Initialization part.
     */
    await this.synchro((statsWaitTime + 10) * 1_000, `${taskName}-init`);
    await this.setupScript();

    // only do some initializations on browsers with "main" role
    if (isMain) {
      this.muteAudioText = await this.getJitsiTranslation(MUTE_AUDIO);
      this.muteButton = await this.getJitsiToolboxButton(this.muteAudioText);

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
    const initStats = await this.getAudioStats();

    /**
     * Mute part.
     */
    await this.synchro(15_000, `${taskName}-mute-start`);
    if (isMain) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.args.driver.executeScript('arguments[0].click()', this.muteButton);
    }
    await this.synchro(15_000, `${taskName}-mute-end`);

    await waitSeconds(statsWaitTime);
    const mutedStats = await this.getAudioStats();
    if (!isMain && mutedStats.muted <= initStats.muted) {
      throw new Error('Expected to have muted audio tracks.');
    }
    if (mutedStats.participants !== initStats.participants) {
      throw new Error('Number of participants should not change during mute.');
    }

    /**
     * Unmute part.
     */
    await this.synchro((statsWaitTime + 15) * 1_000, `${taskName}-unmute-start`);
    if (isMain) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.args.driver.executeScript('arguments[0].click()', this.muteButton);
    }
    await this.synchro(15_000, `${taskName}-unmute-end`);

    // check if all is working again as at the beginning.
    await waitSeconds(statsWaitTime);
    const endStats = await this.getAudioStats();
    if (endStats.muted !== initStats.muted) {
      throw new Error('Expected to have the same amount of muted audio tracks as before the mute.');
    }
    if (endStats.participants !== initStats.participants) {
      throw new Error('Number of participants should not change after mute.');
    }

    await this.synchro((statsWaitTime + 15) * 1_000, `${taskName}-end`);
  }
}

export default JitsiAudioToggleTask;
