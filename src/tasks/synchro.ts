import DefaultTask from './default';
import { TaskParams } from './task';

/**
 * Synchronization task.
 *
 * @param {string} name name of the barrier.
 * @param {number} [counter] number of time it should be called before continuing.
 * @param {number} [timeout] the time in milliseconds before timeout.
 */
class SynchroTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    // barrier should have a name
    if (!Object.prototype.hasOwnProperty.call(this.args.params, 'name')) {
      throw new Error('No name was specified.');
    }

    const { name, timeout } = this.args.params;
    let counter = +this.args.params.counter;

    // barrier should have a counter
    if (!Object.prototype.hasOwnProperty.call(this.args.params, 'counter')) {
      counter = +this.args.participants;
    }

    let synchroTimeout = 1_000;
    if (timeout) {
      synchroTimeout = +timeout;
    }

    await this.synchro(synchroTimeout, `${name}`, counter);
  }
}

export default SynchroTask;
