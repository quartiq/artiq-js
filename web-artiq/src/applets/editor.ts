import { LeafNode, leafFrom } from "./tree";
import * as template from "./template";
import * as ccb from "./ccb";

type Input = {
    name: keyof Omit<ccb.CreateArgs, "code">,
    el: HTMLInputElement,
    test?: (s: string) => boolean,
    hint?: string,
    stringify?: (v: unknown) => string,
    parse?: (s: string) => unknown,
};

type HandleFuncs = {
    upsert: (args: ccb.CreateArgs) => void,
    update: (args: ccb.CreateArgs) => void,
    move: (args: ccb.CreateArgs, old: LeafNode) => void,
};

let handlers: HandleFuncs;
let dialog: HTMLDialogElement;
let form: HTMLFormElement;
let original: LeafNode | undefined;

export let handleFuncs = (funcs: HandleFuncs) => handlers = funcs;

let parse = (s: string): unknown => {
    // parse liberally: don't throw, return null instead
    try { return JSON.parse(s); } catch {}
};

let inputs: Input[] = [
    {
        name: "group",
        el: document.createElement("input"),
        test: s => ccb.isGroup(parse(s)),
        hint: "Expected a JSON array of strings",
        stringify: JSON.stringify,
        parse,
    }, {
        name: "name",
        el: document.createElement("input"),
        test: s => s !== "",
        hint: "Required",
    }, {
        name: "command",
        el: document.createElement("input"),
    },
];

let presets = (input: HTMLInputElement): HTMLElement => {
    let fieldset = document.createElement("fieldset");
    let legend = document.createElement("legend");

    legend.textContent = "command presets";
    fieldset.append(legend);

    template.names.forEach(name => {
        let btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = name;
        btn.addEventListener("click", () => input.value = template.preset(name));
        fieldset.append(btn);
    });

    return fieldset;
};

let dom = (): void => {
    dialog = document.createElement("dialog");
    form = document.createElement("form");
    dialog.append(form);

    inputs.forEach(input => {
        if (input.name === "command") form.append(presets(input.el));

        let label = document.createElement("label");
        label.append(input.name, input.el);
        input.el.addEventListener("input", () => input.el.setCustomValidity(""));
        form.append(label, document.createElement("br"));
    });

    // TODO: nicer interface for group input? think email address list editing in email client

    let cancel = document.createElement("button");
    cancel.type = "button"; // prevent submit
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => dialog.close());

    let save = document.createElement("button");
    save.textContent = "Save";

    form.append(cancel, save);

    dialog.addEventListener("close", () => {
        form.reset();
        inputs.forEach(input => input.el.setCustomValidity(""));
    });
};

let submit = (args: ccb.CreateArgs): void => {
    if (!original) return handlers.upsert(args);
    if (ccb.sameKey(args, original)) return handlers.update(args);
    handlers.move(args, original);
};

export let init = (): HTMLDialogElement => {
    dom();

    form.addEventListener("submit", ev => {
        ev.preventDefault();

        let invalid = inputs.find(input => input.test && !input.test(input.el.value));
        if (invalid) {
            invalid.el.setCustomValidity(invalid.hint ?? "Invalid value");
            invalid.el.reportValidity();
            return;
        }

        let draft = Object.fromEntries(inputs.map(input => [
            input.name,
            input.parse?.(input.el.value) ?? input.el.value,
        ])) as Omit<ccb.CreateArgs, "code">;

        let previous = original ?? leafFrom(draft);

        submit({
            ...draft,
            code: previous?.code ?? "", // enable roundtrip without touching "code"; preserve line breaks
        });
        dialog.close();
    });

    return dialog;
};

export let open = (args: ccb.GroupKey & Partial<ccb.CreateArgs>): void => {
    original = leafFrom(args as ccb.AppletKey);
    inputs.forEach(i => i.el.value = i.stringify?.(args[i.name]) ?? String(args[i.name] ?? ""));
    dialog.showModal();
};