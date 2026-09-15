import * as vscode from "vscode";

import * as mutex from "./mutex.js";

type DbKey = string
type DbValue = any
type DbEntry = [DbKey, DbValue]

let db: vscode.Memento;

// somewhere in code, the db gets updated
// but the update callback singleton
// (dbio.onUpdate) is not yet initialized
// hence we want to wait for it to be ready
let updateHandler = mutex.lock();

export let init = (ctx: vscode.ExtensionContext) => db = ctx.globalState;
// TODO: should onUpdate be triggered per domain as soon, as
// new domains are implemented besides "experiment"?
export let onUpdate = (fn: () => void) => updateHandler.unlock(fn);

export let update = async (k: DbKey, v: DbValue) => {
	db.update(k, v);
	await updateHandler.locked.then(fn => fn?.());
};

export let updateAll = async (entries: DbEntry[]) => {
	entries.forEach(([k, v]) => db.update(k, v));
	await updateHandler.locked.then(fn => fn?.());
};

export let createAll = async (entries: DbEntry[]) => {
	// only write if key is not yet occupied
	entries.forEach(([k, v]) => !db.get(k) && db.update(k, v));
	await updateHandler.locked.then(fn => fn?.());
};

export let get = (...keypath: string[]): DbValue => db.get(keypath.join());
export let dump = (): Record<DbKey, DbValue> => Object.fromEntries(db.keys().map( k => [k, db.get(k)] ));
export let flush = () => db.keys().forEach(k => db.update(k, undefined));