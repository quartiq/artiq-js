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
export const get = (target: any, key: any): any => {
  if (pyon.isTypeTaggedObject(target)) {
    return pyon.types[target.__jsonclass__].get?.(target, key);
  }

  return (target as Record<PropertyKey, pyon.PYONValue>)[key as PropertyKey];
};

export const set = (target: any, key: any, value: any): void => {
  if (pyon.isTypeTaggedObject(target)) {
    pyon.types[target.__jsonclass__].set?.(target, key, value);
    return;
  }

  (target as Record<PropertyKey, pyon.PYONValue>)[key as PropertyKey] = value;
};

export const del = (target: any, key: any): void => {
  if (pyon.isTypeTaggedObject(target)) {
    pyon.types[target.__jsonclass__].del?.(target, key);
    return;
  }

  delete (target as Record<PropertyKey, pyon.PYONValue>)[key as PropertyKey];
};

// FIXME: use Uint8Array.fromBase64() as soon it is available
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64
export const bytesFrom = (base64: string): Uint8Array =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

// FIXME: use Uint8Array.prototype.toBase64() as soon it is available
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64
export const base64From = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));
