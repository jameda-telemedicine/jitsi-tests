import { ThenableWebDriver } from 'selenium-webdriver';
import { cencorsSensitiveUrlInformations } from '../utils/url';

// get current URL
export const getCurrentUrl = async (driver: ThenableWebDriver): Promise<string> => {
  const currentUrl = await driver.getCurrentUrl();
  return cencorsSensitiveUrlInformations(currentUrl);
};
