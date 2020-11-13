// wait for a number of milliseconds
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// wait for a number of seconds
const waitSeconds = (s) => wait(1000 * s);

module.exports = {
  wait,
  waitSeconds,
};
