import Plotly from "plotly.js-dist-min";
import * as pyon from "js-sipyco/pyon";
import type { TypedArray } from "js-sipyco/pyonutils";
import type { UnitaryArgs } from "./schedule";

export type Trace<Args> = (args: Args) => Plotly.Data[];
export type Plot<Trace> = {
  trace: Trace;
  layout: Partial<Plotly.Layout>;
  el: HTMLElement;
};

export const plotel = (parent: HTMLElement) => {
  const el = document.createElement("div");
  parent.append(el);
  return el;
};

export const layout: () => Partial<Plotly.Layout> = () =>
  window.structuredClone({
    margin: { l: 0, r: 0, t: 0, b: 0 },
    xaxis: { automargin: true },
    yaxis: { automargin: true },
    showlegend: false,
  });

export const config: Partial<Plotly.Config> = {
  displayModeBar: false,
  responsive: true,
};

const displayed = (el: HTMLElement) =>
  el.isConnected &&
  el.offsetParent !== null &&
  el.clientWidth > 0 &&
  el.clientHeight > 0;

export const resize = (plot: HTMLElement, observed: HTMLElement) => {
  let queued = false;
  const observer = new window.ResizeObserver(() => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      if (!displayed(plot)) return;
      Plotly.Plots.resize(plot);
    });
  });

  observer.observe(observed);
};

export const single = <Args>(trace: Trace<Args>) => {
  let plot: Plot<Trace<Args>>;

  const setup = (el: HTMLElement, args: UnitaryArgs) => {
    plot = { trace, layout: layout(), el: plotel(el) };
    Plotly.newPlot(plot.el, plot.trace(args as Args), plot.layout, config);
    resize(plot.el, el);
  };

  const update = (args: UnitaryArgs) =>
    Plotly.react(plot.el, plot.trace(args as Args), plot.layout);

  return { setup, update };
};

export const gridDefaults = { w: 5, h: 4 };

// plotly.js only eats number[]
export const normalize = (arr: TypedArray): number[] => {
  if (arr instanceof BigInt64Array || arr instanceof BigUint64Array)
    // FIXME: this fails for BigInt values beyond the Number domain
    return Array.from(arr, (v) => Number(v));

  return Array.from(arr ?? []);
};

// FIXME: plotly.js only accepts nested arrays up to 3 levels
// but pyon.Nparray may hold an arbitrary number of levels
export const reshape2d = (
  arr: pyon.NpArray,
  dir: "row-major" | "col-major" = "row-major",
): number[][] => {
  if (arr === undefined) return [];

  const [rows, cols] = arr.__shape__;
  const majorRows = Array.from({ length: rows }, (_, r) =>
    normalize(arr.slice(r * cols, (r + 1) * cols)),
  );

  if (dir === "row-major") return majorRows;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => majorRows[r][c]),
  );
};
