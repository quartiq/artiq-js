import * as vscode from "vscode";
import * as pc_rpc from "js-sipyco/pc_rpc";

import * as utils from "./utils.js";
import * as argument from "./argument.js";
import * as experiment from "./experiment.js";

export type Id = number;

export type Expid = {
  log_level: number;
  file: string;
  class_name: string;
  arguments: argument.SubmitInfo<argument.Procdesc>;

  devarg_override?: string;
  repo_rev?: string;
};

interface SubmitInfo extends experiment.SchedulerInfo {
  expid: Expid;
}

// FIXME: "pipeline_name" and "pipeline" should be the same thing
// see "notification" dict in artiq/master/scheduler.py:Run
export interface SyncInfo extends Omit<SubmitInfo, "pipeline_name"> {
  pipeline: string;
  expid: Expid;
  priority: number;
  due_date: number;
  flush: boolean;
  status: string;
  repo_msg: string;
}

const submit: (exp: experiment.DbInfo) => void = async (exp) => {
  const file = vscode.window.activeTextEditor?.document.uri.fsPath;
  if (!file) {
    return;
  }

  const info: SubmitInfo = {
    pipeline_name: exp.pipeline_name,
    expid: {
      file,
      log_level: utils.logging[exp.log_level],
      class_name: exp.class_name,
      arguments: argument.toSubmitInfo(exp.arginfo),
    },
    priority: exp.priority,
    due_date: exp.due_date,
    flush: exp.flush,
  };

  const resp = await pc_rpc.from<Id | null>({
    masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
    targetName: "schedule",
    methodName: "submit",
    kwargs: { ...info },
    onError: (err) => vscode.window.showErrorMessage(`schedule submit: ${err}`),
  });

  if (resp === undefined) return;

  if (resp.ret === null) {
    vscode.window.showErrorMessage("Submit failed: scheduler has stopped.");
    return;
  }

  vscode.window.showInformationMessage(
    `Submitted experiment: ${exp.name}, RID: ${resp.ret}`,
  );
};

export const submitCurr = async () => {
  const curr = await experiment.curr();
  if (!curr) {
    vscode.window.showErrorMessage("Submit failed: No experiment selected.");
    return;
  }

  submit(curr);
};
