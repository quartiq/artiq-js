import * as vscode from "vscode";
import * as broadcast from "js-sipyco/broadcast";

import * as webview from "../webview.js";

export let view: webview.Provider;

export const init = async (context: vscode.ExtensionContext) => {
  view = new webview.Provider("log", context);
  view.init();

  broadcast.subscribe<Message>({
    masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
    targetName: "log",
    onReceive: (msg) => view.post(msg),
  });
};

export type Message = [
  level: number,
  source: string,
  time: number,
  message: string,
];
