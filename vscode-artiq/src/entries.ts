import * as argument from "./argument.js";
import * as utils from "./utils.js";
import * as editors from "./editors.js";
import * as scan from "./scan.js";
import * as scaneditor from "./scaneditor.js";

type Entry<P extends argument.Procdesc> = {
    formatter: (state: argument.State<P>) => string,
    editor: editors.Editor<P>,
    getDefault: (procdesc: P) => argument.State<P>,
};

let NumberEntry: Entry<argument.Number> = {
    formatter: (state: argument.State<argument.Number>) => state.toString(),

    editor: (info: editors.Info<argument.Number>): HTMLElement => {
        let parse = (el: HTMLElement): number => Number((el as HTMLInputElement).value);
        let el = editors.input({ ...info, parse });

        el.setAttribute("type", "text");
        el.setAttribute("max", String(info.arg[0].max));
        el.setAttribute("min", String(info.arg[0].min));
        el.setAttribute("step", String(info.arg[0].step));
        // TODO: add unit suffix and scaling, see datasets:applyScale()
        return el;
    },

    getDefault: (procdesc: argument.Number): number => procdesc.default ?? 0,
};

let StringEntry: Entry<argument.String> = {
    formatter: (state: argument.State<argument.String>) => state as string,

    editor: (info: editors.Info<argument.String>): HTMLElement => {
        let parse = (el: HTMLElement): string => (el as HTMLInputElement).value;
        let el = editors.input({ ...info, parse });
        el.setAttribute("type", "text");
        return el;
    },

    getDefault: (procdesc: argument.PYON | argument.String): string => procdesc.default ?? "",
};

let DatetimeEntry: Entry<argument.Unixtime> = {
    formatter: (state: argument.State<argument.Unixtime>) => (new Date((state as number) * 1000)).toLocaleString(),

    editor: (info: editors.Info<argument.Unixtime>): HTMLElement => {
        let parse = (el: HTMLElement): number => {
            let d = new Date((el as HTMLInputElement).value);
            let v = isNaN(d.getTime()) ? utils.nowsecs() : utils.unixsecs(d);
            return v;
        };

        let el = editors.input({ ...info, parse }) as HTMLInputElement;
        el.setAttribute("type", "datetime-local");
        el.value = utils.datetimelocal(info.arg[3]);
        return el;
    },

    getDefault: (procdesc: argument.Unixtime): number => Number(procdesc.default) ?? utils.nowsecs(),
};

let BooleanEntry: Entry<argument.Boolean> = {
    formatter: (state: argument.State<argument.Boolean>) => state ? "\u2714" : "\u2718",

    editor: (info: editors.Info<argument.Boolean>): HTMLElement => {
        let parse = (el: HTMLElement): boolean => (el as HTMLInputElement).checked;
        let el = editors.input({ ...info, parse }) as HTMLInputElement;
        el.setAttribute("type", "checkbox");
        el.checked = info.arg[3];
        return el;
    },

    getDefault: (procdesc: argument.Boolean): boolean => procdesc.default ?? false,
};

let EnumerationEntry: Entry<argument.Enum> = {
    formatter: (state: argument.State<argument.Enum>) => state,

    editor: (info: editors.Info<argument.Enum>): HTMLElement => {
        if (info.arg[0]?.quickstyle) { return editors.buttons(info); }
        return editors.select(info);
    },

    getDefault: (procdesc: argument.Enum): string => procdesc.default ?? procdesc.choices[0],
};

let ScanEntry: Entry<argument.Scannable> = {
    formatter: (state: scan.ScanState) => {
        let props = Object.entries(state[state.selected])
            .filter(([k, v]) => k !== "ty")
            .map(([k, v]) => `${k}: ${v}`).join(", ");
        return `[${state.selected}] ${props}`;
    },

    editor: (info: editors.Info<argument.Scannable>): HTMLElement => {
        scaneditor.from(info);
        // no-op to satisfy return type (see: tabulator.js Editor)
        return document.createElement("div");
    },

    getDefault: (procdesc: argument.Scannable): scan.ScanState => {
        // see: artiq/gui/entries:ScanEntry.default_state
        const scale = procdesc.scale;
        return {
            selected: procdesc.default[0].ty ?? "NoScan",
            NoScan: { value: 0, repetitions: 1 },
            RangeScan: { start: 0, stop: 100 * scale, npoints: 10, randomize: false, seed: null },
            CenterScan: { center: 0, span: 100 * scale, step: 10 * scale, randomize: false, seed: null },
            ExplicitScan: { sequence: [] },

            ...Object.fromEntries(procdesc.default.map((o: scan.ScanObject) => [o.ty, o])),
        };
    },
};

let entryMap: Record<argument.Ty, Entry<any>> = {
    NumberValue: NumberEntry,
    PYONValue: StringEntry,
    BooleanValue: BooleanEntry,
    EnumerationValue: EnumerationEntry,
    StringValue: StringEntry,
    UnixtimeValue: DatetimeEntry,
    Scannable: ScanEntry,
};

export let entry = (ty: argument.Ty): Entry<any> => entryMap[ty];