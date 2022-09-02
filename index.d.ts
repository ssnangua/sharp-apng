import { Color, RawOptions, ResizeOptions, Sharp, SharpOptions } from "sharp";

/**
 * APNG image data
 * @param width - The width of the image, in pixels.
 * @param height - The height of the image, in pixels.
 * @param depth - Number of bits per channel.
 * @param ctype - Color type of the file (Truecolor, Grayscale, Palette ...).
 * @param pages - Number of frames contained within the image.
 * @param delay - Delay in ms between each frame.
 * @param frames - (`framesFromApng` only) Instances of sharp from APNG frames.
 * @param image - (`sharpFromApng` only) Animated sharp instance.
 * @public
 */
export declare interface ImageData {
  width: Number;
  height: Number;
  depth: Number;
  ctype: Number;
  pages: Number;
  delay: Number[];
  frames?: Sharp[];
  image?: Sharp;
}

/**
 * Decoder options
 * @param sharpOptions - Sharp constructor options.
 * @param delay - Amount of milliseconds to delay between frames.
 * @param repeat - Amount of times to repeat GIF. Default by `0`, loop indefinitely.
 * @param quality - Quality, `1` is best colors and worst performance, `20` is suggested maximum but there is no limit. Default by `10`
 * @param transparent - Define the color which represents transparency in the GIF.
 * @param disposalCode - Alters behavior of how to render between frames. If no transparent color has been set, defaults to 0. Otherwise, defaults to 2.
 * @param gifEncoderOptions
 */
export declare interface DecoderOptions {
  gifEncoderOptions?: {
    // Number, in bytes, to store in internal buffer. Defaults to 64kB.
    highWaterMark?: number | undefined;
  };
  sharpOptions?: SharpOptions;
  delay?: Number;
  repeat?: Number;
  quality?: Number;
  transparent?: String;
  disposalCode?: Number;
}

/**
 * Encoder options
 * @param width - Width, in pixels, of the GIF to output.
 * @param height - Height, in pixels, of the GIF to output.
 * @param cnum - Number of colors in the result; 0: all colors (lossless PNG)
 * @param delay - Delay(s) between animation frames (in milliseconds, only when 2 or more frames)
 * @param resizeTo - Resize all frame to the `largest` frame or `smallest` frame size.
 * @param resizeType - Resize type, `zoom` or `crop`
 * @param resizeOptions - sharp resize options
 * @param extendBackground - sharp extend background option
 * @param rawOptions - sharp raw options
 */
export declare interface EncoderOptions {
  width?: Number;
  height?: Number;
  cnum?: Number;
  delay?: Number | Number[];
  resizeTo?: "largest" | "smallest";
  resizeType?: "zoom" | "crop";
  resizeOptions?: ResizeOptions;
  extendBackground?: Color;
  rawOptions?: RawOptions;
}

export declare interface OutputInfo {
  height: Number;
  width: Number;
  size: Number;
}

/**
 * Create instances of sharp from APNG frames
 * @param input - A String containing the filesystem path to an APNG image file, or a Buffer containing APNG image data.
 * @param resolveWithObject - Return an Object containing `frames` (an array of instances of sharp) property and decoding info instead of only an array of instances of sharp. Default by `false`.
 */
export declare function framesFromApng(
  input: string | Buffer,
  resolveWithObject?: Boolean
): Sharp[] | ImageData;

/**
 * Create an instance of animated sharp from an APNG image.
 * @param input - A String containing the filesystem path to an APNG image file, or a Buffer containing APNG image data.
 * @param options - Options for `createGif()`.
 * @param resolveWithObject - Return an Object containing `image` (instance of sharp) property and decoding info instead of only instance of sharp. Default by `false`.
 */
export declare function sharpFromApng(
  input: string | Buffer,
  options?: DecoderOptions,
  resolveWithObject?: Boolean
): Promise<Sharp | ImageData>;

/**
 * Write an APNG file from sharps
 * @param images - An array of instances of sharp.
 * @param fileOut - The path to write the image data to.
 * @param options - Options for encoding
 */
export declare function framesToApng(
  images: Sharp[],
  fileOut: string,
  options?: EncoderOptions
): Promise<OutputInfo>;

/**
 * Write an APNG file from an animated sharp
 * @param image - An instance of sharp.
 * @param fileOut - The path to write the image data to.
 * @param options - Options for encoding
 */
export declare function sharpToApng(
  image: Sharp,
  fileOut: string,
  options?: EncoderOptions
): Promise<OutputInfo>;
