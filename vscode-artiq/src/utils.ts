import { TaggedDict } from "js-sipyco/pyon";

export const splitOnLast = (
  str: string,
  delimiter: string,
): [string, string | undefined] => {
  const i = str.lastIndexOf(delimiter);
  if (i === -1) {
    return [str, undefined];
  }
  return [str.slice(0, i), str.slice(i + delimiter.length)];
};

const splitArrOnLast = (arr: any[]): [any[], any] => [
  arr.slice(0, -1),
  arr[arr.length - 1],
];

export const getByPath = (target: Record<string, any>, path: any[]) =>
  path.reduce((acc, key) => acc[key], target);

export const setByPath = (
  target: Record<string, any>,
  keys: string[],
  value: any,
) => {
  const [approach, access] = splitArrOnLast(keys);
  getByPath(target, approach)[access] = value;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const logging: { [name: string]: number } = {
  // see: https://docs.python.org/3/library/logging.html#logging-levels
  NOTSET: 0,
  DEBUG: 10,
  INFO: 20,
  WARNING: 30,
  ERROR: 40,
  CRITICAL: 50,
};

export const unixsecs = (date: Date): number =>
  Math.floor(date.getTime() / 1000);
export const nowsecs = (): number => Math.floor(Date.now() / 1000);

export const datetimelocal = (secs: number): string => {
  const date = new Date(secs * 1000);

  const a = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${a}-${mo}-${d}T${h}:${min}`;
};

// FIXME: use Uint8Array.fromBase64() as soon it is available
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64
export const bytesFrom = (base64: string): Uint8Array =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

// FIXME: use Uint8Array.prototype.toBase64() as soon it is available
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64
export const base64From = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));

// FIXME: wait for Iterator.prototype.map() to ship for MapIterator, e.g. entries(), keys(), ...
export const arrayFrom = (
  dict: TaggedDict,
  method: "entries" | "keys",
): any[] => [...dict[method]()];
