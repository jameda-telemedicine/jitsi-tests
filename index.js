require("dotenv").config();
const { By } = require("selenium-webdriver");
const { Chrome, Firefox } = require("./browsers");
const { config } = require("./utils/config");
const { jitsiUrl } = require("./utils/url");
const { waitSeconds } = require("./utils/time");

const browserFlow = async (browser) => {
  let driver;

  switch (browser) {
    case "firefox":
      driver = await Firefox.buildDriver(config);
      break;

    case "chrome":
      driver = await Chrome.buildDriver(config);
      break;

    default:
      throw new Error(`unsupported browser: '${browser}'`);
  }

  try {
    await driver.get(jitsiUrl);

    // print current url into the console
    let currentUrl = await driver.getCurrentUrl();
    if (config.jwt && config.jwt !== "") {
      currentUrl = `${currentUrl}`.replace(`jwt=${config.jwt}`, "jwt=********");
    }
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

    await driver.executeScript(`
      window.updateJitsiStats = () => {
        for (const pc of APP.conference._room.rtc.peerConnections.values()) {

          pc.peerconnection.getStats(null).then(stats => {
            const items = [];

            stats.forEach(report => {
              let item = {
                id: report.id,
                type: report.type,
                timestamp: report.timestamp,
                stats: [],
              };

              Object.keys(report).forEach(statName => {
                if (!['id', 'timestamp', 'type'].includes(statName)) {
                  item.stats.push({
                    name: statName,
                    value: report[statName],
                  })
                }
              });

              items.push(item);
            });

            if (!window.JitsiStats) {
              window.JitsiStats = [];
            }

            window.JitsiStats.push({
              id: pc.id,
              items,
            });
          });

        }
      };
    `);

    await waitSeconds(1);

    for (let i = 0; i < 5; i++) {
      await driver.executeScript("window.updateJitsiStats();");
      await waitSeconds(1);
    }

    const stats = await driver.executeScript("return window.JitsiStats;");
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
