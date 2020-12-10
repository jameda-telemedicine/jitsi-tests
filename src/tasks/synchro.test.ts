import SynchroTask from './synchro';
import { createTask, TaskArgs } from './task';

describe('SynchroTask tests', () => {
  test('Run the task', async () => {
    const args: TaskArgs = {
      name: 'synchro',
      params: {
        name: 'synchro',
        counter: 1,
      },
    };
    const task = createTask(SynchroTask, args);
    await task.run();
  });

  test('Throw if no counter was specified', async () => {
    const args: TaskArgs = {
      name: 'synchro',
      params: {
        name: 'synchro',
      },
    };
    const task = createTask(SynchroTask, args);
    const run = task.run();

    expect(run).rejects.toThrowError('No counter was specified.');
  });

  test('Throw if no name was specified', async () => {
    const args: TaskArgs = {
      name: 'synchro',
      params: {
        counter: 1,
      },
    };
    const task = createTask(SynchroTask, args);
    const run = task.run();

    expect(run).rejects.toThrowError('No name was specified.');
  });
});
