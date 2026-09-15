import * as tabulator from "tabulator-tables";
import * as pyon from "js-sipyco/pyon";

import { arrayFrom } from "../utils.js";
import * as run from "../run.js";
import { Runs } from "../views/schedule.js";

const vscode = acquireVsCodeApi();

type RowInfo = { rid: run.Id } & run.SyncInfo;
let rows: RowInfo[] = [];
type RpcMethod = "request_termination" | "delete";

let rpc = (method: RpcMethod, rid: run.Id) => vscode.postMessage({
    action: "rpc",
    data: {method, rid},
});

let createEls = (): HTMLElement[] => {
    let tableel = document.createElement("div");
    tableel.className = "table";
    document.body.append(tableel);
    return [ tableel ];
};

createEls();

let table = new tabulator.TabulatorFull(".table", {
    layout:"fitDataFill",
    columns: [
        { title: "RID", field: "rid" },
        { title: "Pipeline", field: "pipeline" },
        { title: "Status", field: "status" },
        { title: "Prio", field: "priority" },
        { title: "Due date", field: "due_date" },
        { title: "Revision", field: "expid.repo_rev", formatter: cell => cell.getValue() ?? "w/o repo" },
        { title: "File", field: "expid.file" },
        { title: "Class name", field: "expid.class_name" },
    ],

    rowContextMenu: [
        {
            label: "Request termination",
            action: (ev, row) => rpc("request_termination", row.getData().rid),
        }, {
            label: "Delete",
            action: (ev, row) => rpc("delete", row.getData().rid),
        }, {
            label: "Gracefully terminate all in pipeline",
            action: (ev, row) => rows
                .filter(r => r.pipeline === row.getData().pipeline)
                .forEach(r => rpc("request_termination", r.rid)),
        },
    ],
});

window.addEventListener("message", ev => {
    rows = arrayFrom(pyon.decode(ev.data) as Runs, "entries")
        .map(([rid, syncinfo]: [run.Id, run.SyncInfo]) => ({ rid, ...syncinfo }));
    table.replaceData(rows);
});
