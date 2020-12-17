import { ThenableWebDriver } from 'selenium-webdriver';
import { BrowserTask } from '../types/browsers';
import LogTask from './log';
import {
  createTaskSystem, createTask, TaskArgs, TaskSystem,
} from './task';

describe('LogTask tests', () => {
  let taskSystem: TaskSystem;
  const driver = undefined as unknown as ThenableWebDriver;
  const browser = undefined as unknown as BrowserTask;

  beforeEach(() => {
    taskSystem = createTaskSystem();
  });

  test('Run the task', async () => {
    console.log = jest.fn();

    const args: TaskArgs = {
      name: 'log',
      participants: 1,
      params: {
        message: 'hello world',
      },
      driver,
      browser,
      debug: false,
    };
    const task = createTask(LogTask, args, taskSystem);
    await task.run();

    expect(console.log).toHaveBeenCalledWith('hello world');
  });

  test('Throw if no message was specified', async () => {
    const args: TaskArgs = {
      name: 'log',
      participants: 1,
      params: {},
      driver,
      browser,
      debug: false,
    };
    const task = createTask(LogTask, args, taskSystem);
    const run = task.run();

    expect(run).rejects.toThrowError('No message was specified.');
  });
});
