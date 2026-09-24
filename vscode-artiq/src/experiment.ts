import * as vscode from "vscode";
import * as path from "path";
import * as sync_struct from "js-sipyco/sync_struct";
import * as pc_rpc from "js-sipyco/pc_rpc";
import { TaggedDict } from "js-sipyco/pyon";

import { arrayFrom } from "./utils.js";
import * as dbio from "./dbio.js";
import * as argument from "./argument.js";
import * as entries from "./entries.js";

type Name = string;
type ClassName = string;

export type SchedulerInfo = {
  pipeline_name: string;
  priority: number;
  due_date: number | null;
  flush: boolean;
};

const scheduler_defaults: SchedulerInfo = {
  // see: artiq/dashboard/experiments.py:ExperimentManager.get_submission_scheduling
  pipeline_name: "main",
  priority: 0,
  due_date: null,
  flush: false,
};

export type LogLevel = {
  log_level: string; // see utils.logging()
};

export type DbInfo = SchedulerInfo &
  LogLevel & {
    // path and class_name are the primary key of any experiment
    path: string; // full absolute filepath, derived by client
    class_name: string;

    name: string; // unique name derived from class_name by server
    arginfo: argument.SyncInfo<argument.Procdesc>;
  };

export type SyncInfo = {
  file: string;
  class_name: ClassName;

  arginfo: argument.SyncInfo<argument.Procdesc>;
  argument_ui: string;
  scheduler_defaults: SchedulerInfo;
};

type Repo = TaggedDict<Name, SyncInfo>;

type Store = Omit<sync_struct.Store, "struct"> & {
  struct: Repo;
};

export const store: Promise<Store> = new Promise((resolve) => {
  sync_struct
    .from<Repo>({
      masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
      notifierName: "explist",
      onReceive: async () => {
        const basepath = await repoRoot;
        if (basepath === undefined) return;

        // update "softly" to provide what is new
        // yet to sustain what was known and customized
        const repo = (await store).struct;
        createAllDb(
          arrayFrom(repo, "entries").map(
            ([name, syncinfo]: [string, SyncInfo]) => ({
              ...scheduler_defaults,
              ...syncinfo.scheduler_defaults,

              path: path.posix.join(basepath, syncinfo.file),
              class_name: syncinfo.class_name,

              name,
              arginfo: initArgstates(syncinfo.arginfo),

              log_level: "WARNING", // see: artiq/dashboard/experiments.py:ExperimentManager.get_submission_options
            }),
          ),
        );
      },
    })
    .then((data: Store) => resolve(data));
});

export const repoRoot: Promise<string | undefined> = pc_rpc
  .from<string>({
    masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
    targetName: "experiment_db",
    methodName: "root",
    onError: (err) =>
      vscode.window.showErrorMessage(`experiment_db root: ${err}`),
  })
  .then((data) => data?.ret);

const key = (exp: DbInfo) => ["experiments", exp.path, exp.class_name].join();
export const updateDb = (exp: DbInfo) => dbio.update(key(exp), exp);
const updateAllDb = async (exps: DbInfo[]) =>
  dbio.updateAll(exps.map((e) => [key(e), e]));
const createAllDb = async (exps: DbInfo[]) =>
  dbio.createAll(exps.map((e) => [key(e), e]));

const initArgstates: (
  arginfo: argument.SyncInfo<argument.Procdesc>,
) => argument.SyncInfo<argument.Procdesc> = (arginfo) =>
  Object.fromEntries(
    Object.entries(arginfo).map(([name, arg]) => {
      // see: artiq/dashboard/experiments:ExperimentManager.initialize_submission_arguments
      arg[3] = entries.entry(arg[0].ty)!.getDefault(arg[0]);
      return [name, arg];
    }),
  );

export const inRepo: (exp: DbInfo) => Promise<boolean> = async (exp) =>
  (await store).struct.has(exp.name);

type ExamineInfo = {
  name: Name;

  arginfo: argument.SyncInfo<argument.Procdesc>;
  argument_ui: string;
  scheduler_defaults: SchedulerInfo;
};

type ExamineDict = Record<ClassName, ExamineInfo>;

export const examineFile: () => Promise<void> = async () => {
  const path = vscode.window.activeTextEditor!.document.uri.fsPath;
  const resp = await pc_rpc.from<ExamineDict>({
    masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
    targetName: "experiment_db",
    methodName: "examine",
    kwargs: { filename: path, use_repository: false },
    onError: (err) =>
      vscode.window.showErrorMessage(`experiment_db examine: ${err}`),
  });
  if (resp === undefined) return;

  vscode.window.showInformationMessage(`Examined file: ${resp.status}`);
  const exps: DbInfo[] = Object.entries(resp.ret).map(
    ([class_name, examinfo]: [ClassName, ExamineInfo]) => ({
      ...scheduler_defaults,
      ...examinfo.scheduler_defaults,

      path,
      class_name,

      name: examinfo.name,
      arginfo: initArgstates(examinfo.arginfo),

      log_level: "WARNING",
    }),
  );

  updateAllDb(exps);
};

export const symbols = async (uri: vscode.Uri | undefined) => {
  return (
    (await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
      "vscode.executeDocumentSymbolProvider",
      uri,
    )) ?? []
  );
};

export const selectedClass: () => Promise<string> = async () => {
  await vscode.extensions.getExtension("ms-python.python")!.exports.ready;

  const ed = vscode.window.activeTextEditor;
  if (!ed) {
    return "";
  }

  const symbol = (await symbols(ed.document.uri))
    .filter((s) => s.kind === vscode.SymbolKind.Class)
    .find((s) => s.location.range.contains(ed.selection.active));
  // TODO: filter for BaseClassName "EnvExperiment" in the class signature

  return symbol ? symbol.name : "";
};

export const curr = async (): Promise<DbInfo | undefined> => {
  if (!vscode.window.activeTextEditor) {
    return undefined;
  }
  const className = await selectedClass();
  if (className === "") {
    return undefined;
  }

  return dbio.get(
    "experiments",
    vscode.window.activeTextEditor.document.uri.fsPath,
    className,
  );
};
