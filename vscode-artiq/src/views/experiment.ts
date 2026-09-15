import * as vscode from "vscode";

import * as webview from "../webview.js";
import * as experiment from "../experiment.js";

export let view: webview.Provider;

export let init = async (context: vscode.ExtensionContext) => {
    view = new webview.Provider("experiment", context, {
        change: async <K extends keyof experiment.DbInfo>(data: {key: K, value: experiment.DbInfo[K]}) => {
            let exp = await experiment.curr();
            if (!exp) { return; }

            exp[data.key] = data.value;
            experiment.updateDb(exp);
        },
    });
    view.init();
};

export type Message = {
    selectedClass: string,
    inRepo: boolean,
    exp: experiment.DbInfo,
};

export let update = async () => {
    let selectedClass = await experiment.selectedClass();
    let exp = await experiment.curr();
    let inRepo = exp ? experiment.inRepo(exp) : false;
    view.post( {action: "update", data: {selectedClass, inRepo, exp} as Message} );
};