import { TaskParams } from '../task';
import ApprtcTask from './apprtc';

/**
 * Check statistics for an Apprtc application.
 */
class ApprtcStatsTask extends ApprtcTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    await this.args.driver.executeScript(`
      return window.appController.call_.pcClient_.pc_.getStats();
    `);
  }
}

export default ApprtcStatsTask;
