import { Builder, Capabilities } from 'selenium-webdriver';

// TODO: remove this
export type Config = {
  base: string;
  room: string;
  jwt?: string;
};

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

export type Credentials = {
  username?: DynamicString;
  password?: DynamicString;
};

// Instances

export type InstanceRoom = DynamicString | {
  name: DynamicString
};

export type BaseInstance = {
  name: DynamicString;
};

export type BaseJitsiInstance = BaseInstance & {
  type: 'jitsi';
};

export type JitsiInstance = BaseJitsiInstance & {
  url: DynamicString;
  jwt?: DynamicString;
  room: InstanceRoom;
};

export type InternalJitsiInstance = BaseJitsiInstance & {
  url: string;
  jwt: string;
  room: string;
};

export type Instance = JitsiInstance;

export type InternalInstance = InternalJitsiInstance;

// Providers

export type BaseProvider = {
  name: string;
  isLocal?: boolean;
};

export type LocalProvider = BaseProvider & {
  type: 'local';
};

export type HubProvider = BaseProvider & {
  type: 'hub';
  url: string;
  credentials?: Credentials;
};

export type BrowserStackProvider = BaseProvider & {
  type: 'browserstack';
  credentials: Credentials;
};

export type ExternalProvider = HubProvider | BrowserStackProvider;

export type Provider = LocalProvider | ExternalProvider;

// Tests

export type SupportedBrowsers = 'chrome' | 'edge' | 'firefox' | 'safari';

type BaseBrowser<P> = {
  name: string;
  type: SupportedBrowsers;
  capabilities?: Capabilities;
  provider: P;
};

export type Browser = BaseBrowser<string>;

export type InternalBrowser = BaseBrowser<Provider> & {
  driver?: Builder;
};

export type InitializedBrowser = BaseBrowser<Provider> & {
  driver: Builder;
};

type BaseTest<B, I> = {
  name: string;
  instance: I;
  browsers: B[];
};

export type Test = BaseTest<Browser, string>;

export type InternalTest = BaseTest<InternalBrowser, InternalInstance> & {
  participants: number
};

// Configuration file

export type ConfigurationFile = {
  providers: Provider[];
  instances: Instance[];
  tests: Test[];
};

export type Configuration = {
  providers: Provider[];
  tests: InternalTest[];
};
