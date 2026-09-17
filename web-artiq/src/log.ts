import * as broadcast from "js-sipyco/broadcast";
import * as net from "js-sipyco/net";

type Record = [level: number, source: string, time: number, message: string];

const table = document.createElement("table");
document.body.append(table);

const append = (celltype: "th" | "td", entries: any[]) => {
  const row = document.createElement("tr");
  entries.forEach((v) => {
    const cell = document.createElement(celltype);
    cell.innerText = v;
    row.append(cell);
  });
  table.append(row);
};

append("th", ["level", "source", "time", "message"]);

broadcast.subscribe({
  masterHostname: "localhost",
  targetName: "log",
  onReceive: (record: Record) => {
    const atBottom =
      window.scrollY + window.innerHeight >= document.body.scrollHeight;
    append("td", record);
    if (atBottom) window.scrollTo(0, document.body.scrollHeight);
  },
});

const status = document.createElement("div");
status.classList.add("status", "hidden");
status.textContent = "Connection error. Is ARTIQ server running?";
document.body.append(status);

net.events.addEventListener("change", ({ detail }) =>
  status.classList.toggle("hidden", detail !== "failed"),
);
