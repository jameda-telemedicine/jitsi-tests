import fs from 'fs';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { panic } from './utils';
import schema from './schema';
import {
  Config,
  ConfigurationFile,
  DynamicString,
  ExternalProvider,
  Instance,
  InternalBrowser,
  InternalInstance,
  InternalTest,
  isDynamicString,
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
    instances: [],
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

// some checks on instances
const checkInstances = (configData: ConfigurationFile) => {
  const instances = new Set(
    configData.instances.map((instance) => instance.name),
  );

  // check that each instance are defined only one time
  if (instances.size !== configData.instances.length) {
    panic('Some instances are defined multiple time');
  }

  // check if all used instance are defined
  const invalidInstances = new Set(
    configData.tests.filter((t) => !instances.has(t.instance)),
  );

  if (invalidInstances.size > 0) {
    const invalidInstanceList = Array.from(invalidInstances)
      .map((instance) => instance.instance)
      .join(', ');
    panic(`Use of following undefined instances: ${invalidInstanceList}`);
  }
};

// resolve dynamic strings
const resolveDynamicString = (item: DynamicString): string => {
  if (!item || typeof item === 'string') {
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

// resolve dynamic strings for instances
// eslint-disable-next-line max-len
const resolveInstances = (instances: Instance[]): InternalInstance[] => instances.map((instance) => {
  const { room } = instance;
  let roomName = 'test-room';

  if (isDynamicString(room)) {
    roomName = resolveDynamicString(room);
  } else {
    roomName = resolveDynamicString(room.name);
  }

  return {
    ...instance,
    name: resolveDynamicString(instance.name),
    url: resolveDynamicString(instance.url),
    type: instance.type,
    jwt: resolveDynamicString(instance.jwt || ''),
    room: roomName,
  };
});

// find provider data
const findProviderData = (providers: Provider[], name: string): Provider => {
  const providerList = providers.filter((provider) => provider.name === name);
  if (providerList.length === 0) {
    panic(`could not find provider '${name}'`);
  }
  return providerList[0];
};

// find instance data
const findInstanceData = (
  instances: InternalInstance[],
  name: string,
): InternalInstance => {
  const instanceList = instances.filter((instance) => instance.name === name);
  if (instanceList.length === 0) {
    panic(`could not find instance '${name}'`);
  }
  return instanceList[0];
};

// add new fields and resolve provider for each browser for each test
const resolveTests = (
  tests: Test[],
  providers: Provider[],
  instances: InternalInstance[],
): InternalTest[] => tests.map(
  (test): InternalTest => ({
    ...test,
    participants: test.browsers.length,
    instance: findInstanceData(instances, test.instance),
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
  checkInstances(configData);

  const providers = resolveProviders(configData.providers);
  const instances = resolveInstances(configData.instances);
  const tests = resolveTests(configData.tests, providers, instances);

  return tests;
};