import { Builder, Capabilities } from 'selenium-webdriver';
import browser from 'selenium-webdriver/chrome';

const browserName = 'chrome';

const options = new browser.Options();
options.addArguments(
  'use-fake-device-for-media-stream',
  'use-fake-ui-for-media-stream',
);

const fetchBuilder = (capabilities?: Capabilities): Builder => {
  let builder = new Builder();
  if (capabilities) {
    builder = builder.withCapabilities(capabilities);
  }
  return builder.forBrowser(browserName).setChromeOptions(options);
};

export default {
  browser,
  browserName,
  options,
  fetchBuilder,
};
