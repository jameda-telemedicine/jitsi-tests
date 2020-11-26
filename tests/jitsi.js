const util = require("util");
const { By, Key } = require("selenium-webdriver");

const { startTest } = require("../utils/tests");
const { verifyVideoDisplayByIndex } = require("../steps/video");
const { waitSeconds } = require("../steps/time");
const { getCurrentUrl } = require("../steps/url");
const {
  setupStats,
  updateStats,
  fetchStats,
  filterStats,
} = require("../utils/stats");

const jitsiFlow = async (browser, target, participants) => {
  const { step, end } = startTest(browser.name);
  const driver = browser.driver.build();
  const provider = browser.provider;

  const flowMessage = (...message) => {
    return `[Browser#${browser.name} (${browser.type})] ${message.join(" ")}`;
  };

  const flowLog = (...message) => {
    console.log(` - ${flowMessage(message.join(" "))}`);
  };

  try {
    await step("get driver", () => driver.get(target));

    // print current url into the console
    const currentUrl = await step("get current url", () =>
      getCurrentUrl(driver)
    );
    flowLog("opened URL: ", currentUrl);

    await waitSeconds(2);

    await step("set toolbox always visible", () =>
      driver.executeScript(
        "APP.store.dispatch({ type: 'SET_TOOLBOX_ALWAYS_VISIBLE', alwaysVisible: true })"
      )
    );

    // check if there is a pre-join page
    const prejoinDisplayNameInput = await step(
      "check for a pre-join page",
      () => driver.findElements(By.css(".prejoin-input-area > input")),
      []
    );
    if (prejoinDisplayNameInput.length > 0) {
      flowLog("fill display name on prejoin page…");
      await step("set display name on prejoin-input", () =>
        prejoinDisplayNameInput[0].sendKeys(
          `${browser.name} (jitsi-tests)`,
          Key.RETURN
        )
      );
      await waitSeconds(1);
    }

    // check if prompted to enter a display name
    const enterDisplayName = await step(
      "check for a display name prompt",
      () => driver.findElements(By.css("input[name=displayName]")),
      []
    );
    if (enterDisplayName.length > 0) {
      flowLog("fill display name…");
      await step("set display name on the prompt", () =>
        enterDisplayName[0].sendKeys(
          `${browser.name} (jitsi-tests)`,
          Key.RETURN
        )
      );
      await waitSeconds(1);
    } else {
      flowLog("no need to fill display name…");
    }

    let videosCount = 0;
    const requiredVideos = participants + 1;
    for (let i = 0; i < 30; i++) {
      const videos = await step(`find videos elements (try#${i})`, () =>
        driver.findElements(By.css("video"))
      );
      videosCount = videos.length;

      if (videosCount < requiredVideos) {
        flowLog(`found ${videosCount} videos: retry in 1 sec…`);
        await waitSeconds(1);
      } else {
        break;
      }
    }

    await step(
      "check number of videos",
      () =>
        new Promise((resolve, reject) => {
          if (videosCount < requiredVideos) {
            const errorMessage = `found only ${videosCount} videos ; require at least ${requiredVideos}`;
            flowMessage(errorMessage);
            reject(errorMessage);
          } else {
            flowLog(`found ${videosCount} videos: OK`);
            resolve(videosCount);
          }
        })
    );

    const videoCheck = await Promise.allSettled(
      [...Array(participants + 1).keys()].map((i) =>
        verifyVideoDisplayByIndex(driver, i)
      )
    );
    await step(
      "check videos",
      () =>
        new Promise((resolve, reject) => {
          const failedChecks = videoCheck.filter(
            (check) =>
              check.status !== "fulfilled" ||
              !check.value ||
              !check.value.result ||
              check.value.result !== "video"
          );
          if (failedChecks.length > 0) {
            flowLog("Failed video check: ", JSON.stringify(failedChecks));
            reject(failedChecks);
          } else {
            resolve(videoCheck);
          }
        })
    );

    await step("setup stats", () => setupStats(driver));
    await waitSeconds(1);

    for (let i = 0; i < 5; i++) {
      await step(`update stats #${i}`, () => updateStats(driver));
      await waitSeconds(1);
    }

    const stats = await step("fetch stats", () => fetchStats(driver));
    // console.log(util.inspect(filterStats(stats), false, null, true));

    await waitSeconds(2);

    const endCallText = await step("find translation for hangup", () =>
      driver.executeScript(
        "return $.i18n.t('toolbar.accessibilityLabel.hangup');"
      )
    );

    flowLog("end the call");
    await step("click on the hang up button", () =>
      driver
        .findElement(By.css(`.toolbox-button[aria-label="${endCallText}"]`))
        .click()
    );

    // wait that all tests are done, then close browser
    await waitSeconds(2);
    flowLog("closing browser");
    await driver.close();
  } catch (e) {
    console.error(flowMessage(`ERROR: ${e.message}`));
  } finally {
    if (!provider.isLocal) {
      flowLog("quit driver");
      await driver.quit();
      await waitSeconds(1);
    }
    return end();
  }
};

module.exports = {
  jitsiFlow,
};
