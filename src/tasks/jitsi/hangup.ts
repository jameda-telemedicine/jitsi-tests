import { By } from 'selenium-webdriver';
import { TOOLBOX_BUTTON } from '../../lib/jitsi/css';
import { HANGUP_BUTTON_TEXT } from '../../lib/jitsi/translations';
import DefaultTask from '../default';
import { TaskParams } from '../task';

class JitsiHangupTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const endCallText = await this.args.driver.executeScript(
      `return $.i18n.t('${HANGUP_BUTTON_TEXT}');`,
    );

    await this.args.driver
      .findElement(By.css(`${TOOLBOX_BUTTON}[aria-label="${endCallText}"]`))
      .click();
  }
}

export default JitsiHangupTask;
