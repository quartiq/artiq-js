type Tuple = any[];
type Params = [tuple: Tuple];

export const fromMachine = (params: any[]): Tuple =>
  (params as Params)[0] as Tuple;
export const toMachine = (data: any): Params => [data as Tuple] as Params;

export const fromHuman = fromMachine;
export const toHuman = toMachine;

export const forPreview = (data: any): Tuple => data as Tuple;

export const copy = (src: any): Tuple => [...src] as Tuple;

export const get = (tagged: any, key: any): any => (tagged as Tuple)[key];
export const set = (tagged: any, key: any, value: any) =>
  ((tagged as Tuple)[key] = value);
export const del = (tagged: any, key: any) => delete (tagged as Tuple)[key];
