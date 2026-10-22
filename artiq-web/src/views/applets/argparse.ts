import minimist from "minimist";
import type { Opts } from "minimist";
import type { Keypath, Dataset } from "artiq-js/datasets";
import * as datasets from "./datasets.svelte";

export type Schema<Args> = {
  positionals: Array<Extract<keyof Args, string>>;
  options?: Opts;
};

type ResolvedDatasets<Key extends PropertyKey> = Record<
  Key,
  Dataset | undefined
>;

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

export const resolve = <Args extends object, Key extends keyof Args>(
  args: Args,
  keys: Key[],
): ResolvedDatasets<Key> =>
  Object.fromEntries(
    keys.map((k) => [k, datasets.map.get(args[k] as Keypath)]),
  ) as ResolvedDatasets<Key>;
