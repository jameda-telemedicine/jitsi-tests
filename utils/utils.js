// display an error message and exit
const panic = (message) => {
  console.error(message);
  process.exit(1);
};

module.exports = {
  panic,
};
