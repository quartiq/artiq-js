import * as dbio from "./applets/dbio.ts";

const target = "/applets";

let link = (name: string) => {
    let el = document.createElement("a");
    name === "" ? el.innerHTML = "<i>default</i>" : el.innerText = name;
    el.href = target + name;
    return el;
};

let button = (k: dbio.Key, item: HTMLLIElement) => {
    let el = document.createElement("button");
    el.innerText = "❌";
    el.addEventListener("click", () => {
        dbio.remove(k);
        item.remove();
    });
    return el;
};

let keys = (): dbio.Key[] => dbio.keys(target)
    .sort((a, b) => a.name.localeCompare(b.name));

let items = (): HTMLLIElement[] => keys().map(k => {
    let item = document.createElement("li");
    item.append(link(k.name));
    item.append(button(k, item));
    return item;
});

let refresh = (ul: HTMLUListElement) => ul.replaceChildren(...items());

let list = document.createElement("ul");
document.body.append(list);
refresh(list);

dbio.onChange(target, () => refresh(list));