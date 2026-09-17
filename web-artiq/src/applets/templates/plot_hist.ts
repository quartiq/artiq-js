import Plotly from "plotly.js-dist-min";
import * as pyon from "js-sipyco/pyon";

import type { Interface } from "../template";
import { single, gridDefaults, normalize } from "../plotlyutils";

type Args = {
  y: pyon.NpArray;
  x: pyon.NpArray;
};

export const preset =
  "${artiq_applet}plot_hist COUNTS_DATASET --x BIN_BOUNDARIES_DATASET";

const trace = (args: Args): Plotly.Data[] => {
  const y = normalize(args.y) as number[];
  const indices = (y: number[]) => y.map((y, i) => (Number.isNaN(y) ? y : i));
  const x = args.x === undefined ? indices(y) : (normalize(args.x) as number[]);

  return [{ x, y, line: { shape: "hv" } }];
};

export const argsShape = { positionals: ["y"] };
export const from: Interface["from"] = ([subs]) => [
  { subs, ...single(trace) },
  gridDefaults,
];
