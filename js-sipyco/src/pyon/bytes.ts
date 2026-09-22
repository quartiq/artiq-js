import * as utils from "./utils.js";

type Bytes = Uint8Array;
type Params = [base64: string];

export const fromMachine = ([base64]: any[]): Bytes =>
  utils.bytesFrom(base64) as Bytes;

export const toMachine = (data: any): Params =>
  [utils.base64From(data as Bytes)] as Params;

export const fromHuman = fromMachine;
export const toHuman = toMachine;

// FIXME: use Uint8Array.prototype.toHex() as soon it is available
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toHex
export const forPreview = (data: any): string[] =>
  Array.from(data as Bytes).map((b) => b.toString(16));

export const copy = (src: any): Bytes => src.slice();
