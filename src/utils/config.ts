import fs from 'fs';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { panic } from './utils';
import schema from './schema';
import { buildJitsiUrl } from './url';
import {
  Config,
  ConfigurationFile,
  DynamicString,
  ExternalProvider,
  InternalBrowser,
  InternalTest,
  Provider,
  Test,
} from '../types';

// TODO: configure them using the configuration file
export const config: Config = {
  base: `${process.env.JITSI_BASE}`,
  room: `${process.env.JITSI_ROOM}`,
  jwt: `${process.env.JITSI_JWT}`,
};

// load configuration file
const loadConfig = (configFile: string): ConfigurationFile => {
  let configData: ConfigurationFile = {
    providers: [],
    tests: [],
  };

  try {
    const fileContents = fs.readFileSync(configFile, 'utf8');
    configData = yaml.safeLoad(fileContents) as ConfigurationFile;
  } catch (e) {
    panic(e.message);
  }

  return configData;
};

// make the program crash if the config file is invalid
const validateConfig = (configData: ConfigurationFile) => {
  const ajv = new Ajv();
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(configData);
  if (!valid) {
    panic(JSON.stringify(validate.errors));
  }
};

// some checks on providers
const checkProviders = (configData: ConfigurationFile) => {
  const providers = new Set(
    configData.providers.map((provider) => provider.name),
  );

  // check that each provider are defined only one time
  if (providers.size !== configData.providers.length) {
    panic('Some providers are defined multiple time');
  }

  // check if all used provider are defined
  const invalidProviders = new Set(
    configData.tests
      .flatMap((t) => t.browsers)
      .flatMap((b) => b.provider)
      .filter((p) => !providers.has(p)),
  );

  if (invalidProviders.size > 0) {
    const invalidProvidersList = Array.from(invalidProviders).join(', ');
    panic(`Use of following undefined providers: ${invalidProvidersList}`);
  }
};

// resolve dynamic strings
const resolveDynamicString = (item: DynamicString): string => {
  if (typeof item === 'string') {
    return item;
  }

  if (item.fromEnv) {
    if (item.fromEnv in process.env) {
      return process.env[item.fromEnv] || '';
    }
    panic(`'${item.fromEnv}' is not defined in environment variables`);
  }

  panic('could not resolve a dynamic string');
  return '';
};

// resolve dynamic strings for credentials and add new fields for providers
const resolveProviders = (providers: Provider[]): Provider[] => providers.map((provider) => {
  provider.isLocal = provider.type === 'local';

  // nothing to do if the provider has no configured credentials
  if (!Object.prototype.hasOwnProperty.call(provider, 'credentials')) {
    return provider;
  }

  // the provider is not local
  const externalProvider = provider as ExternalProvider;

  // resolve username
  if (externalProvider?.credentials?.username) {
    externalProvider.credentials.username = resolveDynamicString(
      externalProvider.credentials.username,
    );
  }

  // resolve password
  if (externalProvider?.credentials?.password) {
    externalProvider.credentials.password = resolveDynamicString(
      externalProvider.credentials.password,
    );
  }

  return externalProvider;
});

// find provider data
const findProviderData = (providers: Provider[], name: string): Provider => {
  const providerList = providers.filter((provider) => provider.name === name);
  if (providerList.length === 0) {
    panic(`could not find provider '${name}'`);
  }
  return providerList[0];
};

// add new fields and resolve provider for each browser for each test
const resolveTests = (tests: Test[], providers: Provider[]): InternalTest[] => tests.map(
  (test): InternalTest => ({
    ...test,
    participants: test.browsers.length,
    target: {
      name: 'Jitsi instance',
      type: 'jitsi',
      url: buildJitsiUrl(config),
    },
    browsers: test.browsers.map(
      (browser): InternalBrowser => ({
        ...browser,
        provider: findProviderData(providers, browser.provider),
      }),
    ),
  }),
);

// parse configuration file to get tests to be executed
export const parseConfig = (configFile: string): InternalTest[] => {
  const configData = loadConfig(configFile);
  validateConfig(configData);
  checkProviders(configData);

  const providers = resolveProviders(configData.providers);
  const tests = resolveTests(configData.tests, providers);

  return tests;
};
