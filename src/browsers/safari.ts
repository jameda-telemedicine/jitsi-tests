import { Builder, Capabilities } from 'selenium-webdriver';
import browser from 'selenium-webdriver/safari';
import { BrowserConfig } from '../types/browsers';
import { builderWithCapabilities } from '../utils/driver';

const browserName = 'safari';

const fetchBuilder = (config: BrowserConfig, capabilities?: Capabilities): Builder => {
  const options = new browser.Options();

  const builder = builderWithCapabilities(capabilities);
  if (config.headless) {
    console.warn('[WARNING] Safari do not support headless. See: https://github.com/SeleniumHQ/selenium/issues/5985');
  }

  return builder.forBrowser(browserName).setSafariOptions(options);
};

export default {
  browserName,
  fetchBuilder,
};
