import type { DynamicString } from './strings';

export type Credentials = {
  username?: DynamicString;
  password?: DynamicString;
};

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
