import { ThenableWebDriver } from 'selenium-webdriver';
import { BrowserTask } from '../types/browsers';
import { InternalInstance } from '../types/instances';
import SynchroTask from './synchro';
import {
  createTaskSystem, createTask, TaskArgs, TaskSystem,
} from './task';

describe('SynchroTask tests', () => {
  let taskSystem: TaskSystem;
  let driver: ThenableWebDriver;
  let browser: BrowserTask;
  let instance: InternalInstance;
  const storage = new Map<string, string>();

  beforeEach(() => {
    taskSystem = createTaskSystem();
  });

  test('Run the task', async () => {
    const args: TaskArgs = {
      name: 'synchro',
      participants: 1,
      params: {
        name: 'synchro',
        counter: 1,
      },
      driver,
      browser,
      debug: false,
      instance,
      browserIndex: 0,
      taskIndex: 0,
      storage,
    };
    const task = createTask(SynchroTask, args, taskSystem);
    await task.run();
  });

  test('Throw if no name was specified', async () => {
    const args: TaskArgs = {
      name: 'synchro',
      participants: 1,
      params: {
        counter: 1,
      },
      driver,
      browser,
      debug: false,
      instance,
      browserIndex: 0,
      taskIndex: 0,
      storage,
    };
    const task = createTask(SynchroTask, args, taskSystem);
    const run = task.run();

    expect(run).rejects.toThrowError('No name was specified.');
  });
});
