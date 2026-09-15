import shellQuote from "shell-quote";
import minimist from "minimist";
import { GridStackWidget } from "gridstack";

import { UnitaryArgs, Applet } from "./schedule";
import type * as ccb from "./ccb";

import * as big_number from "./templates/big_number";
import * as progress_bar from "./templates/progress_bar";
import * as plot_xy from "./templates/plot_xy";
import * as plot_hist from "./templates/plot_hist";
import * as plot_xy_hist from "./templates/plot_xy_hist";
import * as image from "./templates/image";

type Name =
    | "big_number"
    | "progress_bar"
    | "plot_xy"
    | "plot_hist"
    | "plot_xy_hist"
    | "image";

type ArgsShape = {
    positionals: string[],
    localDefaults?: UnitaryArgs,
};

type ParsedArgs = [
    subs: UnitaryArgs,
    locals: UnitaryArgs,
];

export type Fetched = [ Applet, GridStackWidget? ];

export type Interface = {
    preset: string,
    argsShape: ArgsShape,
    from: (args: ParsedArgs) => Fetched,
};

let templates: Record<Name, Interface> = {
    big_number,
    progress_bar,
    plot_xy,
    plot_hist,
    plot_xy_hist,
    image,
};

let isName = (s: string): s is Name => s in templates;

export let names = Object.keys(templates) as Name[];
export let preset = (name: Name): string => templates[name].preset;

let parsePositionals = (args: minimist.ParsedArgs, names: string[]): UnitaryArgs => {
    let { _, ...rest } = args;
    let positionals: UnitaryArgs = {};
    _.forEach((v, i) => positionals[names[i]] = v);
    return { ...positionals, ...rest };
};

let parseArgs = (args: minimist.ParsedArgs, shape: ArgsShape): ParsedArgs => {
    let unit = Object.entries(parsePositionals(args, shape.positionals));
    let filter = (fn: (v: [ string, any ]) => boolean) => Object.fromEntries(unit.filter(fn));

    let defaults = shape.localDefaults ?? {};
    let localnames = Object.keys(defaults);

    let subs = filter(([k]) => !localnames.includes(k));
    let locals = filter(([k]) => localnames.includes(k));

    return [ subs, { ...defaults, ...locals } ];
};

export let fetch = (cmd: ccb.Command): Fetched => {
    let [name, ...argv] = shellQuote.parse(cmd) as string[];
    if (!isName(name)) {
        return [
            { subs: {}, setup: el => el.innerText = `Applet template not found: ${name}`, update: () => {} },
            { w: 2, h: 1 },
        ];
    }

    let t = templates[name];
    let parsed = parseArgs(minimist(argv), t.argsShape);
    return t.from(parsed);
};