import equal from "fast-deep-equal";

export class Dict<K = any, V = any> extends Map<K, V> {
  // like Map, but Object keys are compared by value, not by reference
  // inspired by Python dictionary

  private find(key: K): K {
    if (typeof key !== "object") {
      return key;
    }

    for (const k of this.keys()) {
      if (equal(k, key)) {
        return k;
      }
    }

    return key;
  }

  set(key: K, value: V): this {
    return super.set(this.find(key), value);
  }

  get(key: K): V | undefined {
    return super.get(this.find(key));
  }

  has(key: K): boolean {
    return super.has(this.find(key));
  }

  delete(key: K): boolean {
    return super.delete(this.find(key));
  }
}

type Entry = [key: any, value: any];
type Params = [Entry[]];

export const fromMachine = (params: any[]): Dict => {
  const d = new Dict();
  (params as Params)[0].forEach((e: Entry) => d.set(e[0], e[1]));
  return d;
};

export const toMachine = (data: any): Params =>
  [Array.from(data as Dict)] as Params;

export const fromHuman = fromMachine;
export const toHuman = toMachine;

export const forPreview = (data: any): Entry[] => Array.from(data as Dict);

export const copy = (src: any): Dict => {
  const clone = new Dict();
  for (const [k, v] of src as Dict) {
    clone.set(k, v);
  }
  return clone;
};

export const get = (tagged: any, key: any): any => (tagged as Dict).get(key);
export const set = (tagged: any, key: any, value: any) =>
  (tagged as Dict).set(key, value);
export const del = (tagged: any, key: any) => (tagged as Dict).delete(key);
