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

const synchro = (): {barrier: BarrierCreator} => {
  const barriers: BarrierRegistry = new Map();

  // decrease the counter of a specific barrier
  const consume = (barrier: Barrier): void => {
    barrier.counter -= 1;

    if (barrier.counter === 0) {
      barrier.resolve();
    } else if (barrier.counter < 0) {
      throw new Error('Too many consumers');
    }
  };

  const getOrCreate = ({ name, counter, timeout }: BarrierArgs): Barrier => {
    let b = barriers.get(name);
    if (!b) {
      let resolve: () => void = () => { throw new Error(); };

      const promise: BarrierPromise = new Promise((r, reject) => {
        let timer: NodeJS.Timeout | undefined = setTimeout(() => reject(new Error('Timeout')), timeout || 30_000);
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
