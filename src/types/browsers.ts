import type { Capabilities, Builder } from 'selenium-webdriver';
import type { Provider } from './providers';

export type SupportedBrowsers = 'chrome' | 'edge' | 'firefox' | 'safari';

type BaseBrowser<P> = {
  name: string;
  type: SupportedBrowsers;
  role?: string;
  headless: boolean;
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

export type BrowserTask = BaseBrowser<Provider>;

export type BrowserConfig = {
  headless: boolean;
};
