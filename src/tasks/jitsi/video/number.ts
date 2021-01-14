import { By } from 'selenium-webdriver';
import { VIDEO } from '../../../lib/jitsi/css';
import { wait } from '../../../lib/time';
import DefaultTask from '../../default';
import { TaskParams } from '../../task';

/**
 * Check that the required number of videos are present.
 *
 * @param {number} [retries=20] number of allowed retries.
 * @param {number} [interval=500] interval in milliseconds between each retry.
 * @param {number} [required] number of videos that should be present (default: nb_participants+1).
 * @param {boolean} [exact] the number of video should be exactly the required one (default: false).
 * @param {string} [role] if provided, this task wil be run only on browsers having the role.
 */
class JitsiVideoNumberTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const browserRole = this.getBrowserRole();

    const retries = this.getNumericArg('retries', 20);
    const interval = this.getNumericArg('interval', 500);
    const required = this.getNumericArg('required', this.args.participants + 1);
    const exact = this.getBooleanArg('exact', false);
    const role = this.getStringArg('role');

    if (!['', browserRole].includes(role)) {
      return;
    }

    let videosCount = 0;

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

      if (videosCount < required) {
        await wait(interval);
      } else {
        break;
      }
    }

    if (exact) {
      if (videosCount !== required) {
        throw new Error(`Found ${videosCount} videos. ${required} are required.`);
      }
    } else if (videosCount < required) {
      throw new Error(`Found only ${videosCount} videos. ${required} are required.`);
    }
  }
}

export default JitsiVideoNumberTask;
