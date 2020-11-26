const startTest = (browserName = null) => {
  const steps = [];
  let hasFailure = false;

  const step = (name, promiseGenerator, defaultValue = null) => {
    const currentStep = {
      name,
      browser: browserName,
    };

    steps.push(currentStep);

    if (hasFailure) {
      currentStep.status = "skipped";
      return Promise.resolve(defaultValue);
    }

    currentStep.start = Date.now();

    return promiseGenerator()
      .then(
        (res) => {
          currentStep.status = "success";
          return res;
        },
        (err) => {
          hasFailure = true;
          currentStep.status = "failure";
          currentStep.message = err.message;
          return Promise.resolve(defaultValue);
        }
      )
      .finally(() => {
        currentStep.end = Date.now();
        const duration = currentStep.end - currentStep.start;
        currentStep.duration = duration;
      });
  };

  const end = () => {
    return steps;
  };

  return { step, end };
};

module.exports = {
  startTest,
};
