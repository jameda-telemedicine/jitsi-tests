const { waitSeconds } = require("./time");

const getPixelSumByIndex = (driver, index) => {
  return driver.executeScript(`
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
};

const verifyVideoDisplayByIndex = async (driver, index) => {
  let videoCheck = "video";

  const sum1 = await getPixelSumByIndex(driver, index);
  await waitSeconds(1);
  const sum2 = await getPixelSumByIndex(driver, index);
  await waitSeconds(1);
  const sum3 = await getPixelSumByIndex(driver, index);

  // video is blank
  if (sum1 === 0 && sum2 === 0 && sum3 === 0) {
    videoCheck = "blank";
  } else {
    // video is still
    if (sum1 === sum2 && sum2 === sum3) {
      videoCheck = "still";
    }
  }

  return {
    result: videoCheck,
    details: [sum1, sum2, sum3],
  };
};

module.exports = {
  verifyVideoDisplayByIndex,
};
