import * as dbio from "./applets/dbio";

const target = "/applets";

const link = (name: string) => {
  const el = document.createElement("a");
  el.innerText = name;
  if (name === "") el.innerHTML = "<i>default</i>";
  el.href = target + name;
  return el;
};

const button = (k: dbio.Key, item: HTMLLIElement) => {
  const el = document.createElement("button");
  el.innerText = "❌";
  el.addEventListener("click", () => {
    dbio.remove(k);
    item.remove();
  });
  return el;
};

const keys = (): dbio.Key[] =>
  dbio.keys(target).sort((a, b) => a.name.localeCompare(b.name));

const items = (): HTMLLIElement[] =>
  keys().map((k) => {
    const item = document.createElement("li");
    item.append(link(k.name));
    item.append(button(k, item));
    return item;
  });

const refresh = (ul: HTMLUListElement) => ul.replaceChildren(...items());

const list = document.createElement("ul");
document.body.append(list);
refresh(list);

dbio.onChange(target, () => refresh(list));
