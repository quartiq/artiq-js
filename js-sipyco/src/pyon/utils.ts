import * as pyon from "./pyon.js";
import * as dtype from "./dtype.js";

export type TypedArray = dtype.TypedArray;

export const validate = (hinted: string, decode: pyon.Decoder): boolean => {
  try {
    decode(hinted);
    return true;
  } catch {
    return false;
  }
};

// FIXME: maybe include "create" in pyon.TypeInterface and implement per type
// because "params" typing could be stronger
export const create = (
  name: pyon.TypeName,
  params: any[],
): pyon.TypeTaggedObject => {
  const v = pyon.types[name].fromMachine(params);
  v[pyon.marker] = name;
  return v;
};

// FIXME: maybe implement generically and guard against non-indexable types
export const get = (tagged: pyon.TypeTaggedObject, key: any): any =>
  pyon.types[tagged.__jsonclass__].get?.(tagged, key);

export const set = (tagged: pyon.TypeTaggedObject, key: any, value: any) =>
  pyon.types[tagged.__jsonclass__].set?.(tagged, key, value);

export const del = (tagged: pyon.TypeTaggedObject, key: any) =>
  pyon.types[tagged.__jsonclass__].del?.(tagged, key);

// FIXME: use Uint8Array.fromBase64() as soon it is available
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64
export const bytesFrom = (base64: string): Uint8Array =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

// FIXME: use Uint8Array.prototype.toBase64() as soon it is available
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64
export const base64From = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));
