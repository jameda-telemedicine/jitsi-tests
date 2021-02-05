import { By, Key, WebElement } from 'selenium-webdriver';
import { DISPLAY_NAME_INPUT } from '../../lib/jitsi/css';
import { wait } from '../../lib/time';
import DefaultTask from '../default';
import { TaskParams } from '../task';

/**
 * Autofill display name on Jitsi Meet prompt.
 *
 * @param {number} [retries=20] number of allowed retries.
 * @param {number} [interval=500] interval in milliseconds between each retry.
 * @param {boolean} [required=true] `true` will make the task fail if there is no prejoin page.
 * @param {string} [displayName] the display name ; if no one is specified, one will be generated.
 */
class JitsiPromptTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const retries = this.getNumericArg('retries', 20);
    const interval = this.getNumericArg('interval', 500);
    const required = this.getBooleanArg('required', true);
    const displayName = this.getStringArg('displayName', `${this.args.browser.name} (jitsi-tests)`);

    // find the displayName input
    let displayNameInput: WebElement[] = [];
    for (let i = 0; i < retries; i += 1) {
      displayNameInput = await this.args.driver.findElements(
        By.css(DISPLAY_NAME_INPUT),
      );

      if (displayNameInput.length < 1) {
        await wait(interval);
      } else {
        break;
      }
    }

    // try to fill the displayName input
    if (displayNameInput.length > 0) {
      await displayNameInput[0].sendKeys(displayName, Key.RETURN);
    } else if (required) {
      throw new Error('No display name prompt was found.');
    }
  }
}

export default JitsiPromptTask;
