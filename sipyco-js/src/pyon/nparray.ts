import * as npscalar from "./npscalar.js";

export type NpArray = npscalar.NpScalar & { __shape__: number[] };
type Params = [shape: number[], ...npscalar.Params];
type ParamsHuman = [shape: number[], ...npscalar.ParamsHuman];

export const fromMachine = ([shape, dtypeName, base64]: any[]): NpArray => {
  const typed = npscalar.fromMachine([dtypeName, base64]) as NpArray;
  typed.__shape__ = shape;
  return typed;
};

export const toMachine = (data: any): Params => {
  const params = npscalar.toMachine(data as NpArray);
  return [(data as NpArray).__shape__, ...params];
};

export const fromHuman = ([shape, dtypeName, arr]: any[]): NpArray => {
  const typed = npscalar.fromHuman([dtypeName, arr]) as NpArray;
  typed.__shape__ = shape;
  return typed;
};

export const toHuman = (data: any): ParamsHuman => {
  const params = npscalar.toHuman(data as NpArray);
  return [(data as NpArray).__shape__, ...params];
};

export const forPreview = (data: any): (number | bigint)[] => [
  ...(data as NpArray),
];

export const copy = (src: any): NpArray => {
  const dest = npscalar.copy(src) as NpArray;
  dest.__shape__ = src.__shape__;
  return dest;
};

// TODO: support tuple indices like [1, [2, 3]] and such
export const get = (tagged: any, key: any): any => (tagged as NpArray)[key];

// TODO: get rid of __jsonclass__, as pyon.ts owns tagging
export const set = (tagged: any, key: any, value: any): void => {
  const [, ...tail] = tagged.__shape__;
  const stride = tail.reduce((a: number, b: number) => a * b, 1);
  const offset = key * stride;

  if (value.__jsonclass__ === "nparray") {
    tagged.set(value, offset);
    return;
  }

  tagged[offset] = value;
};
