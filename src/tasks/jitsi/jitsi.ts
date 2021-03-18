import { By, WebElement } from 'selenium-webdriver';
import { TOOLBOX_BUTTON } from '../../lib/jitsi/css';
import DefaultTask from '../default';
import { TaskParams } from '../task';

class JitsiTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);
  }

  /**
   * Helper to get a Jitsi Meet translation.
   *
   * @param {string} translationKey translation key.
   */
  async getJitsiTranslation(translationKey: string): Promise<string> {
    const translation: string = await this.args.driver.executeScript(
      `return $.i18n.t('${translationKey}');`,
    );

    return translation || '';
  }

  /**
     * Helper to get a Jitsi Meet button from the toolbox.
     *
     * @param ariaLabel aria-label value of the specific button.
     */
  async getJitsiToolboxButton(ariaLabel: string): Promise<WebElement> {
    const button: WebElement = await this.args.driver
      .findElement(By.css(`${TOOLBOX_BUTTON}[aria-label="${ariaLabel}"]`));

    return button;
  }
}

export default JitsiTask;
