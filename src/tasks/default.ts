import { BarrierArgs } from '../lib/synchro';
import { waitSeconds } from '../lib/time';
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

  /**
   * Get the numeric value of an argument.
   *
   * @param {string} name name of the argument key.
   * @param {number} [defaultValue=0] default value.
   */
  getNumericArg(name: string, defaultValue = 0): number {
    let arg = defaultValue;

    if (Object.prototype.hasOwnProperty.call(this.args.params, name)) {
      if (this.args.params[name]) {
        arg = +this.args.params[name];
      }
    }

    return arg;
  }

  /**
   * Get the boolean value of an argument.
   *
   * @param {string} name name of the argument key.
   * @param {boolean} defaultValue default value.
   */
  getBooleanArg(name: string, defaultValue: boolean): boolean {
    let arg = defaultValue;

    if (Object.prototype.hasOwnProperty.call(this.args.params, name)) {
      try {
        arg = JSON.parse(
          `${this.args.params[name]}`.toLocaleLowerCase(),
        );
      } catch (_e) {
        throw new Error(
          `Invalid value for '${name}' parameter. Should be 'true' or 'false'.`,
        );
      }
    }

    return arg;
  }

  /**
   * Helper to use the barrier library.
   *
   * @param {number} [timeout=1000] time before timeout in milliseconds.
   * @param {string} [name] name of the synchronization barrier.
   * @param {number} [counter] exact number of barrier call.
   */
  async synchro(timeout?: number, name?: string, counter?: number): Promise<void> {
    const args: BarrierArgs = {
      timeout: timeout || this.system.defaultTimeout,
      name: name || `synchro-task-${this.args.taskIndex}`,
      counter: counter || this.args.participants,
    };
    await this.system.barrier(args);
  }

  /**
   * Helper to use the barrier library using a prefixed name.
   *
   * @param {string} [prefix] prefix of the synchronization barrier name.
   * @param {number} [timeout=1000] time before timeout in milliseconds.
   * @param {number} [counter] exact number of barrier call.
   */
  async synchroPrefix(prefix: string, timeout?: number, counter?: number): Promise<void> {
    const args: BarrierArgs = {
      timeout: timeout || this.system.defaultTimeout,
      name: `synchro-prefix-${prefix}-${this.args.taskIndex}`,
      counter: counter || this.args.participants,
    };
    await this.system.barrier(args);
  }
}

export default DefaultTask;
