export type TestStepStatus = 'skipped' | 'success' | 'failure';

export type TestStep = {
  name: string;
  browser: string | null;
  status?: TestStepStatus;
  message?: string;
  start: number;
  end?: number;
  duration?: number;
};

type StartTest = {
  step: (
    name: string,
    promiseGenerator: () => Promise<unknown>,
    defaultValue?: unknown
  ) => Promise<unknown>;
  end: () => TestStep[];
};

export const startTest = (browserName: string | null = null): StartTest => {
  const steps: TestStep[] = [];
  let hasFailure = false;

  const step = (
    name: string,
    promiseGenerator: () => Promise<unknown>,
    defaultValue?: unknown,
  ) => {
    const start = Date.now();
    const currentStep: TestStep = {
      name,
      browser: browserName,
      start,
    };

    steps.push(currentStep);

    if (hasFailure) {
      currentStep.status = 'skipped';
      return Promise.resolve(defaultValue);
    }

    return promiseGenerator()
      .then(
        (res: unknown) => {
          currentStep.status = 'success';
          return res;
        },
        (err: Error) => {
          hasFailure = true;
          currentStep.status = 'failure';
          currentStep.message = err.message;
          return Promise.resolve(defaultValue);
        },
      )
      .finally(() => {
        currentStep.end = Date.now();
        const duration = currentStep.end - currentStep.start;
        currentStep.duration = duration;
      });
  };

  const end = () => steps;

  return { step, end };
};
