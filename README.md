# sharp-apng

APNG(animated PNG) encoder and decoder for [sharp](https://www.npmjs.com/package/sharp) base on [upng-js](https://www.npmjs.com/package/upng-js).

## Install

```bash
npm install sharp-apng
```

## Usage

```js
const sharp = require("sharp");
const apng = require("sharp-apng");

(async () => {
  // APNG to GIF
  const image = await apng.sharpFromApng("./animated.png");
  image.toFile("./output/apng2gif.gif");

  // APNG to frames
  const frames = apng.framesFromApng("./animated.png");
  frames.forEach((frame, index) => {
    frame.toFile(`./output/apng-${("000" + index).substr(-4)}.png`);
  });

  // GIF to APNG
  apng.sharpToApng(
    sharp("./animated.gif", { animated: true }),
    "./output/gif2apng.png"
  );

  // frames to APNG
  apng.framesToApng(
    [
      sharp("./frames/0000.png"),
      sharp("./frames/0001.png"),
      sharp("./frames/0002.png"),
    ],
    "./output/animated.png"
  );
})();
```

## API

### `apng.framesFromApng(input, resolveWithObject?)`

Create instances of sharp from APNG frames.

- `input` (String | Buffer) - A String containing the filesystem path to an APNG image file, or a Buffer containing APNG image data.
- `resolveWithObject` Boolean _(optional)_ - Return an [ImageData](#imagedata) containing `frames` (an array of instances of sharp) property and decoding info instead of only an array of instances of sharp. Default by `false`.

Returns `Sharp[] | ImageData` - Return an array of instance of sharp, or an [ImageData](#imagedata) containing `frames` (an array of instances of sharp) property and decoding info.

### `apng.sharpFromApng(input, options?, resolveWithObject?)`

Create an instance of animated sharp from an APNG image.

- `input` (String | Buffer) - A String containing the filesystem path to an APNG image file, or a Buffer containing APNG image data.
- `options` [DecoderOptions](#decoderoptions) - Options for encode animated GIF and create sharp instance.
- `resolveWithObject` Boolean _(optional)_ - Return an [ImageData](#imagedata) containing `image` (an instance of sharp) property and decoding info instead of only an instance of sharp. Default by `false`.

Returns `Promise<Sharp | ImageData>` - Resolve with an instance of animated sharp, or an [ImageData](#imagedata) containing `image` (an instances of sharp) property and decoding info.

### `DecoderOptions`

Options for encode animated GIF and create sharp instance.

- `sharpOptions` Number _(optional)_ - Sharp constructor [options](https://sharp.pixelplumbing.com/api-constructor#parameters).
- `delay` (Number | Number[]) _(optional)_ - Delay(s) between animation frames (in milliseconds).
- `repeat` Number _(optional)_ - Number of animation iterations, use `0` for infinite animation. Default by `0`.
- `transparent` Boolean _(optional)_ - Enable 1-bit transparency for the GIF. Default by `false`.
- `maxColors` Number _(optional)_ - Quantize the total number of colors down to a reduced palette no greater than maxColors. Default by `256`.
- `format` ("rgb565" | "rgb444" | "rgba4444") _(optional)_ - Color format. Default by `rgb565`.
  - `rgb565` means 5 bits red, 6 bits green, 5 bits blue (better quality, slower)
  - `rgb444` is 4 bits per channel (lower quality, faster)
  - `rgba4444` is the same as above but with alpha support
- `gifEncoderOptions` Object _(optional)_ - gifenc [GIFEncoder()](https://github.com/mattdesl/gifenc#gif--gifencoderopts--) options.
- `gifEncoderQuantizeOptions` Object _(optional)_ - gifenc [quantize()](https://github.com/mattdesl/gifenc#palette--quantizergba-maxcolors-options--) options.
- `gifEncoderFrameOptions` Object _(optional)_ - gifenc [gif.writeFrame()](https://github.com/mattdesl/gifenc#gifwriteframeindex-width-height-opts--) options.

### `ImageData`

Contains the following decoding info:

- `width` Number - The width of the image, in pixels.
- `height` Number - The height of the image, in pixels.
- `depth` Number - Number of bits per channel.
- `ctype` Number - Color type of the file (Truecolor, Grayscale, Palette ...).
- `pages` Number - Number of frames contained within the image.
- `delay` Number[] - Delay in ms between each frame.
- `frames` Sharp[] _(`apng.framesFromApng()` only)_ - Instances of sharp from APNG frames.
- `image` Sharp _(`apng.sharpFromApng()` only)_ - Animated sharp instance.

### `apng.framesToApng(images, fileOut, options?)`

Write an APNG file from sharps.

- `images` Sharp[] - An array of instances of sharp.
- `fileOut` String - The path to write the image data to.
- `options` [EncoderOptions](#encoderoptions) _(optional)_ - Options for resize frames and encoding APNG.

Returns `Promise<Object>` - Resolve with an Object containing `size`, `width`, `height` properties.

### `apng.sharpToApng(image, fileOut, options?)`

Write an APNG file from an animated sharp.

- `image` Sharp - An instance of animated sharp.
- `fileOut` String - The path to write the image data to.
- `options` [EncoderOptions](#encoderoptions) _(optional)_ - Options for resize frames and encoding APNG.

Returns `Promise<Object>` - Resolve with an Object containing `size`, `width`, `height` properties.

### EncoderOptions

Options for resize frames and encode APNG.

- `width` Number _(optional)_ - Width, in pixels, of the APNG to output. If omitted, will use `resizeTo` option.
- `height` Number _(optional)_ - Height, in pixels, of the APNG to output. If omitted, will use `resizeTo` option.
- `cnum` Number _(optional)_ - Number of colors in the result; 0: all colors (lossless PNG)
- `delay` (Number | Number[]) _(optional)_ - Delay(s) between animation frames (in milliseconds, only when 2 or more frames)
- `resizeTo` ("largest" | "smallest") _(optional)_ - Resize all frame to the `largest` frame or `smallest` frame size. Default by `largest`.
- `resizeType` ("zoom" | "crop") _(optional)_ - `zoom` use sharp.resize(), `crop` use sharp.extend() and sharp.extract().
- `resizeOptions` [sharp.ResizeOptions](https://sharp.pixelplumbing.com/api-resize#parameters) _(optional)_ - Options for sharp.resize().
- `extendBackground` [sharp.Color](https://www.npmjs.org/package/color) _(optional)_ - Background option for sharp.extend(). Default by `{ r: 0, g: 0, b: 0, alpha: 0 }`.

## Change Log

### 0.1.1

- Feature: Remove [sharp-gif](https://www.npmjs.com/package/sharp-gif) dependency, use [gif-encoder](https://www.npmjs.com/package/gif-encoder) to encode animated GIF buffer directly to improve performance.

### 0.1.5

- Feature: Use [gifenc](https://www.npmjs.com/package/gifenc) instead of [gif-encoder](https://www.npmjs.com/package/gif-encoder) to encode animated GIF buffer.
