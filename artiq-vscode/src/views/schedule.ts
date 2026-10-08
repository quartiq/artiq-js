import * as vscode from "vscode";
import * as pyon from "sipyco-js/pyon";
import * as sync_struct from "sipyco-js/sync_struct";
import * as pc_rpc from "sipyco-js/pc_rpc";

import * as run from "../run.js";
import * as webview from "../webview.js";

export let view: webview.Provider;

export type Runs = pyon.TaggedDict<run.Id, run.SyncInfo>;

export const init = async (context: vscode.ExtensionContext) => {
  view = new webview.Provider("schedule", context, {
    rpc: (data: { method: string; rid: number }) => {
      pc_rpc.from<null>({
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

  const store = sync_struct.from({
    masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
    notifierName: "schedule",
    onReceive: async () => view.post(pyon.encode((await store).struct as Runs)),
  }).store;
};
