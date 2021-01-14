// wait for a number of milliseconds
export const wait = (ms: number): Promise<NodeJS.Timeout> => new Promise((r) => setTimeout(r, ms));

// wait for a number of seconds
export const waitSeconds = (s: number): Promise<NodeJS.Timeout> => wait(1000 * s);
