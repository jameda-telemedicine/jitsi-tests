import { Builder, Capabilities } from 'selenium-webdriver';
import browser from 'selenium-webdriver/chrome';
import { BrowserConfig } from '../types/browsers';
import { builderWithCapabilities } from '../utils/driver';

const browserName = 'chrome';

const fetchBuilder = (config: BrowserConfig, capabilities?: Capabilities): Builder => {
  const options = new browser.Options();
  options.addArguments(
    'use-fake-device-for-media-stream',
    'use-fake-ui-for-media-stream',
  );

  const builder = builderWithCapabilities(capabilities);
  if (config.headless) {
    options.headless();
  }

  return builder.forBrowser(browserName).setChromeOptions(options);
};

export default {
  browserName,
  fetchBuilder,
};
