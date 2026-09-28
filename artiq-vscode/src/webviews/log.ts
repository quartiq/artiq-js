import * as tabulator from "tabulator-tables";

import { Message } from "../views/log.js";

const createEls = (): HTMLElement[] => {
  const tableel = document.createElement("div");
  tableel.className = "table";
  document.body.append(tableel);
  return [tableel];
};

createEls();

const table = new tabulator.TabulatorFull(".table", {
  layout: "fitDataFill",
  columns: [
    { title: "Level", field: "level" },
    { title: "Source", field: "source" },
    { title: "Time", field: "time" },
    { title: "Message", field: "message" },
  ],
});

window.addEventListener("message", (ev) => {
  const record = ev.data as Message;
  table.addRow(
    {
      level: record[0],
      source: record[1],
      time: record[2],
      message: record[3],
    },
    true,
  );
});
