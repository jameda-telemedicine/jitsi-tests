import { waitSeconds } from '../steps/time';
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
      await waitSeconds(1);
    }
  }

  getBrowserRole(): string {
    let browserRole = '';

    if (this.args.browser.role) {
      browserRole = `${this.args.browser.role}`;
    }

    return browserRole;
  }

  /**
   * Get the string value of an argument.
   *
   * @param {string} name name of the argument key.
   * @param {string} [defaultValue=''] default value.
   */
  getStringArg(name: string, defaultValue = ''): string {
    let arg = defaultValue;

    if (Object.prototype.hasOwnProperty.call(this.args.params, name)) {
      if (this.args.params[name]) {
        arg = `${this.args.params[name]}`;
      }
    }

    return arg;
  }
}

export default DefaultTask;
