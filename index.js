require("dotenv").config();
const { Command } = require("commander");

const { version } = require("./package.json");
const { parseConfig } = require("./utils/config");
const { runTests } = require("./utils/tests");

// parse command line arguments
const program = new Command();
program.version(version);
program.option(
  "-c, --config, --config-file <path>",
  "path to configuration file"
);
program.parse(process.argv);

// parse config file
const configFile = !program.config ? "./config/default.yaml" : program.config;
const tests = parseConfig(configFile);

// run all tests
(async () => {
  await runTests(tests);
})();
