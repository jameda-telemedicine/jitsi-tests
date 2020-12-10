import { wait } from '../steps/time';
import synchro, { BarrierArgs, BarrierCreator } from './synchro';

describe('Basic barrier tests', () => {
  let barrier: BarrierCreator;

  beforeEach(() => {
    barrier = synchro().barrier;
  });

  test('Two promises should wait', async () => {
    const b: BarrierArgs = {
      counter: 2,
      name: 'two-promises',
      timeout: 300,
    };

    const p = [100, 200].map(async (t) => {
      await wait(t);
      await barrier(b);
    });

    await Promise.all(p);
  });

  test('Test timeout', async () => {
    const b: BarrierArgs = {
      counter: 2,
      name: 'timeout',
      timeout: 10,
    };

    await expect(barrier(b)).rejects.toThrowError('Timeout');
  });

  test('Test timeout using two barriers', async () => {
    const b: BarrierArgs = {
      counter: 2,
      name: 'timeout-2',
      timeout: 10,
    };

    await Promise.allSettled([
      (async () => {
        await wait(50);
        await expect(barrier(b)).rejects.toThrowError('Timeout');
      })(),
      await expect(barrier(b)).rejects.toThrowError('Timeout'),
    ]);
  });

  test('Two barriers should not timeout', async () => {
    const b: BarrierArgs = {
      counter: 2,
      name: 'no-timeout-2',
      timeout: 10,
    };

    await Promise.allSettled([
      (async () => {
        await wait(5);
        await expect(barrier(b)).resolves.toBeUndefined();
      })(),
      await expect(barrier(b)).resolves.toBeUndefined(),
    ]);
  });

  test('Too many consumers', async () => {
    const b: BarrierArgs = {
      counter: 2,
      name: 'too-many-consumers',
      timeout: 10,
    };

    await Promise.allSettled([
      (async () => {
        await wait(5);
        await expect(barrier(b)).rejects.toThrowError('Too many consumers');
      })(),
      (async () => {
        await wait(2);
        await expect(barrier(b)).resolves.toBeUndefined();
      })(),
      await expect(barrier(b)).resolves.toBeUndefined(),
    ]);
  });

  test('Three consumers', async () => {
    const b: BarrierArgs = {
      counter: 3,
      name: 'three-consumers',
      timeout: 10,
    };

    await Promise.allSettled([
      (async () => {
        await wait(5);
        await expect(barrier(b)).resolves.toBeUndefined();
      })(),
      (async () => {
        await wait(2);
        await expect(barrier(b)).resolves.toBeUndefined();
      })(),
      await expect(barrier(b)).resolves.toBeUndefined(),
    ]);
  });

  test('Three consumers timeout', async () => {
    const b: BarrierArgs = {
      counter: 3,
      name: 'three-consumers-timeout',
      timeout: 3,
    };

    await Promise.allSettled([
      (async () => {
        await wait(5);
        await expect(barrier(b)).rejects.toThrowError('Timeout');
      })(),
      (async () => {
        await wait(2);
        await expect(barrier(b)).rejects.toThrowError('Timeout');
      })(),
      await expect(barrier(b)).rejects.toThrowError('Timeout'),
    ]);
  });
});
