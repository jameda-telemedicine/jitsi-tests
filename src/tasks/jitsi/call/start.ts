import { WebElement, By, Key } from 'selenium-webdriver';
import { DISPLAY_NAME_INPUT, PREJOIN_DISPLAY_NAME_INPUT } from '../../../lib/jitsi/css';
import { wait, waitSeconds } from '../../../lib/time';
import { TaskParams } from '../../task';
import JitsiTask from '../jitsi';

class JitsiCallStartTask extends JitsiTask {
  async handlePrejoinPage(): Promise<void> {
    const hasPrejoinPage = this.getBooleanArg('prejoin', false);
    if (!hasPrejoinPage) return;

    const required = this.getBooleanArg('prejoinRequired', true);
    const retries = this.getNumericArg('retries', 20);
    const interval = this.getNumericArg('interval', 500);
    const displayName = this.getStringArg(
      'displayName',
      `${this.args.browser.name} (jitsi-tests)`,
    );

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

  async handleDisplayNamePrompt(): Promise<void> {
    const hasDisplayNamePrompt = this.getBooleanArg('prompt', false);
    if (!hasDisplayNamePrompt) return;

    const required = this.getBooleanArg('promptRequired', true);
    const retries = this.getNumericArg('retries', 20);
    const interval = this.getNumericArg('interval', 500);
    const displayName = this.getStringArg(
      'displayName',
      `${this.args.browser.name} (jitsi-tests)`,
    );

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

  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const timeout = this.getNumericArg('timeout', 120_000);

    await this.synchroPrefix('jitsi-call-start-start', timeout);

    await this.handlePrejoinPage();
    await this.handleDisplayNamePrompt();
    await waitSeconds(2);

    await this.synchroPrefix('jitsi-call-start-display-name-set');

    // set toolbar always visible
    await this.args.driver.executeScript(
      "APP.store.dispatch({ type: 'SET_TOOLBOX_ALWAYS_VISIBLE', alwaysVisible: true });",
    );

    await this.synchroPrefix('jitsi-call-start-end');
  }
}

export default JitsiCallStartTask;
