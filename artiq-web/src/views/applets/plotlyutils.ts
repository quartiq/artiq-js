import type { TypedArray } from "sipyco-js/pyonutils";
import type { NpArray } from "sipyco-js/pyon";

type NumericArray = number[] | TypedArray;

// FIXME: BigInt's may lose precision beyond JS's safe int range
export const toPlotArray = (v: NumericArray | undefined): number[] =>
  Array.from((v ?? []) as ArrayLike<number | bigint>, Number);

export const reshape2d = (arr: NpArray): number[][] => {
  const [rows, cols] = arr.__shape__;
  return Array.from({ length: rows }, (_, row) =>
    toPlotArray(arr.slice(row * cols, (row + 1) * cols)),
  );
};
