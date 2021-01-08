import { By } from 'selenium-webdriver';
import { VIDEO } from '../../../lib/jitsi/css';
import { wait } from '../../../steps/time';
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

    let retries = 20;
    let interval = 500;
    let required = this.args.participants + 1;
    let exact = false;
    let role = '';

    if (Object.prototype.hasOwnProperty.call(this.args.params, 'retries')) {
      if (this.args.params.retries) {
        retries = +this.args.params.retries;
      }
    }

    if (Object.prototype.hasOwnProperty.call(this.args.params, 'interval')) {
      if (this.args.params.interval) {
        interval = +this.args.params.interval;
      }
    }

    if (Object.prototype.hasOwnProperty.call(this.args.params, 'required')) {
      if (this.args.params.required) {
        required = +this.args.params.required;
      }
    }

    if (Object.prototype.hasOwnProperty.call(this.args.params, 'exact')) {
      try {
        exact = JSON.parse(
          `${this.args.params.exact}`.toLocaleLowerCase(),
        );
      } catch (_e) {
        throw new Error(
          "Invalid value for 'exact' parameter. Should be 'true' or 'false'.",
        );
      }
    }

    if (Object.prototype.hasOwnProperty.call(this.args.params, 'role')) {
      if (this.args.params.role) {
        role = `${this.args.params.role}`;
      }
    }

    if (role !== '' && role !== this.args.browser.role) {
      return;
    }

    let videosCount = 0;

    for (let i = 0; i < retries; i += 1) {
      const videos = await this.args.driver.findElements(By.css(VIDEO));
      videosCount = videos.length;

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