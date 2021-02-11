import { Capabilities } from 'selenium-webdriver';
import { basicAuthUrl } from './url';
import {
  Firefox, Chrome, Safari, Edge,
} from '../browsers';
import {
  SupportedBrowsers, InternalBrowser, InitializedBrowser, BrowserConfig,
} from '../types/browsers';

// fetch builder for specific browser
const fetchBrowserDriver = (browserName: SupportedBrowsers, config: BrowserConfig, capabilities?: Capabilities) => {
  switch (browserName) {
    case 'firefox':
      return Firefox.fetchBuilder(config, capabilities);

    case 'chrome':
      return Chrome.fetchBuilder(config, capabilities);

    case 'safari':
      return Safari.fetchBuilder(config, capabilities);

    case 'edge':
      return Edge.fetchBuilder(config, capabilities);

    default:
      throw new Error(`unsupported browser type: '${browserName}'`);
  }
};

// initialize driver for a browser
export const initDriver = (browser: InternalBrowser): InitializedBrowser => {
  const {
    provider, headless, type, capabilities,
  } = browser;
  const browserConfig: BrowserConfig = { headless };
  const driver = fetchBrowserDriver(type, browserConfig, capabilities);
  const initializedBrowser: InitializedBrowser = { ...browser, driver };

  let url;

  switch (provider.type) {
    case 'hub':
      url = basicAuthUrl(provider.url, provider.credentials);
      if (url.endsWith('/')) {
        url = `${url}/`;
      }
      initializedBrowser.driver = driver.usingServer(`${url}/wd/hub`);
      break;

    case 'browserstack':
      url = basicAuthUrl(
        'https://hub.browserstack.com/wd/hub',
        provider.credentials,
      );
      initializedBrowser.driver = driver.usingServer(url);
      break;

    default:
      break;
  }

  return initializedBrowser;
};
