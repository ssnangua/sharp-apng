const fs = require("fs");
const sharp = require("sharp");
const GifEncoder = require("gif-encoder");
const UPNG = require("upng-js");

/**
 * Cut frames from animated sharp
 */
async function getFrames(image) {
  const { pages, width, pageHeight } = await image.metadata();
  const frames = [];
  if (pages > 1) {
    image = sharp(await image.png().toBuffer());
    for (let i = 0; i < pages; i++) {
      const frame = image.clone().extract({
        left: 0,
        top: pageHeight * i,
        width: width,
        height: pageHeight,
      });
      frames.push(sharp(await frame.toBuffer()));
    }
  } else {
    frames.push(image);
  }
  return frames;
}

/**
 * Decode APNG image
 */
function decodeApng(input) {
  const buffer = typeof input === "string" ? fs.readFileSync(input) : input;
  const decoder = UPNG.decode(buffer);
  const { width, height, depth, ctype } = decoder;
  const delay = decoder.frames.map((frame) => frame.delay);
  const frames = UPNG.toRGBA8(decoder).map((frame) => Buffer.from(frame));
  return { width, height, depth, ctype, delay, pages: frames.length, frames };
}

/**
 * Encode animated GIF
 * sharp does not support APNG encoding,
 * nor creates animated instance from frames,
 * so we have to convert to GIF encoded buffer.
 */
function encodeGif(frames, options) {
  const { width, height, delay, repeat, quality, transparent, disposalCode } =
    options;
  const bufs = [];

  const encoder = new GifEncoder(width, height, options.gifEncoderOptions);
  encoder.setRepeat(repeat || 0);
  encoder.setTransparent(transparent || "#FFFFFF");
  if (typeof delay === "number") encoder.setDelay(delay);
  if (typeof quality === "number") encoder.setQuality(quality);
  if (typeof disposalCode === "number") encoder.setDispose(disposalCode);

  encoder.on("data", (buffer) => bufs.push(buffer));
  const promise = new Promise((resolve, reject) => {
    encoder.on("end", () => resolve(Buffer.concat(bufs)));
    encoder.on("error", reject);
  });

  // Write out header bytes.
  encoder.writeHeader();
  // Write out frames
  frames.forEach((frame) => encoder.addFrame(frame));
  // Write out footer bytes.
  encoder.finish();

  return promise;
}

/**
 * Create instances of sharp from APNG frames.
 */
function framesFromApng(input, resolveWithObject = false) {
  const apng = decodeApng(input);
  const frames = apng.frames.map((frame) => {
    return sharp(frame, {
      raw: {
        width: apng.width,
        height: apng.height,
        channels: 4,
      },
    });
  });
  return resolveWithObject ? { ...apng, frames } : frames;
}

/**
 * Create an instance of animated sharp from an APNG image
 */
async function sharpFromApng(input, options = {}, resolveWithObject = false) {
  const apng = decodeApng(input);
  const gifBuffer = await encodeGif(apng.frames, {
    width: apng.width,
    height: apng.height,
    ...options,
  });
  const image = sharp(gifBuffer, {
    animated: true,
    ...options.sharpOptions,
  }).gif({
    loop: options.repeat || 0,
    delay: options.delay || apng.delay,
  });
  return resolveWithObject ? { ...apng, image } : image;
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
      const frames = await getFrames(frame);
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
  const frames = await getFrames(image);
  const { delay } = await image.metadata();
  return framesToApng(frames, fileOut, { delay, ...options });
}

module.exports = {
  framesFromApng,
  sharpFromApng,
  framesToApng,
  sharpToApng,
};
