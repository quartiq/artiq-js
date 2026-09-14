import * as sync_struct from "sipyco/sync_struct";
import { Keypath, Dataset } from "./datasets/types";

let setup = (): HTMLElement => {
    let table = document.createElement("table");
    let head = document.createElement("thead");
    let row = document.createElement("tr");
    let body = document.createElement("tbody");

    table.append(head);
    head.append(row);
    table.append(body);
    document.body.append(table);

    [ "Keypath", "Persist", "Value" ].forEach(name => {
        let cell = document.createElement("th");
        cell.setAttribute("scope", "col");
        cell.innerText = name;
        row.append(cell);
    });

    return body;
};

// TODO: apply metadata and pyon's toHuman()
let toHuman = (dataset: Dataset): string => dataset[1];
// TODO: add fromHuman for pc_rpc update calls

let create = (keypath: Keypath, dataset: Dataset): HTMLTableRowElement => {
    // TODO: on user input invoke pc_rpc update calls
    let row = document.createElement("tr");
    row.dataset.keypath = keypath;

    let cellKeypath = document.createElement("th");
    cellKeypath.setAttribute("scope", "row");
    let inputKeypath = document.createElement("input");
    inputKeypath.value = keypath;
    cellKeypath.append(inputKeypath);
    row.append(cellKeypath);

    let cellPersist = document.createElement("td");
    let inputPersist = document.createElement("input");
    inputPersist.classList.add("persist");
    inputPersist.setAttribute("type", "checkbox");
    inputPersist.checked = dataset[0];
    cellPersist.append(inputPersist);
    row.append(cellPersist);

    let cellValue = document.createElement("td");
    let inputValue = document.createElement("input");
    inputValue.classList.add("value");
    inputValue.value = toHuman(dataset);
    cellValue.append(inputValue);
    row.append(cellValue);

    return row;
};

let update = (row: HTMLElement, dataset: Dataset) => {
    let inputPersist = row.querySelector("input.persist");
    (inputPersist as HTMLInputElement).checked = dataset[0];

    let inputValue = row.querySelector("input.value");
    (inputValue as HTMLInputElement).value = toHuman(dataset);
};

let keypath = (mod: sync_struct.SetitemMod | sync_struct.DelitemMod): Keypath => [ ...mod.path, mod.key ].join(".");

let body = setup();

sync_struct.from({
    masterHostname: "localhost",
    notifierName: "datasets",
    onReceive: (_, mod: sync_struct.Mod) => {
        if (mod.action === "init") {
            let rows = Array.from(mod.struct.entries())
                .map(([keypath, dataset]) => create(keypath, dataset));
            body.replaceChildren(...rows);
        }

        if (mod.action === "setitem") {
            let row = body.querySelector(`tr[data-keypath="${keypath(mod)}"]`);
            if (row) return update((row as HTMLElement), mod.value);
            body.append(create(keypath(mod), mod.value));
        }

        if (mod.action === "delitem") body.querySelector(`tr[data-keypath="${keypath(mod)}"]`)!.remove();
    },
});