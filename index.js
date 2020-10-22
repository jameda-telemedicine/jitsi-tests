require("dotenv").config();
const { By } = require("selenium-webdriver");
const { Chrome, Firefox } = require("./browsers");

const config = {
  base: process.env.JITSI_BASE,
  room: process.env.JITSI_ROOM,
  jwt: process.env.JITSI_JWT,

  type: process.env.SERVER_TYPE,
  username: process.env.SERVER_USERNAME,
  accessKey: process.env.SERVER_ACCESSKEY,
};

const buildJitsiUrl = (config) => {
  const base = config.base.endsWith("/") ? config.base : `${config.base}/`;
  let params = "?analytics.disabled=true";
  if (config.jwt && config.jwt !== "") {
    params = `&jwt=${config.jwt}`;
  }
  return `${base}${config.room}${params}`;
};

const jitsiUrl = buildJitsiUrl(config);

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
        await new Promise((r) => setTimeout(r, 1000));
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

    await new Promise((r) => setTimeout(r, 5000));

    console.log("├ end the call");
    await driver
      .findElement(By.css('.toolbox-button[aria-label="Anruf beenden"]'))
      .click();

    // wait that all tests are done, then close browser
    await new Promise((r) => setTimeout(r, 2000));
    console.log("├ closing browser");
    await driver.close();

    await new Promise((r) => setTimeout(r, 1000));
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
