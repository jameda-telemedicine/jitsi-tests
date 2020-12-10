import LogTask from './log';
import { createTask, TaskArgs } from './task';

describe('LogTask tests', () => {
  test('Run the task', async () => {
    console.log = jest.fn();

    const args: TaskArgs = {
      name: 'log',
      params: {
        message: 'hello world',
      },
    };
    const task = createTask(LogTask, args);
    await task.run();

    expect(console.log).toHaveBeenCalledWith('hello world');
  });

  test('Throw if no message was specified', async () => {
    const args: TaskArgs = {
      name: 'log',
      params: {},
    };
    const task = createTask(LogTask, args);
    const run = task.run();

    expect(run).rejects.toThrowError('No message was specified.');
  });
});
