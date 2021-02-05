import { By, Key, WebElement } from 'selenium-webdriver';
import { PREJOIN_DISPLAY_NAME_INPUT } from '../../lib/jitsi/css';
import { wait } from '../../lib/time';
import DefaultTask from '../default';
import { TaskParams } from '../task';

/**
 * Autofill display name on Jitsi Meet prejoin page.
 *
 * @param {number} [retries=20] number of allowed retries.
 * @param {number} [interval=500] interval in milliseconds between each retry.
 * @param {boolean} [required=true] `true` will make the task fail if there is no prejoin page.
 * @param {string} [displayName] the display name ; if no one is specified, one will be generated.
 */
class JitsiPrejoinTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const retries = this.getNumericArg('retries', 20);
    const interval = this.getNumericArg('interval', 500);
    const required = this.getBooleanArg('required', true);
    const displayName = this.getStringArg('displayName', `${this.args.browser.name} (jitsi-tests)`);

    // find the displayName input
    let prejoinDisplayNameInput: WebElement[] = [];
    for (let i = 0; i < retries; i += 1) {
      prejoinDisplayNameInput = await this.args.driver.findElements(
        By.css(PREJOIN_DISPLAY_NAME_INPUT),
      );

      if (prejoinDisplayNameInput.length < 1) {
        await wait(interval);
      } else {
        break;
      }
    }

    // try to fill the displayName input
    if (prejoinDisplayNameInput.length > 0) {
      await prejoinDisplayNameInput[0].sendKeys(displayName, Key.RETURN);
    } else if (required) {
      throw new Error('No prejoin page was found.');
    }
  }
}

export default JitsiPrejoinTask;
