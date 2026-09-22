import * as vscode from "vscode";
import * as path from "path";
import * as pc_rpc from "js-sipyco/pc_rpc";

import { arrayFrom } from "../utils.js";
import * as experiment from "../experiment.js";

let provider: ExplorerProvider;
export let view: vscode.TreeView<ExperimentTreeItem>;

export const open = async (filename: string, classname: string) => {
  const p = path.posix.join(await experiment.repoRoot, filename);
  const uri = vscode.Uri.parse(p);
  try {
    await vscode.workspace.fs.stat(uri);
  } catch {
    vscode.window.showErrorMessage(
      "No such file, consider rescanning ARTIQ repository",
    );
    return;
  }

  const location = (await experiment.symbols(uri)).find(
    (s) => s.name === classname,
  )?.location;
  if (!location) {
    vscode.window.showErrorMessage(
      "No such class, consider rescanning ARTIQ repository",
    );
    return;
  }

  const selection = new vscode.Selection(
    location.range.start,
    location.range.start,
  );
  vscode.commands.executeCommand("vscode.open", location.uri, { selection });
};

class ExperimentTreeItem extends vscode.TreeItem {
  constructor(name: string, exp: experiment.SyncInfo) {
    super(name);

    this.tooltip = `${exp.file}:${exp.class_name}`;
    const color = new vscode.ThemeColor("symbolIcon.classForeground");
    this.iconPath = new vscode.ThemeIcon("package", color);
    this.command = {
      // TODO: fix editor tab on double click
      command: "artiq.openExperiment",
      title: "",
      arguments: [exp.file, exp.class_name],
    };
  }
}

class ExplorerProvider implements vscode.TreeDataProvider<ExperimentTreeItem> {
  public items = new Map<string, ExperimentTreeItem>();

  private _onDidChangeTreeData: vscode.EventEmitter<any> =
    new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> =
    this._onDidChangeTreeData.event;
  public refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
    vscode.window.showInformationMessage("Updated Explorer");
  }

  constructor() {}

  getTreeItem(item: ExperimentTreeItem): vscode.TreeItem {
    return item;
  }

  getParent(): undefined {} // no-op; must be implemented to access TreeView.reveal()

  async getChildren(
    element?: ExperimentTreeItem,
  ): Promise<ExperimentTreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const repo = (await experiment.store).struct;
    const expNames = arrayFrom(repo, "keys");
    if (expNames.length === 0) {
      view.message =
        "Populate the repository directory with experiment files ...";
      return Promise.resolve([]);
    }

    view.message = "";
    const items = expNames.map((name) => {
      const item = new ExperimentTreeItem(name, repo.get(name));
      this.items.set(name, item);
      return item;
    });

    return items;
  }
}

export const init = async () => {
  provider = new ExplorerProvider();
  view = vscode.window.createTreeView("explorer", {
    treeDataProvider: provider,
  });

  if (vscode.workspace.getConfiguration("artiq").get("initialScan")) {
    await scan();
  }
};

export const scan = async () => {
  vscode.window.showInformationMessage("Scanning repository directory ...");
  await pc_rpc.from({
    masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
    targetName: "experiment_db",
    methodName: "scan_repository",
    onError: (err) =>
      vscode.window.showErrorMessage(`experiment_db scan_repository: ${err}`),
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deselectAll = (items: Map<string, ExperimentTreeItem>) => {
  // TODO: waiting for feature to ship
  // see https://github.com/microsoft/vscode/issues/48754
};

export const update = async (refresh?: boolean) => {
  if (refresh) {
    provider.refresh();
  }

  const curr = await experiment.curr();
  if (!curr) {
    deselectAll(provider.items);
    return;
  }

  if (!(await experiment.inRepo(curr))) {
    deselectAll(provider.items);
    return;
  }

  const item = provider.items.get(curr.name);
  if (!item) return;

  view.reveal(item);
};
