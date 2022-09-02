const fs = require("fs");
const sharp = require("sharp");
const GIF = require("sharp-gif");
const UPNG = require("upng-js");

/**
 * Cut APNG frames to instances of sharp
 */
function framesFromApng(input, resolveWithObject = false) {
  const buffer = typeof input === "string" ? fs.readFileSync(input) : input;
  const apng = UPNG.decode(buffer);
  const { width, height, depth, ctype } = apng;
  const delay = apng.frames.map((frame) => frame.delay);
  const frames = UPNG.toRGBA8(apng).map((frame) => {
    return sharp(Buffer.from(frame), {
      raw: { width, height, channels: 4 },
    });
  });
  return resolveWithObject
    ? { width, height, depth, ctype, pages: frames.length, delay, frames }
    : frames;
}

/**
 * Create an instance of animated sharp from an APNG image
 */
async function sharpFromApng(input, options, resolveWithObject = false) {
  const { frames, width, height, depth, ctype, pages, delay } = framesFromApng(
    input,
    true
  );
  const image = await GIF.createGif({ transparent: "#FFFFFF", ...options })
    .addFrame(frames)
    .toSharp();
  if (typeof options?.delay !== "number") image.gif({ delay });
  return resolveWithObject
    ? { width, height, depth, ctype, pages, delay, frames, image }
    : image;
}

/**
 * Write an APNG file from an array of instances of sharp
 */
async function framesToApng(images, fileOut, options = {}) {
  let {
    width,
    height,
    cnum = 0,
    delay: oDelay = [],
    resizeTo = "largest",
    resizeType = "zoom",
    resizeOptions = {},
    extendBackground = { r: 0, g: 0, b: 0, alpha: 0 },
    rawOptions,
  } = options;

  if (typeof oDelay === "number") {
    oDelay = new Array(images.length).fill(oDelay);
  }

  const bufs = [];
  const dels = [];
  const cutted = [];

  // Get width and height of output gif
  let meta;
  if (!width || !height) {
    meta = await Promise.all(images.map((frame) => frame.metadata()));
    const math = resizeTo === "largest" ? Math.max : Math.min;
    width = width || math(...meta.map((m) => m.width));
    height = height || math(...meta.map((m) => m.pageHeight || m.height));
  }

  // Parse frames
  for (let i = 0; i < images.length; i++) {
    const frame = images[i];
    const { pages, delay } = meta?.[i] || (await frame.metadata());
    if (pages > 1) {
      const frames = await GIF.readGif(frame).toFrames();
      cutted.push(...frames);
      dels.push(...delay);
    } else {
      cutted.push(frame);
      dels.push(oDelay[i] || 0);
    }
  }

  // Get frames buffer
  for (let i = 0; i < cutted.length; i++) {
    const frame = cutted[i];
    const { width: frameWidth, height: frameHeight } = await frame.metadata();
    if (frameWidth !== width || frameHeight !== height) {
      // Resize frame
      if (resizeType === "zoom") {
        frame.resize({
          ...resizeOptions,
          width,
          height,
        });
      }
      // Extend or extract frame
      else {
        const halfWidth = Math.abs(width - frameWidth) / 2;
        if (frameWidth < width) {
          frame.extend({
            left: halfWidth,
            right: halfWidth,
            background: extendBackground,
          });
        } else if (frameWidth > width) {
          frame.extract({ left: halfWidth, top: 0, width, height });
        }
        const halfHeight = Math.abs(height - frameHeight) / 2;
        if (frameHeight < height) {
          frame.extend({
            top: halfHeight,
            bottom: halfHeight,
            background: extendBackground,
          });
        } else if (frameHeight > height) {
          frame.extract({ left: 0, top: halfHeight, width, height });
        }
      }
    }

    const { buffer } = await frame.ensureAlpha(0).raw(rawOptions).toBuffer();
    bufs.push(buffer);
  }

  const buffer = Buffer.from(UPNG.encode(bufs, width, height, cnum, dels));
  fs.writeFileSync(fileOut, buffer);
  return { width, height, size: buffer.length };
}

/**
 * Write an APNG file from an animated sharp
 */
async function sharpToApng(image, fileOut, options = {}) {
  const frames = await GIF.readGif(image).toFrames();
  const { delay } = await image.metadata();
  return framesToApng(frames, fileOut, { delay, ...options });
}

module.exports = {
  framesFromApng,
  sharpFromApng,
  framesToApng,
  sharpToApng,
};