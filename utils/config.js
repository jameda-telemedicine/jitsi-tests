const fs = require("fs");
const yaml = require("js-yaml");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const { panic } = require("./utils");
const { schema } = require("./schema");
const { buildJitsiUrl } = require("./url");

// TODO: configure them using the configuration file
const config = {
  base: process.env.JITSI_BASE,
  room: process.env.JITSI_ROOM,
  jwt: process.env.JITSI_JWT,
};

// load configuration file
const loadConfig = (configFile) => {
  let configData;

  try {
    fileContents = fs.readFileSync(configFile, "utf8");
    configData = yaml.safeLoad(fileContents);
  } catch (e) {
    panic(e.message);
  }

  return configData;
};

// make the program crash if the config file is invalid
const validateConfig = (configData) => {
  const ajv = new Ajv();
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(configData);
  if (!valid) {
    panic(validate.errors);
  }
};

// some checks on providers
const checkProviders = (configData) => {
  const providers = new Set(
    configData.providers.map((provider) => provider.name)
  );

  // check that each provider are defined only one time
  if (providers.size !== configData.providers.length) {
    panic("Some providers are defined multiple time");
  }

  // check if all used provider are defined
  const invalidProviders = new Set(
    configData.tests
      .flatMap((t) => t.browsers)
      .flatMap((b) => b.provider)
      .filter((p) => !providers.has(p))
  );

  if (invalidProviders.size > 0) {
    const invalidProvidersList = Array.from(invalidProviders).join(", ");
    panic(`Use of following undefined providers: ${invalidProvidersList}`);
  }
};

// resolve dynamic strings
const resolveDynamicString = (item) => {
  if (typeof item === "string") {
    return item;
  }

  if (item.fromEnv) {
    if (item.fromEnv in process.env) {
      return process.env[item.fromEnv];
    } else {
      panic(`'${item.fromEnv}' is not defined in environment variables`);
    }
  }

  panic("could not resolve a dynamic string");
};

// resolve dynamic strings for credentials and add new fields for providers
const resolveProviders = (configData) => {
  const providers = configData.providers.map((provider) => {
    provider.isLocal = provider.type === "local";

    // nothing to do if the provider has no configured credentials
    if (!provider.credentials) {
      return provider;
    }

    // resolve username
    if (provider.credentials.username) {
      provider.credentials.username = resolveDynamicString(
        provider.credentials.username
      );
    }

    // resolve password
    if (provider.credentials.password) {
      provider.credentials.password = resolveDynamicString(
        provider.credentials.password
      );
    }

    return provider;
  });

  return providers;
};

// find provider data
const findProviderData = (configData, name) => {
  const provider = configData.providers.filter(
    (provider) => provider.name === name
  );
  if (provider.length === 0) {
    return null;
  } else {
    return provider[0];
  }
};

// add new fields and resolve provider for each browser for each test
const resolveTests = (configData) => {
  const tests = configData.tests.map((test) => {
    return {
      ...test,
      participants: test.browsers.length,
      target: {
        type: "jitsi",
        url: buildJitsiUrl(config),
      },
      browsers: test.browsers.map((browser) => {
        return {
          ...browser,
          provider: findProviderData(configData, browser.provider),
        };
      }),
    };
  });

  return tests;
};

// parse configuration file to get tests to be executed
const parseConfig = (configFile) => {
  const configData = loadConfig(configFile);
  validateConfig(configData);
  checkProviders(configData);
  configData.providers = resolveProviders(configData);
  configData.tests = resolveTests(configData);
  return configData.tests;
};

module.exports = {
  config,
  parseConfig,
};
