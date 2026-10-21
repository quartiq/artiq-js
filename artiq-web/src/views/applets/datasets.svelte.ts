// Bridge sync_struct's in-place updates to Svelte's per-dataset reactivity

import { SvelteMap } from "svelte/reactivity";
import * as datasets from "artiq-js/datasets";

let raw: datasets.Datasets;
export const map = new SvelteMap<datasets.Keypath, datasets.Dataset>();

const init = () => {
  map.clear();
  raw.forEach((v, k) => map.set(k, [...v]));
};

const sync = (mod: datasets.SetitemMod | datasets.DelitemMod) => {
  const k = datasets.keypath(mod);
  const v = raw.get(k);

  if (v === undefined) {
    map.delete(k);
    return;
  }

  map.set(k, [...v]);
};

export const listen = () => {
  const { store: pending, stop } = datasets.from({
    masterHostname: "localhost",
    onReceive: async (mod: datasets.Mod) => {
      raw = (await pending).struct;

      if (mod.action === "init") {
        init();
        return;
      }

      sync(mod);
    },
  });

  return stop;
};
