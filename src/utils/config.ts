import fs from 'fs';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { panic } from './utils';
import schema from './schema';
import { parseTasks } from '../tasks/task';
import { DynamicString, isDynamicString } from '../types/strings';
import { InternalBrowser } from '../types/browsers';
import { ConfigurationFile } from '../types/config';
import { Instance, InternalInstance } from '../types/instances';
import { Provider, ExternalProvider } from '../types/providers';
import { Scenario, InternalScenario } from '../types/scenarios';
import { Test, InternalTest } from '../types/tests';

// load configuration file
const loadConfig = (configFile: string): ConfigurationFile => {
  let configData: ConfigurationFile = {
    providers: [],
    instances: [],
    scenarios: [],
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
  const ajv = new Ajv({
    removeAdditional: 'failing',
  });
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
      .map((t) => t.instance)
      .join(', ');
    panic(`Use of following undefined instances: ${invalidInstanceList}`);
  }
};

// some checks on scenarios
const checkScenarios = (configData: ConfigurationFile) => {
  const scenarios = new Set(
    configData.scenarios.map((scenario) => scenario.name),
  );

  // check that each scenario are defined only one time
  if (scenarios.size !== configData.scenarios.length) {
    panic('Some scenarios are defined multiple time');
  }

  // check if all used scenario are defined
  const invalidScenarios = new Set(
    configData.tests.filter((t) => !scenarios.has(t.scenario)),
  );

  if (invalidScenarios.size > 0) {
    const invalidScenarioList = Array.from(invalidScenarios)
      .map((t) => t.scenario)
      .join(', ');
    panic(`Use of following undefined scenarios: ${invalidScenarioList}`);
  }
};

// resolve dynamic strings
export const resolveDynamicString = (item: DynamicString): string => {
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
  let randomSuffix = false;

  if (isDynamicString(room)) {
    roomName = resolveDynamicString(room);
  } else {
    roomName = resolveDynamicString(room.name);
    if (room.randomSuffix) {
      randomSuffix = room.randomSuffix;
    }
  }

  return {
    ...instance,
    name: resolveDynamicString(instance.name),
    url: resolveDynamicString(instance.url),
    type: instance.type,
    jwt: resolveDynamicString(instance.jwt || ''),
    room: roomName,
    randomSuffix,
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

// find scenario data
const findScenarioData = (
  scenarios: Scenario[],
  name: string,
): InternalScenario => {
  const scenarioList = scenarios.filter((scenario) => scenario.name === name);
  if (scenarioList.length === 0) {
    panic(`could not find scenario '${name}'`);
  }
  const scenario = scenarioList[0];

  return {
    name: scenario.name,
    tasks: parseTasks(scenario.tasks),
  };
};

// add new fields and resolve provider for each browser for each test
const resolveTests = (
  tests: Test[],
  providers: Provider[],
  instances: InternalInstance[],
  scenarios: Scenario[],
): InternalTest[] => tests.map(
  (test): InternalTest => ({
    ...test,
    participants: test.browsers.length,
    instance: findInstanceData(instances, test.instance),
    scenario: findScenarioData(scenarios, test.scenario),
    browsers: test.browsers.map(
      (browser): InternalBrowser => ({
        ...browser,
        provider: findProviderData(providers, browser.provider),
        headless: browser.headless || false,
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
  checkScenarios(configData);

  const providers = resolveProviders(configData.providers);
  const instances = resolveInstances(configData.instances);
  const { scenarios } = configData;

  const tests = resolveTests(configData.tests, providers, instances, scenarios);

  return tests;
};
