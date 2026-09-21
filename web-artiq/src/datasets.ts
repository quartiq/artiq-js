import * as sync_struct from "js-sipyco/sync_struct";
import { Keypath, Dataset } from "./datasets/types";

const setup = (): HTMLElement => {
  const table = document.createElement("table");
  const head = document.createElement("thead");
  const row = document.createElement("tr");
  const body = document.createElement("tbody");

  table.append(head);
  head.append(row);
  table.append(body);
  document.body.append(table);

  ["Keypath", "Persist", "Value"].forEach((name) => {
    const cell = document.createElement("th");
    cell.setAttribute("scope", "col");
    cell.innerText = name;
    row.append(cell);
  });

  return body;
};

// TODO: apply metadata and pyon's toHuman()
const toHuman = (dataset: Dataset): string => String(dataset[1]);
// TODO: add fromHuman for pc_rpc update calls

const create = (keypath: Keypath, dataset: Dataset): HTMLTableRowElement => {
  // TODO: on user input invoke pc_rpc update calls
  const row = document.createElement("tr");
  row.dataset.keypath = keypath;

  const cellKeypath = document.createElement("th");
  cellKeypath.setAttribute("scope", "row");
  const inputKeypath = document.createElement("input");
  inputKeypath.value = keypath;
  cellKeypath.append(inputKeypath);
  row.append(cellKeypath);

  const cellPersist = document.createElement("td");
  const inputPersist = document.createElement("input");
  inputPersist.classList.add("persist");
  inputPersist.setAttribute("type", "checkbox");
  inputPersist.checked = dataset[0];
  cellPersist.append(inputPersist);
  row.append(cellPersist);

  const cellValue = document.createElement("td");
  const inputValue = document.createElement("input");
  inputValue.classList.add("value");
  inputValue.value = toHuman(dataset);
  cellValue.append(inputValue);
  row.append(cellValue);

  return row;
};

const update = (row: HTMLElement, dataset: Dataset) => {
  const inputPersist = row.querySelector("input.persist");
  (inputPersist as HTMLInputElement).checked = dataset[0];

  const inputValue = row.querySelector("input.value");
  (inputValue as HTMLInputElement).value = toHuman(dataset);
};

const keypath = (
  mod: sync_struct.SetitemMod | sync_struct.DelitemMod,
): Keypath => [...mod.path, mod.key].join(".");

const body = setup();

sync_struct.from({
  masterHostname: "localhost",
  notifierName: "datasets",
  onReceive: (_, mod: sync_struct.Mod) => {
    if (mod.action === "init") {
      const rows = Array.from(mod.struct.entries()).map(([keypath, dataset]) =>
        create(keypath, dataset),
      );
      body.replaceChildren(...rows);
    }

    if (mod.action === "setitem") {
      const row = body.querySelector(`tr[data-keypath="${keypath(mod)}"]`);
      if (row) return update(row as HTMLElement, mod.value);
      body.append(create(keypath(mod), mod.value));
    }

    if (mod.action === "delitem")
      body.querySelector(`tr[data-keypath="${keypath(mod)}"]`)!.remove();
  },
});
