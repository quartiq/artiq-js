import type { Interface } from "../template";

type Subs = { scalar: number };
type Locals = { "digit-count": number };

let style = document.createElement("style");
style.innerHTML = `
    .big_number {
        font-family: monospace;
        font-size: 72px;
    }
`;
document.head.appendChild(style);

export let preset = "${artiq_applet}big_number NUMBER_DATASET";

export let argsShape = {
    positionals: [ "scalar" ],
    localDefaults: { "digit-count": 10 },
};

export let from: Interface["from"] = ([ subs, locals ]) => {
    let parent: HTMLElement;

    // TODO: Add unit symbol
    let fmt = (f: number, n: number) => new Intl.NumberFormat("en-EN", { useGrouping: false, maximumSignificantDigits: n }).format(f);

    let setup = (el: HTMLElement, subs: Record<string, any>) => {
        parent = el;
        parent.classList.add("big_number");
        parent.innerText = fmt((subs as Subs).scalar, (locals as Locals)["digit-count"]);
    };

    let update = (subs: Record<string, any>) =>
        parent.innerText = fmt((subs as Subs).scalar, (locals as Locals)["digit-count"]);

    return [
        { subs, setup, update },
        { w: 5, h: 2 },
    ];
};