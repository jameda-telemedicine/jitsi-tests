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

    let time = 1_000;

    // check if a time was provided
    if (Object.prototype.hasOwnProperty.call(this.args.params, 'time')) {
      time = +this.args.params.time;
    }

    await wait(time);
  }
}

export default WaitTask;
