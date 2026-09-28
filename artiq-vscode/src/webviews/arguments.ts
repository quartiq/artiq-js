import * as tabulator from "tabulator-tables";

import * as argument from "../argument.js";
import * as entries from "../entries.js";

const vscode = acquireVsCodeApi();

let table: tabulator.TabulatorFull;

const formatter: tabulator.Formatter = (cell) => {
  const row = cell.getRow().getData() as argument.RowInfo<argument.Procdesc>;
  return entries.entry(row.arg[0].ty)?.formatter(row.arg[3]);
};

const editor: tabulator.Editor = (cell, onRendered, success, cancel) => {
  const row = cell.getRow().getData() as argument.RowInfo<argument.Procdesc>;
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
  const row = cell.getRow().getData() as argument.RowInfo<argument.Procdesc>;
  vscode.postMessage({
    action: "change",
    data: row,
  });
};

const mutator: tabulator.CustomMutator = (value, data) => {
  data.arg[3] = value;
  return value;
};

const tooltip: tabulator.GlobalTooltipOption = (ev, cell) => {
  const row = cell.getRow().getData() as argument.RowInfo<argument.Procdesc>;
  return row.arg[2];
};

const updateTable = (data: argument.RowInfo<argument.Procdesc>[]) => {
  table?.destroy?.();
  table = new tabulator.TabulatorFull(".table", {
    headerVisible: false,
    layout: "fitDataFill",
    data,
    groupBy: (data) => data.arg[1],
    groupHeader: (value) => value ?? "",
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
    columnDefaults: { tooltip },
  });
};

const createEls = (): HTMLElement[] => {
  const tableel = document.createElement("div");
  tableel.className = "table";

  const idleel = document.createElement("div");
  idleel.className = "idle hidden";

  const msgel = document.createElement("p");
  msgel.className = "msg";
  msgel.innerText = "No arguments available.";

  idleel.append(msgel);
  document.body.append(tableel, idleel);

  return [tableel, idleel];
};

const [tableel, idleel] = createEls();

type Action = (msg: argument.RowInfo<argument.Procdesc>[]) => void;
const actions: Record<string, Action> = {
  update: (msg) => {
    if (!msg.length) {
      idleel.classList.remove("hidden");
      tableel.classList.add("hidden");
      return;
    }

    updateTable(msg);
    idleel.classList.add("hidden");
    tableel.classList.remove("hidden");
  },
};

window.addEventListener("message", (ev) =>
  actions[ev.data.action](ev.data.data),
);
