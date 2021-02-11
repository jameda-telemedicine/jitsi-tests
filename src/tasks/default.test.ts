import { ThenableWebDriver } from 'selenium-webdriver';
import { BrowserTask } from '../types/browsers';
import { InternalInstance } from '../types/instances';
import DefaultTask from './default';
import {
  createTaskSystem, createTask, TaskArgs, TaskSystem,
} from './task';

describe('DefaultTask tests', () => {
  let taskSystem: TaskSystem;
  let driver: ThenableWebDriver;
  let browser: BrowserTask;
  let instance: InternalInstance;
  const storage = new Map<string, string>();

  beforeEach(() => {
    taskSystem = createTaskSystem();
  });

  test('Run the task', async () => {
    console.log = jest.fn();

    const args: TaskArgs = {
      name: 'default',
      participants: 1,
      params: {},
      driver,
      browser,
      debug: false,
      instance,
      browserIndex: 0,
      taskIndex: 0,
      storage,
    };
    const task = createTask(DefaultTask, args, taskSystem);
    await task.run();
  });
});
