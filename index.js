require("dotenv").config();
const { By } = require("selenium-webdriver");
const { config } = require("./utils/config");
const { jitsiUrl, getCurrentUrl } = require("./utils/url");
const { waitSeconds } = require("./utils/time");
const { buildBrowserDriver } = require("./utils/driver");
const { setupStats, updateStats, fetchStats } = require("./utils/stats");

const browserFlow = async (browser) => {
  const driver = await buildBrowserDriver(browser);

  try {
    await driver.get(jitsiUrl);

    // print current url into the console
    const currentUrl = await getCurrentUrl(driver);
    console.log("├ opened URL: ", currentUrl);

    await driver.executeScript(
      "APP.store.dispatch({ type: 'SET_TOOLBOX_ALWAYS_VISIBLE', alwaysVisible: true })"
    );

    let videosCount = 0;
    for (let i = 0; i < 30; i++) {
      const videos = await driver.findElements(By.css("video"));
      videosCount = videos.length;

      if (videosCount < 3) {
        console.log(`├ found ${videosCount} videos: retry in 1 sec…`);
        await waitSeconds(1);
      } else {
        break;
      }
    }

    if (videosCount < 3) {
      throw new Error(
        `├ found only ${videosCount} videos ; require at least 3`
      );
    } else {
      console.log(`├ found ${videosCount} videos: OK`);
    }

    await setupStats(driver);
    await waitSeconds(1);

    for (let i = 0; i < 5; i++) {
      await updateStats(driver);
      await waitSeconds(1);
    }

    const stats = await fetchStats(driver);
    console.log(stats);

    await waitSeconds(5);

    console.log("├ end the call");
    await driver
      .findElement(By.css('.toolbox-button[aria-label="Anruf beenden"]'))
      .click();

    // wait that all tests are done, then close browser
    await waitSeconds(2);
    console.log("├ closing browser");
    await driver.close();

    await waitSeconds(1);
  } finally {
    if (config.type && config.type !== "" && config.type !== "local") {
      console.log("├ quit driver");
      await driver.quit();
    }
  }

  return {
    success: true,
  };
};

const runBrowserCombination = async (browser1, browser2) => {
  let results = "";
  console.log(`\n╭─── Running ${browser1}-${browser2} tests`);
  try {
    results = await Promise.all([browserFlow(browser1), browserFlow(browser2)]);
  } catch (e) {
    console.error("├ FAILED:", e.message);
  }
  console.log(`╰─── End of ${browser1}-${browser2} tests`);
  console.log(results);
};

(async () => {
  await runBrowserCombination("chrome", "chrome");
  await runBrowserCombination("chrome", "firefox");
  await runBrowserCombination("firefox", "chrome");
  await runBrowserCombination("firefox", "firefox");
})();
