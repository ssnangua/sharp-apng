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
- `options` [GifOptions](https://github.com/ssnangua/sharp-gif#gifcreategifoptions-object-gif) - Options for `createGif()`.
- `resolveWithObject` Boolean _(optional)_ - Return an [ImageData](#imagedata) containing `image` (instance of sharp) property and decoding info instead of only instance of sharp. Default by `false`.

Returns `Promise<Sharp | ImageData>` - Resolve with an instance of animated sharp, or an [ImageData](#imagedata) containing `image` (an instances of sharp) property and decoding info.

### `ImageData`

Contains the following decoding info:

- `width` Number - The width of the image, in pixels.
- `height` Number Number - The height of the image, in pixels.
- `depth` Number - Number of bits per channel.
- `ctype` Number - Color type of the file (Truecolor, Grayscale, Palette ...).
- `pages` Number - Number of frames contained within the image.
- `delay` Number[] - Delay in ms between each frame.
- `frames` Sharp[] - Instances of sharp from APNG frames.
- `image` Sharp _(`apng.sharpFromApng()` only)_ - Animated sharp instance.

### `apng.framesToApng(images, fileOut, options?)`

Write an APNG file from sharps.

- `images` Sharp[] - An array of instances of sharp.
- `fileOut` String - The path to write the image data to.
- `options` [EncoderOptions](#EncoderOptions) _(optional)_ - Options for encoding

Returns `Promise<Object>` - Resolve with an Object containing `size`, `width`, `height` properties.

### `apng.sharpToApng(image, fileOut, options?)`

Write an APNG file from an animated sharp.

- `image` Sharp - An instance of animated sharp.
- `fileOut` String - The path to write the image data to.
- `options` [EncoderOptions](#EncoderOptions) _(optional)_ - Options for encoding

Returns `Promise<Object>` - Resolve with an Object containing `size`, `width`, `height` properties.

### EncoderOptions

- `width` Number _(optional)_ - Width, in pixels, of the GIF to output.
- `height` Number _(optional)_ - Height, in pixels, of the GIF to output.
- `cnum` Number _(optional)_ - Number of colors in the result; 0: all colors (lossless PNG)
- `delay` (Number | Number[]) _(optional)_ - Delay(s) between animation frames (in milliseconds, only when 2 or more frames)
- `resizeTo` ("largest" | "smallest") _(optional)_ - Resize all frame to the `largest` frame or `smallest` frame size. Default by `largest`.
- `resizeType` ("zoom" | "crop") _(optional)_ - `zoom` use sharp.resize(), `crop` use sharp.extend() and sharp.extract().
- `resizeOptions` [sharp.ResizeOptions](https://sharp.pixelplumbing.com/api-resize#parameters) _(optional)_ - Options for sharp.resize().
- `extendBackground` [sharp.Color](https://www.npmjs.org/package/color) _(optional)_ - Background option for sharp.extend().
