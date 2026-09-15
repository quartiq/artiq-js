import Plotly from "plotly.js-dist-min";
import * as pyon from "js-sipyco/pyon";

import type { Interface } from "../template";
import { single, gridDefaults, reshape2d } from "../plotlyutils";

export type Args = {
    image2d: pyon.NpArray,
};

export let preset = "${artiq_applet}image IMG_DATASET";

let trace = (args: Args): Plotly.Data[] => [{
    type: "heatmap",
    // reshape data in col-major fashion to create parity with PyQtGraph.ImageView
    // see: artiq/applets/image.py
    z: reshape2d(args.image2d, "col-major"),
    colorscale: "Greys",
}];

export let argsShape = { positionals: [ "image2d" ] };
export let from: Interface["from"] = ([ subs ]) => [
    { subs, ...single(trace) },
    gridDefaults,
];
