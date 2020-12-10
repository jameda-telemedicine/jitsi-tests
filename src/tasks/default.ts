import { TaskInterface, TaskArgs, TaskParams } from './task';

/**
 * Default task that all other tasks extend.
 */
class DefaultTask implements TaskInterface {
  args: TaskArgs;

  constructor(args: TaskArgs) {
    this.args = args;
  }

  async run(params?: TaskParams): Promise<void> {
    if (params) {
      this.args.params = { ...this.args.params, ...params };
    }
  }
}

export default DefaultTask;
