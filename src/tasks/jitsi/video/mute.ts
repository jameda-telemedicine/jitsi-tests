import { By } from 'selenium-webdriver';
import { TOOLBOX_BUTTON } from '../../../lib/jitsi/css';
import { MUTE_VIDEO } from '../../../lib/jitsi/translations';
import DefaultTask from '../../default';
import { TaskParams } from '../../task';

/**
 * Mute or unmute video.
 *
 * @param {string} [role] if provided, this task wil be run only on browsers having the role.
 */
class JitsiVideoMuteTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const role = this.getStringArg('role');

    const muteVideoText = await this.args.driver.executeScript(
      `return $.i18n.t('${MUTE_VIDEO}');`,
    );

    if (role === '' || role === this.args.browser.role) {
      await this.args.driver
        .findElement(By.css(`${TOOLBOX_BUTTON}[aria-label="${muteVideoText}"]`))
        .click();
    }
  }
}

export default JitsiVideoMuteTask;
