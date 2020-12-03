import { Builder, Capabilities } from 'selenium-webdriver';
import browser from 'selenium-webdriver/safari';

const browserName = 'safari';

const options = new browser.Options();

const fetchBuilder = (capabilities?: Capabilities): Builder => {
  let builder = new Builder();
  if (capabilities) {
    builder = builder.withCapabilities(capabilities);
  }
  return builder.forBrowser(browserName).setSafariOptions(options);
};

export default {
  browser,
  browserName,
  options,
  fetchBuilder,
};
