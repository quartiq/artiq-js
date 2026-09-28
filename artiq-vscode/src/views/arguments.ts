import * as vscode from "vscode";

import * as webview from "../webview.js";
import * as experiment from "../experiment.js";
import * as argument from "../argument.js";
import * as run from "../run.js";

export let view: webview.Provider;

export const init = async (context: vscode.ExtensionContext) => {
  view = new webview.Provider("arguments", context, {
    submit: run.submitCurr,
    change: async (data: argument.RowInfo<argument.Procdesc>) => {
      const exp = await experiment.curr();
      if (!exp) {
        return;
      }

      exp.arginfo[data.name] = data.arg;
      experiment.updateDb(exp);
    },
  });
  view.init();
};

export const update = async () => {
  const exp = await experiment.curr();
  if (!exp) return;

  view.post({
    action: "update",
    data: Object.entries(exp.arginfo).map(([name, arg]) => ({
      name,
      arg,
      state: arg[3],
    })) as argument.RowInfo<argument.Procdesc>[],
  });
};
