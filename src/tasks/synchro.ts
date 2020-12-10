import synchro, { BarrierArgs } from '../lib/synchro';
import DefaultTask from './default';
import { TaskParams } from './task';

/**
 * Synchronization task.
 *
 * @param {string} name name of the barrier.
 * @param {number} counter number of time it should be called before continuing.
 * @param {number} [timeout] the time in milliseconds before timeout.
 */
class SynchroTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    // barrier should have a name
    if (!Object.prototype.hasOwnProperty.call(this.args.params, 'name')) {
      throw new Error('No name was specified.');
    }

    // barrier should have a count
    if (!Object.prototype.hasOwnProperty.call(this.args.params, 'counter')) {
      throw new Error('No counter was specified.');
    }

    const { barrier } = synchro();
    await barrier(this.args.params as BarrierArgs);
  }
}

export default SynchroTask;
