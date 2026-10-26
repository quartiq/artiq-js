import type { TypedArray } from "sipyco-js/pyonutils";

type NumericArray = number[] | TypedArray;

// FIXME: BigInt's may lose precision beyond JS's safe int range
export const toPlotArray = (v: NumericArray | undefined): number[] =>
  Array.from((v ?? []) as ArrayLike<number | bigint>, Number);
