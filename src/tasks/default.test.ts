import { ThenableWebDriver } from 'selenium-webdriver';
import { BrowserTask } from '../types/browsers';
import { InternalInstance } from '../types/instances';
import DefaultTask from './default';
import {
  createTaskSystem, createTask, TaskArgs, TaskSystem,
} from './task';

describe('DefaultTask tests', () => {
  let taskSystem: TaskSystem;
  const driver = undefined as unknown as ThenableWebDriver;
  const browser = undefined as unknown as BrowserTask;
  const instance = undefined as unknown as InternalInstance;

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
    };
    const task = createTask(DefaultTask, args, taskSystem);
    await task.run();
  });
});
