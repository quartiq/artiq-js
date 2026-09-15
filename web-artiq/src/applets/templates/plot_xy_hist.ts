import Plotly from "plotly.js-dist-min";
import * as pyon from "js-sipyco/pyon";

import type { Interface } from "../template";
import { Plot, layout, config, resize, normalize, reshape2d, plotel } from "../plotlyutils";

type Args = {
    xs: pyon.NpArray,
    histogram_bins: pyon.NpArray,
    histogram_counts: pyon.NpArray,
};

export let preset = "${artiq_applet}plot_xy_hist X_DATASET HIST_BIN_BOUNDARIES_DATASET HISTS_COUNTS_DATASET";

type Trace = (args: Args, selected: number) => Plotly.Data[];

let weightedMeans = (bins: number[], counts: number[][]): number[] => {
    let centers = bins.slice(0, -1).map((b, i) => (b + bins[i + 1]) / 2);
    let prod = (a: number[], b: number[]) => a.map((el, i) => el * b[i]);
    let sum = (ns: number[]) => ns.reduce((sum, n) => sum + n, 0);

    return counts.map(c => {
        let total = sum(c);
        return total === 0 ? Number.NaN : sum(prod(centers, c)) / total;
    });
};

let sumBins = (counts: number[][]): number[] => {
    let totals = Array(counts[0]?.length ?? 0).fill(0);
    counts.forEach(row => row.forEach((count, i) => totals[i] += count));
    return totals;
};

let traces = [
    (args: Args, selected: number): Plotly.Data[] => {
        // TODO: validate that x.length === counts.length && every row has bins.length - 1
        let x = normalize(args.xs) as number[];
        let bins = normalize(args.histogram_bins) as number[];
        let counts = reshape2d(args.histogram_counts);

        return [{ x, y: weightedMeans(bins, counts), mode: "markers", marker: {
            color: x.map((_, i) => i === selected ? "red" : "blue"),
        } }];
    },

    (args: Args, selected: number): Plotly.Data[] => {
        // TODO: validate that x.length === counts.length && every row has bins.length - 1
        let x = normalize(args.histogram_bins) as number[];
        let counts = reshape2d(args.histogram_counts);
        let y = selected === -1 ? [ ...sumBins(counts), 0 ] : [ ...counts[selected], 0 ];

        return [{ x, y, line: { shape: "hv", color: "red" } }];
    },
];

export let argsShape = { positionals: [ "xs", "histogram_bins", "histogram_counts" ] };

export let from: Interface["from"] = ([ subs ]) => {
    let cached: Args;
    let selected: number = -1;

    let plots: Plot<Trace>[];

    let setup = (el: HTMLElement, args: Record<string, any>) => {
        // create all widget partitions with plotel() before Plotly init, so width's are clear
        plots = traces.map(trace => ({ trace, layout: layout(), el: plotel(el) }));
        plots.forEach(p => {
            Plotly.newPlot(p.el, p.trace(args as Args, selected), p.layout, config);
            resize(p.el, el);
        });

        cached = args as Args;
        (plots[0].el as Plotly.PlotlyHTMLElement).on("plotly_hover", (ev: Plotly.PlotMouseEvent) => {
            selected = ev.points[0].pointIndex;
            plots.forEach(p => Plotly.react(p.el, p.trace(cached, selected), p.layout));
        });
    };

    let clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

    let update = (args: Record<string, any>) => {
        cached = args as Args;
        selected = clamp(selected, -1, args.histogram_counts.length - 1);
        if (Number.isNaN(selected)) selected = -1;
        plots.forEach(p => Plotly.react(p.el, p.trace(args as Args, selected), p.layout));
    };

    return [
        { subs, setup, update },
        { w: 10, h: 4 },
    ];
};
