import equal from "fast-deep-equal";

export class Set<V = any> extends globalThis.Set<V> {
  // like Set, but Objects are compared by value, not by reference
  // inspired by Python set

  private find(value: V): V {
    if (typeof value !== "object") {
      return value;
    }

    for (const v of this.values()) {
      if (equal(v, value)) {
        return v;
      }
    }

    return value;
  }

  add(value: V): this {
    return super.add(this.find(value));
  }

  has(value: V): boolean {
    return super.has(this.find(value));
  }

  delete(value: V): boolean {
    return super.delete(this.find(value));
  }
}

type Params = [set: any[]];

export const fromMachine = (params: any[]): Set<any> =>
  new Set((params as Params)[0]);
export const toMachine = (data: any): Params =>
  [[...(data as Set<any>)]] as Params;

export const fromHuman = fromMachine;
export const toHuman = toMachine;

export const forPreview = (data: any): any[] => [...(data as Set<any>)];

export const copy = (src: any): Set<any> => new Set(src as Set<any>);
