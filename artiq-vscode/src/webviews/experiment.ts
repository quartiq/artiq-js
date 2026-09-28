// TODO: unify experiments and arguments
import * as tabulator from "tabulator-tables";

import * as argument from "../argument.js";
import * as entries from "../entries.js";
import * as experiment from "../experiment.js";
import * as utils from "../utils.js";
import { Message } from "../views/experiment.js";

const vscode = acquireVsCodeApi();

let table: tabulator.TabulatorFull;

type Info = experiment.SchedulerInfo & experiment.LogLevel;
type RowInfo<K extends keyof Info> = argument.RowInfo<argument.Procdesc> & {
  name: K;
  arg: argument.Argument<argument.Procdesc, Info[K]>;
  state: Info[K];
};

type Field = {
  key: keyof Info;
  procdesc: argument.Procdesc;
};

const fields: Record<string, Field> = {
  Priority: {
    key: "priority",
    procdesc: { ty: "StringValue" } as argument.String,
  },
  "Log level": {
    key: "log_level",
    procdesc: {
      ty: "EnumerationValue",
      choices: Object.keys(utils.logging),
    } as argument.Enum,
  },
  Pipeline: {
    key: "pipeline_name",
    procdesc: { ty: "StringValue" } as argument.String,
  },
  "Due date": {
    key: "due_date",
    procdesc: { ty: "UnixtimeValue" } as argument.Unixtime,
  },
  Flush: { key: "flush", procdesc: { ty: "BooleanValue" } as argument.Boolean },
};

const formatter: tabulator.Formatter = (cell) => {
  const row = cell.getRow().getData() as RowInfo<keyof Info>;
  return entries.entry(row.arg[0].ty)?.formatter(row.arg[3]);
};

// TODO: guard priority and pipeline_name against bad entries, e. g. ""
const editor: tabulator.Editor = (cell, onRendered, success, cancel) => {
  const row = cell.getRow().getData() as RowInfo<keyof Info>;
  return entries.entry(row.arg[0].ty)?.editor({
    arg: row.arg,
    post: vscode.postMessage,
    cell,
    onRendered,
    success,
    cancel,
  });
};

const cellEdited: tabulator.CellEditEventCallback = (cell) => {
  const row = cell.getRow().getData() as RowInfo<keyof Info>;
  vscode.postMessage({
    action: "change",
    data: {
      key: fields[row.name].key,
      value: row.arg[3],
    },
  });
};

// FIXME: handle due_date, if its "null"
const mutator: tabulator.CustomMutator = (value, data) => {
  data.arg[3] = value;
  return value;
};

const updateTable = (exp: experiment.DbInfo) => {
  const data = Object.entries(fields).map(([name, field]) => ({
    name,
    arg: [field.procdesc, "", "", exp[field.key]],
    state: exp[field.key], // we need to break this out of arg to make Tabulator work
  })) as RowInfo<keyof Info>[];

  table?.destroy?.();
  table = new tabulator.TabulatorFull(".table", {
    headerVisible: false,
    layout: "fitDataFill",
    data,
    columns: [
      { title: "Name", field: "name" },
      {
        title: "State",
        field: "state",
        formatter,
        editor,
        cellEdited,
        mutator,
      },
    ],
  });
};

const createEls = (): [HTMLElement, HTMLElement, HTMLElement[]] => {
  const tableel = document.createElement("div");
  tableel.className = "table";

  const idleel = document.createElement("div");
  idleel.className = "idle hidden";

  const msgels = Object.entries({
    select: "Select an experiment in the editor or in the explorer ...",
    scan: "Unknown experiment. Consider saving the file and rescanning the repository ...",
    examine: "Unknown experiment. Consider saving and examining the file ...",
  }).map(([name, text]) => {
    const el = document.createElement("p");
    el.className = `msg ${name}`;
    el.innerText = text;
    return el;
  });

  idleel.append(...msgels);
  document.body.append(tableel, idleel);

  return [tableel, idleel, msgels];
};

const [tableel, idleel, msgels] = createEls();

type Action = (msg: Message) => void;
const actions: Record<string, Action> = {
  update: (msg: Message) => {
    if (!msg.selectedClass) {
      showIdle("select");
      return;
    }

    if (!msg.exp && msg.inRepo) {
      showIdle("scan");
      return;
    }

    if (!msg.exp) {
      showIdle("examine");
      return;
    }

    updateTable(msg.exp);
    idleel.classList.add("hidden");
    tableel.classList.remove("hidden");
  },
};

const showIdle = (type: "select" | "scan" | "examine") => {
  msgels.forEach((el) => el.classList.add("hidden"));
  idleel.querySelector(`.msg.${type}`)!.classList.remove("hidden");

  idleel.classList.remove("hidden");
  tableel.classList.add("hidden");
};

window.addEventListener("message", (ev) =>
  actions[ev.data.action](ev.data.data),
);
