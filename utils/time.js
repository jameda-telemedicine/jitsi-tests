const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const waitSeconds = (s) => new Promise((r) => setTimeout(r, s * 1000));

module.exports = {
  wait,
  waitSeconds,
};
