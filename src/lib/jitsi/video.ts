import { ThenableWebDriver } from 'selenium-webdriver';
import { waitSeconds } from '../../steps/time';

export type AllowedVideoPixelResult = 'ok' | 'blank' | 'still';

export type VideoPixelResults = {
  index: number;
  result: AllowedVideoPixelResult;
  details: number[];
};

const getPixelSumByIndex = (driver: ThenableWebDriver, index: number): Promise<number> => driver.executeScript(`
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let videos = document.getElementsByTagName("video");
    let video = videos[${index}];

    if (video) {
      ctx.drawImage(video, 0, 0, video.videoHeight, video.videoWidth);
      let imageData = ctx.getImageData(
        0, 0,
        video.videoHeight, video.videoWidth
      ).data;
      let sum = imageData.reduce((total, num) => total + num);
      if (sum === 255 * imageData.length) {
        return 0;
      }
      return sum;
    } else {
      return 0;
    }
  `);

export const verifyVideoDisplayByIndex = async (
  driver: ThenableWebDriver,
  index: number,
): Promise<VideoPixelResults> => {
  let videoCheck: AllowedVideoPixelResult = 'ok';

  let sum1 = await getPixelSumByIndex(driver, index);
  await waitSeconds(1);
  let sum2 = await getPixelSumByIndex(driver, index);

  // if the image is still, try again a few time
  if (sum1 === sum2) {
    let tries = 5;
    do {
      await waitSeconds(2);
      const sum = await getPixelSumByIndex(driver, index);
      if (sum1 === 0 || sum === sum2) {
        sum1 = sum;
      } else {
        sum2 = sum;
      }

      tries -= 1;

      if (sum1 !== sum2) {
        tries = 0;
      }
    } while (tries > 0);
  }

  if (sum1 === 0 && sum2 === 0) {
    // video is blank
    videoCheck = 'blank';
  } else if (sum1 === sum2) {
    // video is still
    videoCheck = 'still';
  }

  return {
    index,
    result: videoCheck,
    details: [sum1, sum2],
  };
};
