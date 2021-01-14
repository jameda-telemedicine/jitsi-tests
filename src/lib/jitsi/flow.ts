import { By, Key, WebElement } from 'selenium-webdriver';

import { startTest, TestStep } from '../../utils/tests';
import { verifyVideoDisplayByIndex } from './video';
import { waitSeconds } from '../time';
import { getCurrentUrl } from '../../steps/url';
import {
  setupStats,
  updateStats,
  fetchStats,
  filterStats,
  JitsiStats,
} from './stats';
import { takeScreenshot } from '../../steps/screenshot';
import { InitializedBrowser } from '../../types/browsers';
import {
  DISPLAY_NAME_INPUT, PREJOIN_DISPLAY_NAME_INPUT, TOOLBOX_BUTTON, VIDEO,
} from './css';
import { HANGUP_BUTTON } from './translations';

export const jitsiFlow = async (
  browser: InitializedBrowser,
  target: string,
  participants: number,
): Promise<TestStep[]> => {
  const { step, end } = startTest(browser.name);
  const driver = browser.driver.build();
  const { provider } = browser;

  const flowMessage = (...message: unknown[]): string => `[Browser#${browser.name} (${browser.type})] ${message.join(' ')}`;

  const flowLog = (...message: unknown[]): void => {
    console.log(` - ${flowMessage(message.join(' '))}`);
  };

  try {
    await step('get driver', () => driver.get(target));

    // print current url into the console
    const currentUrl = await step('get current url', () => getCurrentUrl(driver));
    flowLog('opened URL: ', currentUrl);

    await waitSeconds(2);

    await step('set toolbox always visible', () => driver.executeScript(
      "APP.store.dispatch({ type: 'SET_TOOLBOX_ALWAYS_VISIBLE', alwaysVisible: true })",
    ));

    await Promise.allSettled([takeScreenshot(driver)]);

    await waitSeconds(2);

    // check if there is a pre-join page
    const prejoinDisplayNameInput = (await step(
      'check for a pre-join page',
      () => driver.findElements(By.css(PREJOIN_DISPLAY_NAME_INPUT)),
      [],
    )) as WebElement[];
    if (prejoinDisplayNameInput.length > 0) {
      flowLog('fill display name on prejoin page…');
      await step('set display name on prejoin-input', () => prejoinDisplayNameInput[0].sendKeys(
        `${browser.name} (jitsi-tests)`,
        Key.RETURN,
      ));
      await waitSeconds(1);
    }

    // check if prompted to enter a display name
    const enterDisplayName = (await step(
      'check for a display name prompt',
      () => driver.findElements(By.css(DISPLAY_NAME_INPUT)),
      [],
    )) as WebElement[];
    if (enterDisplayName.length > 0) {
      flowLog('fill display name…');
      await step('set display name on the prompt', () => enterDisplayName[0].sendKeys(
        `${browser.name} (jitsi-tests)`,
        Key.RETURN,
      ));
      await waitSeconds(1);
    } else {
      flowLog('no need to fill display name…');
    }

    let videosCount = 0;
    const requiredVideos = participants + 1;
    for (let i = 0; i < 30; i += 1) {
      const videos = (await step(`find videos elements (try#${i})`, () => driver.findElements(By.css(VIDEO)))) as WebElement[];
      videosCount = videos.length;

      if (videosCount < requiredVideos) {
        flowLog(`found ${videosCount} videos: retry in 1 sec…`);
        await waitSeconds(1);
      } else {
        break;
      }
    }

    await Promise.allSettled([takeScreenshot(driver)]);

    await step(
      'check number of videos',
      () => new Promise((resolve, reject) => {
        if (videosCount < requiredVideos) {
          const errorMessage = `found only ${videosCount} videos ; require at least ${requiredVideos}`;
          flowMessage(errorMessage);
          reject(errorMessage);
        } else {
          flowLog(`found ${videosCount} videos: OK`);
          resolve(videosCount);
        }
      }),
    );

    const videoCheck = await Promise.allSettled(
      [...Array(participants + 1).keys()].map((i) => verifyVideoDisplayByIndex(driver, i)),
    );
    await step(
      'check videos',
      () => new Promise((resolve, reject) => {
        const failedChecks = videoCheck.filter(
          (check) => check.status !== 'fulfilled'
            || !check.value
            || !check.value.result
            || check.value.result !== 'ok',
        );
        if (failedChecks.length > 0) {
          const failedChecksString = JSON.stringify(failedChecks);
          flowLog('Failed video checks: ', failedChecksString);
          reject(new Error(`Failed video checks: ${failedChecksString}`));
        } else {
          resolve(videoCheck);
        }
      }),
    );

    await step('setup stats', () => setupStats(driver));
    await waitSeconds(1);

    for (let i = 0; i < 5; i += 1) {
      await step(`update stats #${i}`, () => updateStats(driver));
      await waitSeconds(1);
    }

    const stats = (await step('fetch stats', () => fetchStats(driver))) as JitsiStats[];
    const filteredStats = filterStats(stats);
    await step(
      'check stats',
      () => new Promise((resolve, reject) => {
        if (!filteredStats) {
          reject(new Error('stats are empty'));
        } else {
          resolve(filteredStats);
        }
      }),
    );

    await waitSeconds(2);

    const endCallText = await step('find translation for hangup', () => driver.executeScript(
      `return $.i18n.t('${HANGUP_BUTTON}');`,
    ));

    flowLog('end the call');
    await step('click on the hang up button', () => driver
      .findElement(By.css(`${TOOLBOX_BUTTON}[aria-label="${endCallText}"]`))
      .click());

    // wait that all tests are done, then close browser
    await waitSeconds(2);
    flowLog('closing browser');
    await driver.close();
  } catch (e) {
    console.error(flowMessage(`ERROR: ${e.message}`));
  } finally {
    if (!provider.isLocal) {
      flowLog('quit driver');
      try {
        await driver.quit();
      } catch (e) {
        flowLog('ERROR:', e.message);
      }
      await waitSeconds(1);
    }

    // eslint-disable-next-line no-unsafe-finally
    return end();
  }
};
