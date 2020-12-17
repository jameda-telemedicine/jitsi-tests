export type DynamicString = string | {
  fromEnv: string;
};

export const isDynamicString = (x: DynamicString | Record<string, unknown>): x is DynamicString => {
  if (typeof x === 'string') {
    return true;
  }
  if (typeof x === 'object' && Object.prototype.hasOwnProperty.call(x, 'fromEnv')) {
    return true;
  }
  return false;
};
