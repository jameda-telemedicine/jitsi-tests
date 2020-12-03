import { Builder, Capabilities } from 'selenium-webdriver';

// TODO: remove this
export type Config = {
  base: string;
  room: string;
  jwt?: string;
};

export type DynamicString = string | { fromEnv: string };

export type Credentials = {
  username?: DynamicString;
  password?: DynamicString;
};

// Instances

export type BaseInstance = {
  name: string;
  type: string;
};

export type JitsiInstance = BaseInstance & {
  type: 'jitsi';
  url: string;
  jwt?: DynamicString;
};

export type Instance = JitsiInstance;

// Providers

export type BaseProvider = {
  name: string;
  type: string;
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
  credentials?: Credentials;
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

type BaseTest<B> = {
  name: string;
  browsers: B[];
};

export type Test = BaseTest<Browser>;

export type InternalTest = BaseTest<InternalBrowser> & {
  participants: number
  target: Instance;
};

// Configuration file

export type ConfigurationFile = {
  providers: Provider[];
  tests: Test[];
};

export type Configuration = {
  providers: Provider[];
  tests: InternalTest[];
};
