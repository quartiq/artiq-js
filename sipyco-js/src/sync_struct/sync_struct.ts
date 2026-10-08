// see: m-labs/sipyco/sync_struct
// TODO: implement missing actions: append, insert, pop

import * as pyon from "../pyon/pyon.js";
import * as pyonutils from "../pyon/utils.js";
import * as net from "../net.js";
import * as sync from "../sync.js";

type Struct = pyon.Dict<pyon.PYONValue, pyon.PYONValue>;
export type Store = { struct: Struct | undefined }; // we need to operate on object property singleton to utilize the mutable object pattern
type UpdateHandler = (mod: Mod) => void;

export type InitMod = { action: "init"; struct: Struct };

export type SetitemMod = {
  action: "setitem";
  path: pyon.PYONValue[];
  key: pyon.PYONValue;
  value: pyon.PYONValue;
};

export type DelitemMod = {
  action: "delitem";
  path: pyon.PYONValue[];
  key: pyon.PYONValue;
};

export type Mod = InitMod | SetitemMod | DelitemMod;

type IncomingMod =
  | { action: "init"; struct: Record<string, never> | Struct }
  | SetitemMod
  | DelitemMod;

type Action = (target: Store, mod: Mod, done: sync.Done) => void;

const traverse = (
  tree: pyon.PYONValue,
  path: pyon.PYONValue[],
): pyon.PYONValue =>
  path.reduce<pyon.PYONValue>((node, key) => pyonutils.get(node, key), tree);

// empty dicts are sent as {}, so we auto-upgrade every Object (that is: string-keyed stores)
// to Dict for now; may occur with setitem's value property as well, but was never observed yet
const normalize = (mod: IncomingMod): Mod => {
  if (mod.action !== "init") return mod;
  if (mod.struct instanceof pyon.Dict) return { ...mod, struct: mod.struct };

  return {
    ...mod,
    struct: pyon.tag(new pyon.Dict(Object.entries(mod.struct)), "dict"),
  };
};

const init = (store: Store, mod: Mod, done: sync.Done) => {
  mod = mod as InitMod;
  store.struct = mod.struct;
  done();
};

const setitem = (store: Store, mod: Mod) => {
  mod = mod as SetitemMod;
  const penultimate = traverse(store.struct, mod.path);
  pyonutils.set(penultimate, mod.key, mod.value);
};

const delitem = (store: Store, mod: Mod) => {
  mod = mod as DelitemMod;
  const penultimate = traverse(store.struct, mod.path);
  pyonutils.del(penultimate, mod.key);
};

const actions: { [name: string]: Action } = { init, setitem, delitem };

// see: https://git.m-labs.hk/M-Labs/artiq/src/branch/master/doc/manual/default_network_ports.rst
const port = 3250;

export const from = <T extends Struct = Struct>(params: {
  masterHostname: string;
  notifierName: string;
  onReceive: UpdateHandler;
}): {
  store: Promise<Store & { struct: T }>;
  stop: net.Stop;
} => {
  const store: Store = { struct: undefined };
  const { wait, done } = sync.wait();

  const stop = net.reconnect({
    open: () =>
      net.chan(params.masterHostname, port, "sync_struct", params.notifierName),
    onReceive: (msg) => {
      const mod = normalize(pyon.decode(msg) as IncomingMod);
      actions[mod.action](store, mod, done);
      params.onReceive(mod);
    },
  });

  return {
    store: wait.then(() => store as Store & { struct: T }),
    stop,
  };
};
