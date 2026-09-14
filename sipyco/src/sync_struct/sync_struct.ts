// see: m-labs/sipyco/sync_struct

import * as pyon from "../pyon/pyon.js";
import * as pyonutils from "../pyon/utils.js";
import * as mutex from "./mutex.js";
import * as proxy from "../proxy.js";

type Struct = pyon.Dict;
export type Store = { struct: Struct | undefined }; // we need to operate on object property singleton to utilize the mutable object pattern
// FIXME: get rid of local store reference here!
type UpdateHandler = (store: Store, mod: Mod) => void; // work on store directly, since onReceive's first run does not wait for init lock and local reference may be empty

export type InitMod = { action: "init", struct: Struct };
export type SetitemMod = { action: "setitem", path: any[], key: any, value: any };
export type DelitemMod = { action: "delitem", path: any[], key: any };
export type Mod = InitMod | SetitemMod | DelitemMod;

type IncomingMod =
    | { action: "init", struct: Record<string, never> | Struct }
    | SetitemMod
    | DelitemMod;

type Action = (target: Store, mod: Mod, initDone: mutex.Lock) => void;

let traverse = (tree: any, path: any[]): any => path.reduce((node, key) => {
    if (pyon.isTypeTaggedObject(node)) { return pyonutils.get(node, key); }
    return node[key];
}, tree);

// empty dicts are sent as {}, so we auto-upgrade every Object (that is: string-keyed stores)
// to Dict for now; may occur with setitem's value property as well, but was never observed yet
let normalize = (mod: IncomingMod): Mod => {
    if (mod.action !== "init") return mod;
    if (mod.struct instanceof pyon.Dict) return { ...mod, struct: mod.struct };

    return { ...mod, struct: pyonutils.create("dict", [ Object.entries(mod.struct) ]) as pyon.TaggedDict };
};

let init = (store: Store, mod: Mod, lock: mutex.Lock) => {
    mod = mod as InitMod;
    store.struct = mod.struct;
    lock.unlock();
};

let setitem = (store: Store, mod: Mod) => {
    mod = mod as SetitemMod;

    let penultimate = traverse(store.struct, mod.path);
    if (pyon.isTypeTaggedObject(penultimate)) { return pyonutils.set(penultimate, mod.key, mod.value); }
    penultimate[mod.key] = mod.value;
};

let delitem = (store: Store, mod: Mod) => {
    mod = mod as DelitemMod;

    let penultimate = traverse(store.struct, mod.path);
    if (pyon.isTypeTaggedObject(penultimate)) { return pyonutils.del(penultimate, mod.key); }
    delete penultimate[mod.key];
};

let actions: { [name: string]: Action } = { init, setitem, delitem };

// see: https://git.m-labs.hk/M-Labs/artiq/src/branch/master/doc/manual/default_network_ports.rst
const port = 3250;

export let from = async <T extends Struct = Struct>(params: {
    masterHostname: string,
    notifierName: string,
    onReceive: UpdateHandler,

}): Promise<Store & { struct: T }> => {
    let store: Store = { struct: undefined };
    let initDone: mutex.Lock = mutex.lock();

    proxy.reconnect({
        open: () => proxy.chan(params.masterHostname, port, "sync_struct", params.notifierName),
        onReceive: msg => {
            let mod = normalize(pyon.decode(msg) as IncomingMod);
            actions[mod.action](store, mod, initDone);
            params.onReceive(store, mod);
        },
    });

    await initDone.locked; // FIXME store.struct = undefined breaks TreeView.getChildren
    return store as Store & { struct: T };
};