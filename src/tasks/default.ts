import {
  TaskInterface, TaskArgs, TaskParams, TaskSystem,
} from './task';

/**
 * Default task that all other tasks extend.
 */
class DefaultTask implements TaskInterface {
  args: TaskArgs;

  system: TaskSystem;

  constructor(args: TaskArgs, system: TaskSystem) {
    this.args = args;
    this.system = system;
  }

  async run(params?: TaskParams): Promise<void> {
    if (params) {
      this.args.params = { ...this.args.params, ...params };
    }

    if (this.args.debug) {
      console.log(
        `  - Running task '${this.args.name}' for browser '${this.args.browser.name}'…`,
      );
    }
  }
}

export default DefaultTask;
