import { HANGUP_BUTTON } from '../../../lib/jitsi/translations';
import { TaskParams } from '../../task';
import JitsiTask from '../jitsi';

class JitsiCallEndTask extends JitsiTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    await this.synchroPrefix('jitsi-call-end-start');

    const endCallText = await this.getJitsiTranslation(HANGUP_BUTTON);
    const hangupButton = await this.getJitsiToolboxButton(endCallText);

    await this.args.driver.executeScript(
      'arguments[0].click()',
      hangupButton,
    );

    await this.synchroPrefix('jitsi-call-end-end');
  }
}

export default JitsiCallEndTask;
