import shellQuote from "shell-quote";
import minimist from "minimist";
import { GridStackWidget } from "gridstack";

import type { UnitaryArgs, SubArgs, Applet } from "./schedule";
import { isKeypath } from "artiq-js/datasets";
import type * as ccb from "./ccb";

import * as big_number from "./builtins/big_number";
import * as progress_bar from "./builtins/progress_bar";
import * as plot_xy from "./builtins/plot_xy";
import * as plot_hist from "./builtins/plot_hist";
import * as plot_xy_hist from "./builtins/plot_xy_hist";
import * as image from "./builtins/image";

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

type AppletWithGridDefaults = [Applet, GridStackWidget?];

export type AppletDefinition = {
  template: string;
  argsShape: ArgsShape;
  from: (args: ParsedArgs) => AppletWithGridDefaults;
};

const builtins: Record<Name, AppletDefinition> = {
  big_number,
  progress_bar,
  plot_xy,
  plot_hist,
  plot_xy_hist,
  image,
};

const isName = (s: string): s is Name => s in builtins;

export const names = Object.keys(builtins) as Name[];
export const template = (name: Name): string => builtins[name].template;

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

export const from = (cmd: ccb.Command): AppletWithGridDefaults => {
  const [name, ...argv] = shellQuote.parse(cmd) as string[];
  if (!isName(name)) {
    return [
      {
        subs: {},
        setup: (el) => (el.innerText = `Unsupported applet: ${name}`),
        update: () => {},
      },
      { w: 2, h: 1 },
    ];
  }

  const t = builtins[name];
  const parsed = parseArgs(minimist(argv), t.argsShape);
  return t.from(parsed);
};
