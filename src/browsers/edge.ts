import type { Options } from 'selenium-webdriver/chrome';
import { Builder, Capabilities } from 'selenium-webdriver';
import browser from 'selenium-webdriver/edge';
import { BrowserConfig } from '../types/browsers';

const browserName = 'MicrosoftEdge';

const fetchBuilder = (config: BrowserConfig, capabilities?: Capabilities): Builder => {
  const options = new browser.Options() as Options;
  options.addArguments(
    'use-fake-device-for-media-stream',
    'use-fake-ui-for-media-stream',
  );

  let builder = new Builder();
  if (capabilities) {
    builder = builder.withCapabilities(capabilities);
  }
  if (config.headless) {
    options.headless();
  }
  return builder.forBrowser(browserName).setEdgeOptions(options);
};

export default {
  browserName,
  fetchBuilder,
};
