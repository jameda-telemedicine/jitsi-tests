import { wait } from '../steps/time';
import DefaultTask from './default';
import { TaskParams } from './task';

/**
 * Wait some milliseconds.
 *
 * @param {number} [time=1000] time to wait in milliseconds.
 */
class WaitTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);
    const time = this.getNumericArg('time', 1_000);
    await wait(time);
  }
}

export default WaitTask;
