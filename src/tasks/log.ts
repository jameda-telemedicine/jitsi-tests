import DefaultTask from './default';
import { TaskParams } from './task';

/**
 * Print to `stdout` with newline.
 *
 * @param message the message to be printed.
 */
class LogTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    if (!Object.prototype.hasOwnProperty.call(this.args.params, 'message')) {
      throw new Error('No message was specified.');
    }
    console.log(this.args.params.message);
  }
}

export default LogTask;
