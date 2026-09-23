import { TaggedDict, PYONValue } from "js-sipyco/pyon";
import { Store as SyncStructStore } from "js-sipyco/sync_struct";

export type Keypath = string;
export const isKeypath = (v: unknown): v is Keypath => typeof v === "string";

export type Metadata = { unit: string; scale: number; precision: number };
export type Dataset = [persist: boolean, value: PYONValue, metadata: Metadata];
export type Datasets = TaggedDict<Keypath, Dataset>;
export type Store = SyncStructStore & { struct: Datasets };
