export type Key = {
    appName: "artiq",
    viewType: string,
    name: string,
};

type KeyString = string;

let curr = (): Key => ({
    appName: "artiq",
    viewType: document.location.pathname,
    name: document.location.hash,
});

let isKey = (v: unknown): v is Key => {
    if (typeof v !== "object" || v === null) return false;

    let k = v as Record<string, unknown>;
    return k.appName === "artiq" &&
        typeof k.viewType === "string" &&
        typeof k.name === "string";
};

let parse = (str: KeyString): Key | undefined => {
    try {
        let v: unknown = JSON.parse(str);
        return isKey(v) ? v : undefined;
    } catch {
        return undefined;
    }
};

// dependencies may pollute localStorage, so let's filter
export let keys = (viewtype?: string): Key[] => Object.keys(window.localStorage)
    .map(parse)
    .filter((k): k is Key => k !== undefined)
    .filter(k => viewtype === undefined || viewtype === k.viewType);

export let write = <T>(v: T): void => window.localStorage.setItem(JSON.stringify(curr()), JSON.stringify(v));

export let read = <T>(): T | undefined => {
    let str = window.localStorage.getItem(JSON.stringify(curr()));
    return str === null ? undefined : JSON.parse(str);
};

export let remove = (k: Key) => window.localStorage.removeItem(JSON.stringify(k));

export let onChange = (viewType: string, handler: (name: string) => void): (() => void) => {
    let listener = (ev: StorageEvent) => {
        if (ev.storageArea !== window.localStorage) return;
        if (ev.key === null) return; // ignore localStorage.clear()

        let k = parse(ev.key);
        if (k?.viewType !== viewType) return;

        handler(k.name);
    };

    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
};