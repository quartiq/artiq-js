import * as tabulator from "tabulator-tables";

import * as argument from "../argument.js";
import * as entries from "../entries.js";

const vscode = acquireVsCodeApi();

let table: tabulator.TabulatorFull;

let formatter: tabulator.Formatter = cell => {
    let row = cell.getRow().getData() as argument.RowInfo<argument.Procdesc>;
    return entries.entry(row.arg[0].ty)?.formatter(row.arg[3]);
};

let editor: tabulator.Editor = (cell, onRendered, success, cancel) => {
    let row = cell.getRow().getData() as argument.RowInfo<argument.Procdesc>;
    return entries.entry(row.arg[0].ty)?.editor({
        arg: row.arg,
        post: vscode.postMessage,
        cell, onRendered, success, cancel,
    });
};

let cellEdited: tabulator.CellEditEventCallback = cell => {
    let row = cell.getRow().getData() as argument.RowInfo<argument.Procdesc>;
    vscode.postMessage({
        action: "change", data: row,
    });
};

let mutator: tabulator.CustomMutator = (value, data) => {
    data.arg[3] = value;
    return value;
};

let tooltip: tabulator.GlobalTooltipOption = (ev, cell) => {
    let row = cell.getRow().getData() as argument.RowInfo<argument.Procdesc>;
    return row.arg[2];
};

let updateTable = (data: argument.RowInfo<argument.Procdesc>[]) => {
    table?.destroy?.();
    table = new tabulator.TabulatorFull(".table", {
        headerVisible: false,
        layout: "fitDataFill",
        data,
        groupBy: data => data.arg[1],
        groupHeader: value => value ?? "",
        columns: [
            { title: "Name", field: "name" },
            { title: "State", field: "state", formatter, editor, cellEdited, mutator },
        ],
        columnDefaults: { tooltip },
    });
};

let createEls = (): HTMLElement[] => {
    let tableel = document.createElement("div");
    tableel.className = "table";

    let idleel = document.createElement("div");
    idleel.className = "idle hidden";

    let msgel = document.createElement("p");
    msgel.className = "msg";
    msgel.innerText = "No arguments available.";

    idleel.append(msgel);
    document.body.append(tableel, idleel);

    return [ tableel, idleel ];
};

let [ tableel, idleel ] = createEls();

type Action = (msg: argument.RowInfo<argument.Procdesc>[]) => void;
let actions: Record<string, Action> = {
    update: msg => {
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

window.addEventListener("message", ev => actions[ev.data.action](ev.data.data));