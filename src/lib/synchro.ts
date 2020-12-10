export type BarrierArgs = {
  name: string;
  counter: number;
  timeout?: number;
};

export type BarrierPromise = Promise<void>;

type Barrier = {
  name: string;
  counter: number;
  resolve: () => void;
  promise: BarrierPromise;
};

type BarrierRegistry = Map<string, Barrier>;

export type BarrierCreator = (args: BarrierArgs) => BarrierPromise;

/**
 * Synchronization tools that can be used.
 */
const synchro = (): { barrier: BarrierCreator } => {
  const barriers: BarrierRegistry = new Map();

  /**
   * Decrease the counter for a specific barrier.
   *
   * @param {Barrier} barrier the barrier that should have its `counter` decreased.
   */
  const consume = (barrier: Barrier): void => {
    barrier.counter -= 1;

    if (barrier.counter === 0) {
      barrier.resolve();
    } else if (barrier.counter < 0) {
      throw new Error('Too many consumers');
    }
  };

  /**
   * Get or create a barrier.
   *
   * @param {BarrierArgs} args arguments for the barrier should have at least
   *                           the `name` and the `counter` fields.
   */
  const getOrCreate = ({ name, counter, timeout }: BarrierArgs): Barrier => {
    let b = barriers.get(name);
    if (!b) {
      let resolve: () => void = () => {
        throw new Error();
      };

      const promise: BarrierPromise = new Promise((r, reject) => {
        let timer: NodeJS.Timeout | undefined = setTimeout(
          () => reject(new Error('Timeout')),
          timeout || 1_000,
        );
        resolve = () => {
          if (timer) {
            clearTimeout(timer);
            timer = undefined;
          }
          r();
        };
      });

      b = {
        name,
        counter,
        resolve,
        promise,
      };
      barriers.set(name, b);
      return b;
    }

    return b;
  };

  /**
   * Use a specific barrier for synchronization.
   *
   * @param args arguments for the barrier.
   */
  const barrier = (args: BarrierArgs): BarrierPromise => {
    const b = getOrCreate(args);
    consume(b);
    return b.promise;
  };

  return {
    barrier,
  };
};

export default synchro;
