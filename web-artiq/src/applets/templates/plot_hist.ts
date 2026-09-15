import Plotly from "plotly.js-dist-min";
import * as pyon from "js-sipyco/pyon";

import type { Interface } from "../template";
import { single, gridDefaults, normalize } from "../plotlyutils";

type Args = {
    y: pyon.NpArray,
    x: pyon.NpArray,
};

export let preset = "${artiq_applet}plot_hist COUNTS_DATASET --x BIN_BOUNDARIES_DATASET";

let trace = (args: Args): Plotly.Data[] => {
    let y = normalize(args.y) as number[];
    let indices = (y: number[]) => y.map((y, i) => Number.isNaN(y) ? y : i);
    let x = args.x === undefined ? indices(y) : normalize(args.x) as number[];

    return [{ x, y, line: { shape: "hv" } }];
};

export let argsShape = { positionals: [ "y" ] };
export let from: Interface["from"] = ([ subs ]) => [
    { subs, ...single(trace) },
    gridDefaults,
];
