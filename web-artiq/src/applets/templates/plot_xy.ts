import Plotly from "plotly.js-dist-min";
import * as pyon from "js-sipyco/pyon";

import type { Interface } from "../template";
import { single, gridDefaults, normalize } from "../plotlyutils";

type Args = {
  y: pyon.NpArray;
  x: pyon.NpArray;
  fit: pyon.NpArray;
  error: pyon.NpArray;
};

export const preset =
  "${artiq_applet}plot_xy Y_DATASET --x X_DATASET --error ERROR_DATASET --fit FIT_DATASET";

const trace = (args: Args): Plotly.Data[] => {
  const y = normalize(args.y) as number[];
  const indices = (y: number[]) => y.map((y, i) => (Number.isNaN(y) ? y : i));
  const x = args.x === undefined ? indices(y) : (normalize(args.x) as number[]);
  const fit = normalize(args.fit) as number[];

  return [
    {
      name: "data",
      x,
      y,
      mode: "markers",
      error_y: {
        type: "data",
        array: normalize(args.error),
      },
    },
    { name: "fit", x, y: fit },
  ];
};

export const argsShape = { positionals: ["y"] };
export const from: Interface["from"] = ([subs]) => [
  { subs, ...single(trace) },
  gridDefaults,
];
