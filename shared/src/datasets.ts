import { TaggedDict, PYONValue } from "js-sipyco/pyon";
import * as sync_struct from "js-sipyco/sync_struct";

export type Keypath = string;
export const isKeypath = (v: unknown): v is Keypath => typeof v === "string";

export type Metadata = { unit: string; scale: number; precision: number };
export type Dataset = [persist: boolean, value: PYONValue, metadata: Metadata];
export type Datasets = TaggedDict<Keypath, Dataset>;
export type Store = Omit<sync_struct.Store, "struct"> & { struct: Datasets };

export type InitMod = Omit<sync_struct.InitMod, "struct"> & {
  struct: Datasets;
};

type RootSetitemMod = sync_struct.SetitemMod & {
  path: [];
  key: Keypath;
  value: Dataset;
};

type NestedSetitemMod = sync_struct.SetitemMod & {
  path: [Keypath, ...PYONValue[]];
};

export type SetitemMod = RootSetitemMod | NestedSetitemMod;

type RootDelitemMod = sync_struct.DelitemMod & {
  path: [];
  key: Keypath;
};

type NestedDelitemMod = sync_struct.DelitemMod & {
  path: [Keypath, ...PYONValue[]];
};

export type DelitemMod = RootDelitemMod | NestedDelitemMod;

export type Mod = InitMod | SetitemMod | DelitemMod;

export const keypath = (mod: SetitemMod | DelitemMod): Keypath =>
  (mod.path.length === 0 ? mod.key : mod.path[0]) as Keypath;

export const from = (params: {
  masterHostname: string;
  onReceive: (mod: Mod) => void;
}): Promise<Store> =>
  sync_struct.from<Datasets>({
    masterHostname: params.masterHostname,
    notifierName: "datasets",
    onReceive: (_, mod) => params.onReceive(mod as Mod),
  });
