import { Builder, Capabilities } from 'selenium-webdriver';
import browser from 'selenium-webdriver/firefox';

const browserName = 'firefox';

const options = new browser.Options();
options.setPreference('media.navigator.permission.disabled', true);
options.setPreference('media.navigator.streams.fake', true);

const fetchBuilder = (capabilities?: Capabilities): Builder => {
  let builder = new Builder();
  if (capabilities) {
    builder = builder.withCapabilities(capabilities);
  }
  return builder.forBrowser(browserName).setFirefoxOptions(options);
};

export default {
  browser,
  browserName,
  options,
  fetchBuilder,
};
