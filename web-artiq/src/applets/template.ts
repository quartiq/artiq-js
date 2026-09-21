import shellQuote from "shell-quote";
import minimist from "minimist";
import { GridStackWidget } from "gridstack";

import type { UnitaryArgs, SubArgs, Applet } from "./schedule";
import { isKeypath } from "../datasets/types";
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
  positionals: string[];
  localDefaults?: UnitaryArgs;
};

type ParsedArgs = [subs: SubArgs, locals: UnitaryArgs];

export type Fetched = [Applet, GridStackWidget?];

export type Interface = {
  preset: string;
  argsShape: ArgsShape;
  from: (args: ParsedArgs) => Fetched;
};

const templates: Record<Name, Interface> = {
  big_number,
  progress_bar,
  plot_xy,
  plot_hist,
  plot_xy_hist,
  image,
};

const isName = (s: string): s is Name => s in templates;

export const names = Object.keys(templates) as Name[];
export const preset = (name: Name): string => templates[name].preset;

const parsePositionals = (
  args: minimist.ParsedArgs,
  names: string[],
): UnitaryArgs => {
  const { _, ...rest } = args;
  const positionals: UnitaryArgs = {};
  _.forEach((v, i) => (positionals[names[i]] = v));
  return { ...positionals, ...rest };
};

const parseArgs = (args: minimist.ParsedArgs, shape: ArgsShape): ParsedArgs => {
  const all = Object.entries(parsePositionals(args, shape.positionals));
  const defaults = shape.localDefaults ?? {};
  const localnames = Object.keys(defaults);

  const subs: SubArgs = {};
  const locals: UnitaryArgs = {};

  all.forEach(([name, value]) => {
    if (localnames.includes(name)) {
      locals[name] = value;
      return;
    }

    if (!isKeypath(value)) return;
    subs[name] = value;
  });

  return [subs, { ...defaults, ...locals }];
};

export const fetch = (cmd: ccb.Command): Fetched => {
  const [name, ...argv] = shellQuote.parse(cmd) as string[];
  if (!isName(name)) {
    return [
      {
        subs: {},
        setup: (el) => (el.innerText = `Applet template not found: ${name}`),
        update: () => {},
      },
      { w: 2, h: 1 },
    ];
  }

  const t = templates[name];
  const parsed = parseArgs(minimist(argv), t.argsShape);
  return t.from(parsed);
};
