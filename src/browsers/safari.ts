import { Builder, Capabilities } from 'selenium-webdriver';
import browser from 'selenium-webdriver/safari';
import { BrowserConfig } from '../types/browsers';

const browserName = 'safari';

const fetchBuilder = (config: BrowserConfig, capabilities?: Capabilities): Builder => {
  const options = new browser.Options();

  let builder = new Builder();
  if (capabilities) {
    builder = builder.withCapabilities(capabilities);
  }
  if (config.headless) {
    console.warn('[WARNING] Safari do not support headless. See: https://github.com/SeleniumHQ/selenium/issues/5985');
  }
  return builder.forBrowser(browserName).setSafariOptions(options);
};

export default {
  browserName,
  fetchBuilder,
};
