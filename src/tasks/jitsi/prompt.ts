import { By, Key } from 'selenium-webdriver';
import { DISPLAY_NAME_INPUT } from '../../lib/jitsi/css';
import DefaultTask from '../default';
import { TaskParams } from '../task';

/**
 * Autofill display name on Jitsi Meet prompt.
 *
 * @param {boolean} [required=true] `true` will make the task fail if there is no prejoin page
 * @param {string} [displayName] the display name ; if no one is specified, one will be generated
 */
class JitsiPromptTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    let required = true;
    const displayName = this.getStringArg('displayName', `${this.args.browser.name} (jitsi-tests)`);

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

    // find the displayName input
    const displayNameInput = await this.args.driver.findElements(
      By.css(DISPLAY_NAME_INPUT),
    );

    // try to fill the displayName input
    if (displayNameInput.length > 0) {
      await displayNameInput[0].sendKeys(displayName, Key.RETURN);
    } else if (required) {
      throw new Error('No display name prompt was found.');
    }
  }
}

export default JitsiPromptTask;
