const util = require("util");
const { By } = require("selenium-webdriver");

const { waitSeconds } = require("../steps/time");
const { getCurrentUrl } = require("../steps/url");
const {
  setupStats,
  updateStats,
  fetchStats,
  filterStats,
} = require("../utils/stats");

const jitsiFlow = async (browser, target, participants) => {
  const driver = browser.driver.build();
  const provider = browser.provider;

  const flowMessage = (...message) => {
    return `[Browser#${browser.name} (${browser.type})] ${message.join(" ")}`;
  };

  const flowLog = (...message) => {
    console.log(` - ${flowMessage(message.join(" "))}`);
  };

  try {
    await driver.get(target);

    // print current url into the console
    const currentUrl = await getCurrentUrl(driver);
    flowLog("opened URL: ", currentUrl);

    await waitSeconds(2);

    await driver.executeScript(
      "APP.store.dispatch({ type: 'SET_TOOLBOX_ALWAYS_VISIBLE', alwaysVisible: true })"
    );

    let videosCount = 0;
    const requiredVideos = participants + 1;
    for (let i = 0; i < 30; i++) {
      const videos = await driver.findElements(By.css("video"));
      videosCount = videos.length;

      if (videosCount < requiredVideos) {
        flowLog(`found ${videosCount} videos: retry in 1 sec…`);
        await waitSeconds(1);
      } else {
        break;
      }
    }

    if (videosCount < requiredVideos) {
      throw new Error(
        flowMessage(
          `found only ${videosCount} videos ; require at least ${requiredVideos}`
        )
      );
    } else {
      flowLog(`found ${videosCount} videos: OK`);
    }

    await setupStats(driver);
    await waitSeconds(1);

    for (let i = 0; i < 5; i++) {
      await updateStats(driver);
      await waitSeconds(1);
    }

    const stats = await fetchStats(driver);
    // console.log(util.inspect(filterStats(stats), false, null, true));

    await waitSeconds(5);

    flowLog("end the call");
    await driver
      .findElement(By.css('.toolbox-button[aria-label="Anruf beenden"]'))
      .click();

    // wait that all tests are done, then close browser
    await waitSeconds(2);
    flowLog("closing browser");
    await driver.close();
  } finally {
    if (!provider.isLocal) {
      flowLog("quit driver");
      await driver.quit();
      await waitSeconds(1);
    }
  }
};

module.exports = {
  jitsiFlow,
};