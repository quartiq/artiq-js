import * as tabulator from "tabulator-tables";

import * as argument from "./argument.js";

export type Info<P extends argument.Procdesc> = {
    arg: argument.Argument<P>,
    parse?: (el: HTMLElement) => any,
    // type refers to: acquireVsCodeApi().postMessage
    // FIXME: this was solely implemented to trigger
    // run.submitCurr() via the "quickstyle" editor
    post: (message: any) => void,

    cell: tabulator.CellComponent, // TODO: maybe drop cell?
    onRendered: tabulator.EmptyCallback,
    success: tabulator.ValueBooleanCallback,
    cancel: tabulator.ValueVoidCallback,
};

export type Editor<P extends argument.Procdesc> = (info: Info<P>) => HTMLElement;

export let buttons: Editor<argument.Enum> = info => {
    let el = document.createElement("div");

    (info.arg[0] as argument.Enum).choices.forEach((c: string) => {
        let cel = document.createElement("input");
        cel.setAttribute("type", "button");
        cel.setAttribute("value", c);
        cel.addEventListener("click", ev => {
            info.success(c);
            info.post( {action: "submit"} );
        });
        el.append(cel);
    });

    info.onRendered(() => el.focus());
    el.addEventListener("keydown", ev => ev.key === "Escape" && info.cancel(info.arg[3]));

    return el;
};

export let select: Editor<argument.Enum> = info => {
    let el = document.createElement("select");

    (info.arg[0] as argument.Enum).choices.forEach((c: string) => {
        let cel = document.createElement("option");
        cel.textContent = c;
        cel.setAttribute("value", c);
        el.append(cel);
    });
    el.value = info.arg[3]; // must be set after option creation

    info.onRendered(() => el.focus());
    el.addEventListener("change", () => info.success(el.value));
    el.addEventListener("keydown", ev => ev.key === "Escape" && info.cancel(info.arg[3]));

    return el;
};

export let input: Editor<argument.Procdesc> = info => {
    let el = document.createElement("input");
    el.value = info.arg[3];

    info.onRendered(() => el.focus());
    el.addEventListener("blur", () => info.success(info.parse!(el)));
    el.addEventListener("keydown", ev => {
        if (ev.key === "Enter") { info.success(info.parse!(el)); }
        if (ev.key === "Escape") { info.cancel(info.arg[3]); } // FIXME: this seems to be overwritten by the blur event
    });

    return el;
};