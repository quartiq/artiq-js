import * as sync_struct from "js-sipyco/sync_struct";
import * as pyon from "js-sipyco/pyon";

import { Datasets, Keypath } from "../datasets/types";
import type * as ccb from "./ccb";

type ArgName = string;
export type UnitaryArgs = Record<ArgName, any>;
type SubArgs = Record<ArgName, Keypath>;

export type Applet = {
    subs: SubArgs,
    setup: (item: HTMLElement, args: UnitaryArgs) => void,
    update: (args: UnitaryArgs) => void,
};

let applets = new pyon.Dict<ccb.AppletKey, Applet>();
let dirtyApplets = new pyon.Set<ccb.AppletKey>();
let flushScheduled = false;

let keypath = (mod: sync_struct.SetitemMod | sync_struct.DelitemMod) => {
    if (mod.path.length !== 0) return mod.path[0];
    return mod.key;
};

let deriveArgs = (argsMap: SubArgs, sets: Datasets) => Object.fromEntries(Object.entries(argsMap)
    .map(([ argName, keypath ]) => [ argName, sets.get(keypath)?.[1] ]));

let scheduleUpdate = (key: ccb.AppletKey) => {
    // TODO test this, review this
    dirtyApplets.add(key);
    if (flushScheduled) return;

    flushScheduled = true;
    window.requestAnimationFrame(() => {
        flushScheduled = false;

        let pending = dirtyApplets;
        dirtyApplets = new pyon.Set();

        pending.forEach((k: ccb.AppletKey) => {
            let applet = applets.get(k);
            if (!applet) return;

            try {
                applet.update(deriveArgs(applet.subs, store.struct));
            } catch (err) {
                console.error(`applets: failed to update "${k}"`, err);
            }
        });
    });
};

let store = await sync_struct.from<Datasets>({
    masterHostname: "localhost",
    notifierName: "datasets",
    onReceive: (_, mod: sync_struct.Mod) => applets.forEach((a: Applet, k: ccb.AppletKey) => {
        if (mod.action !== "init" && !Object.values(a.subs).includes(keypath(mod))) return;
        scheduleUpdate(k);
    }),
});

export let setup = (k: ccb.AppletKey, applet: Applet, host: HTMLElement) => {
    remove(k);
    applet.setup(host, deriveArgs(applet.subs, store.struct));
    applets.set(k, applet); // after applet.setup() to omit race with applet.update()
};

export let remove = (k: ccb.AppletKey) => {
    applets.delete(k);
    dirtyApplets.delete(k);
};
