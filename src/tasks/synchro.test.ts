import { ThenableWebDriver } from 'selenium-webdriver';
import { BrowserTask } from '../types/browsers';
import { InternalInstance } from '../types/instances';
import SynchroTask from './synchro';
import {
  createTaskSystem, createTask, TaskArgs, TaskSystem,
} from './task';

describe('SynchroTask tests', () => {
  let taskSystem: TaskSystem;
  const driver = undefined as unknown as ThenableWebDriver;
  const browser = undefined as unknown as BrowserTask;
  const instance = undefined as unknown as InternalInstance;

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
    };
    const task = createTask(SynchroTask, args, taskSystem);
    const run = task.run();

    expect(run).rejects.toThrowError('No name was specified.');
  });
});
