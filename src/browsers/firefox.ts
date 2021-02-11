import { Builder, Capabilities } from 'selenium-webdriver';
import browser from 'selenium-webdriver/firefox';
import { BrowserConfig } from '../types/browsers';

const browserName = 'firefox';

const fetchBuilder = (config: BrowserConfig, capabilities?: Capabilities): Builder => {
  const options = new browser.Options();
  options.setPreference('media.navigator.permission.disabled', true);
  options.setPreference('media.navigator.streams.fake', true);

  let builder = new Builder();
  if (capabilities) {
    builder = builder.withCapabilities(capabilities);
  }
  if (config.headless) {
    options.headless();
  }
  return builder.forBrowser(browserName).setFirefoxOptions(options);
};

export default {
  browserName,
  fetchBuilder,
};
