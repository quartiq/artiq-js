import * as vscode from "vscode";
import * as pyon from "js-sipyco/pyon";
import * as sync_struct from "js-sipyco/sync_struct";
import * as pc_rpc from "js-sipyco/pc_rpc";

import * as run from "../run.js";
import * as webview from "../webview.js";

export let view: webview.Provider;

export type Runs = pyon.TaggedDict<run.Id, run.SyncInfo>;

export const init = async (context: vscode.ExtensionContext) => {
  view = new webview.Provider("schedule", context, {
    rpc: (data: { method: string; rid: number }) => {
      pc_rpc.from({
        masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
        targetName: "schedule",
        methodName: data.method,
        kwargs: { rid: data.rid },
        onError: (err) =>
          vscode.window.showErrorMessage(`schedule ${data.method}: ${err}`),
      });
    },
  });
  view.init();

  sync_struct.from({
    masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
    notifierName: "schedule",
    onReceive: (store: sync_struct.Store) =>
      view.post(pyon.encode(store.struct as Runs)),
  });
};
