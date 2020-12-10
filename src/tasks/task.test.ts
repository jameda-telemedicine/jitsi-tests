import {
  createTask, parseTasks, resolve, resolveAll, TaskArgs, Task,
} from './task';

describe('Basic task tests', () => {
  test("Resolver for 'default'", async () => {
    const resolvedTask = await resolve('default');
    const args: TaskArgs = {
      name: 'default',
      params: {},
    };
    const task = createTask(resolvedTask, args);
    await task.run();
  });

  test("Resolver for 'log'", async () => {
    const resolvedTask = await resolve('log');

    console.log = jest.fn();

    const args: TaskArgs = {
      name: 'log',
      params: {
        message: 'hello world',
      },
    };
    const task = createTask(resolvedTask, args);
    await task.run();

    expect(console.log).toHaveBeenCalledWith('hello world');
  });

  test('Override params a task', async () => {
    const resolvedTask = await resolve('log');

    console.log = jest.fn();

    const args: TaskArgs = {
      name: 'log',
      params: {
        message: 'hello world',
      },
    };
    const task = createTask(resolvedTask, args);
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

  test('Resolve some basic tasks', async () => {
    console.log = jest.fn();

    const tasks: Task[] = [
      {
        log: {
          message: 'hello',
        },
      },
      {
        log: {
          message: 'world',
        },
      },
    ];

    const resolved = resolveAll(tasks);
    await expect(resolved).resolves.not.toThrow();

    expect(console.log).toHaveBeenNthCalledWith(1, 'hello');
    expect(console.log).toHaveBeenNthCalledWith(2, 'world');
  });
});
