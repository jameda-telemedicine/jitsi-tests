import type { Options } from 'selenium-webdriver/chrome';
import { Builder, Capabilities } from 'selenium-webdriver';
import browser from 'selenium-webdriver/edge';

const browserName = 'MicrosoftEdge';

const options = new browser.Options() as Options;
options.addArguments(
  'use-fake-device-for-media-stream',
  'use-fake-ui-for-media-stream',
);

const fetchBuilder = (capabilities?: Capabilities): Builder => {
  let builder = new Builder();
  if (capabilities) {
    builder = builder.withCapabilities(capabilities);
  }
  return builder.forBrowser(browserName).setEdgeOptions(options);
};

export default {
  browser,
  browserName,
  options,
  fetchBuilder,
};
