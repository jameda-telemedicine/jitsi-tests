import { ThenableWebDriver } from 'selenium-webdriver';
import { BrowserTask } from '../types/browsers';
import { InternalInstance } from '../types/instances';
import {
  createTask, parseTasks, resolve, TaskArgs, TaskSystem, createTaskSystem,
} from './task';

describe('Basic task tests', () => {
  let taskSystem: TaskSystem;
  let driver: ThenableWebDriver;
  let browser: BrowserTask;
  let instance: InternalInstance;
  const storage = new Map<string, string>();

  beforeEach(() => {
    taskSystem = createTaskSystem();
  });

  test("Resolver for 'default'", async () => {
    const resolvedTask = await resolve('default');
    const args: TaskArgs = {
      name: 'default',
      participants: 2,
      params: {},
      driver,
      browser,
      debug: false,
      instance,
      browserIndex: 0,
      taskIndex: 0,
      storage,
    };
    const task = createTask(resolvedTask, args, taskSystem);
    await task.run();
  });

  test("Resolver for 'log'", async () => {
    const resolvedTask = await resolve('log');

    console.log = jest.fn();

    const args: TaskArgs = {
      name: 'log',
      participants: 2,
      params: {
        message: 'hello world',
      },
      driver,
      browser,
      debug: false,
      instance,
      browserIndex: 0,
      taskIndex: 0,
      storage,
    };
    const task = createTask(resolvedTask, args, taskSystem);
    await task.run();

    expect(console.log).toHaveBeenCalledWith('hello world');
  });

  test('Override params a task', async () => {
    const resolvedTask = await resolve('log');

    console.log = jest.fn();

    const args: TaskArgs = {
      name: 'log',
      participants: 2,
      params: {
        message: 'hello world',
      },
      driver,
      browser,
      debug: false,
      instance,
      browserIndex: 0,
      taskIndex: 0,
      storage,
    };
    const task = createTask(resolvedTask, args, taskSystem);
    await task.run({
      message: 'something',
    });

    expect(console.log).toHaveBeenCalledWith('something');
  });

  test('Try to resolve non-existant task', async () => {
    const task = resolve('non-existant-task');
    await expect(task).rejects.toThrow();
  });

  test('Try to resolve unallowed task', async () => {
    const task = resolve('task');
    await expect(task).rejects.toThrowError(
      "Task 'task' is not allowed for use.",
    );
  });

  test('Try to resolve a test file instead of a task', async () => {
    let task = resolve('task.test');
    await expect(task).rejects.toThrowError(
      'Not allowed to resolve a test file (task.test) as a task.',
    );

    task = resolve('task.test.ts');
    await expect(task).rejects.toThrowError(
      'Not allowed to resolve a test file (task.test.ts) as a task.',
    );
  });

  test('Parse empty tasks list', () => {
    expect(parseTasks([])).toEqual([]);
  });

  test('Parse tasks list', () => {
    expect(
      parseTasks([
        'default',
        {
          log: { message: 'hello world' },
        },
      ]),
    ).toEqual([
      {
        name: 'default',
        params: {},
      },
      {
        name: 'log',
        params: {
          message: 'hello world',
        },
      },
    ]);
  });

  test('Check for bad entries during parse of tasks', () => {
    expect(() => parseTasks([
      'default',
      {
        log: { message: 'hello world' },
        default: {},
      },
    ])).toThrowError('Bad task entry.');
  });

  test('Check for empty entries during parse of tasks', () => {
    expect(() => parseTasks(['default', {}])).toThrowError('Empty task entry.');
  });
});
