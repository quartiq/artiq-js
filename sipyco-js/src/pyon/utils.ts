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
