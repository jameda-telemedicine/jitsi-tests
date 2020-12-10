import DefaultTask from './default';
import { createTask, TaskArgs } from './task';

describe('DefaultTask tests', () => {
  test('Run the task', async () => {
    console.log = jest.fn();

    const args: TaskArgs = {
      name: 'default',
      params: {},
    };
    const task = createTask(DefaultTask, args);
    await task.run();
  });
});
