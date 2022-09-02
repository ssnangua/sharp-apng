const fs = require("fs");
const sharp = require("sharp");
const apng = require("./index");

if (!fs.existsSync("./output")) fs.mkdirSync("./output");

(async () => {
  /**
   * APNG to GIF
   */
  const image = await apng.sharpFromApng("./animated.png");
  await image.toFile("./output/apng2gif.gif");

  /**
   * APNG to frames
   */
  // const frames = apng.framesFromApng("./animated.png");
  // frames.forEach((frame, index) => {
  //   frame.toFile(`./output/apng-${("000" + index).substr(-4)}.png`);
  // });

  /**
   * GIF to APNG
   */
  await apng.sharpToApng(
    sharp("./animated.gif", { animated: true }),
    "./output/gif2apng.png"
  );

  /**
   * frames to APNG
   */
  await apng.framesToApng(
    fs.readdirSync("./frames").map((file) => sharp(`./frames/${file}`)),
    "./output/animated.png"
  );

  /**
   * Concat animated images
   */
  await apng.framesToApng(
    [
      await apng.sharpFromApng("./output/gif2apng.png"),
      sharp("./output/apng2gif.gif", { animated: true }),
    ],
    "./output/concat.png"
  );
})();
