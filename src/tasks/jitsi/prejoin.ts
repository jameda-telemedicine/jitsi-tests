import { By, Key } from 'selenium-webdriver';
import { PREJOIN_DISPLAY_NAME_INPUT } from '../../lib/jitsi/css';
import DefaultTask from '../default';
import { TaskParams } from '../task';

/**
 * Autofill display name on Jitsi Meet prejoin page.
 *
 * @param {boolean} [required=true] `true` will make the task fail if there is no prejoin page
 * @param {string} [displayName] the display name ; if no one is specified, one will be generated
 */
class JitsiPrejoinTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    let required = true;
    let displayName = `${this.args.browser.name} (jitsi-tests)`;

    // check if the prejoin page is required (by default) or not
    if (Object.prototype.hasOwnProperty.call(this.args.params, 'required')) {
      try {
        required = JSON.parse(
          `${this.args.params.required}`.toLocaleLowerCase(),
        );
      } catch (_e) {
        throw new Error(
          "Invalid value for 'required' parameter. Should be 'true' or 'false'.",
        );
      }
    }

    // check if a displayName was provided
    if (Object.prototype.hasOwnProperty.call(this.args.params, 'displayName')) {
      if (this.args.params.displayName) {
        displayName = `${this.args.params.displayName}`;
      }
    }

    // find the displayName input
    const prejoinDisplayNameInput = await this.args.driver.findElements(
      By.css(PREJOIN_DISPLAY_NAME_INPUT),
    );

    // try to fill the displayName input
    if (prejoinDisplayNameInput.length > 0) {
      await prejoinDisplayNameInput[0].sendKeys(displayName, Key.RETURN);
    } else if (required) {
      throw new Error('No prejoin page was found.');
    }
  }
}

export default JitsiPrejoinTask;
