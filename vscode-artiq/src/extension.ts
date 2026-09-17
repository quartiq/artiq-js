// The module "vscode" contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import "./proxy.js";

import * as dbio from "./dbio.js";
import * as net from "js-sipyco/net";

import * as run from "./run.js";
import * as experiment from "./experiment.js";

import * as viewLog from "./views/log.js";
import * as viewSchedule from "./views/schedule.js";
import * as viewExperiment from "./views/experiment.js";
import * as viewArguments from "./views/arguments.js";
import * as viewExplorer from "./views/explorer.js";
import * as viewDatasets from "./views/datasets.js";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  dbio.init(context);

  net.events.addEventListener(
    "change",
    ({ detail }) =>
      detail === "failed" &&
      vscode.window.showErrorMessage(
        "Connection error. Is ARTIQ server running?",
      ),
  );

  await viewLog.init(context);
  await viewSchedule.init(context);
  await viewExperiment.init(context);
  await viewArguments.init(context);
  await viewExplorer.init();
  await viewDatasets.init();

  context.subscriptions.push(
    viewLog.view.register(),
    viewSchedule.view.register(),
    viewExperiment.view.register(),
    viewArguments.view.register(),
    viewExplorer.view,
    viewDatasets.view,

    vscode.commands.registerCommand("artiq.submitExperiment", run.submitCurr),
    vscode.commands.registerCommand(
      "artiq.examineFile",
      experiment.examineFile,
    ),
    // TODO: maybe all of these functions should live in netutils?
    vscode.commands.registerCommand("artiq.scanRepository", viewExplorer.scan),
    vscode.commands.registerCommand("artiq.openExperiment", viewExplorer.open),
    vscode.commands.registerCommand("artiq.createDataset", viewDatasets.create),
    vscode.commands.registerCommand("artiq.moveDataset", viewDatasets.move),
    vscode.commands.registerCommand("artiq.deleteDataset", viewDatasets.del),
    vscode.commands.registerCommand("artiq.editDataset", viewDatasets.edit),
  );

  vscode.window.onDidChangeTextEditorSelection(async () => {
    viewExperiment.update();
    viewArguments.update();
    viewExplorer.update();
  });

  dbio.onUpdate(() => {
    viewExperiment.update();
    viewArguments.update();
    viewExplorer.update(true);
  });
}
