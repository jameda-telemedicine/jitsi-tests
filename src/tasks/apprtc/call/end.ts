import { TaskParams } from '../../task';
import ApprtcTask from '../apprtc';

class ApprtcCallEndTask extends ApprtcTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    await this.args.driver.executeScript(`
      window.appController.hangup_();
    `);

    await this.synchro(15_000);
  }
}

export default ApprtcCallEndTask;
