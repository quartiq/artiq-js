import minimist from "minimist";
import type { Opts } from "minimist";
import type { Keypath, Dataset } from "artiq-js/datasets";
import * as datasets from "./datasets.svelte";

export type Schema<Args> = {
  positionals: Array<Extract<keyof Args, string>>;
  options?: Opts;
};

type Resolved<Datasets> = {
  [Key in keyof Datasets]: [Dataset[0], Datasets[Key], Dataset[2]] | undefined;
};

export const parse = <Args>(
  argv: string[],
  { positionals, options = {} }: Schema<Args>,
): Args => {
  const { _, ...named } = minimist(argv, options);

  return {
    ...named,
    ...Object.fromEntries(positionals.map((name, index) => [name, _[index]])),
  } as Args;
};

export const resolve = <Datasets>(
  args: Partial<Record<keyof Datasets, Keypath>>,
  keys: readonly (keyof Datasets)[],
): Resolved<Datasets> =>
  Object.fromEntries(
    keys.map((k) => [
      k,
      args[k] === undefined ? undefined : datasets.map.get(args[k]),
    ]),
  ) as Resolved<Datasets>;
