import Fraction from "fraction.js";
type FractionInstance = InstanceType<typeof Fraction>;

type Params = [numerator: number, denominator: number] | [number] | [string];

export const fromMachine = (params: any[]): FractionInstance => {
  params = params as Params;
  if (params.length === 2) {
    return new Fraction(params[0], params[1]);
  }
  return new Fraction(params[0]);
};

export const toMachine = (data: any): Params => {
  const f = data as FractionInstance;
  return [Number(f.s * f.n), Number(f.d)] as Params;
};

export const fromHuman = fromMachine;
export const toHuman = toMachine;

export const forPreview = (data: any): string =>
  (data as FractionInstance).toFraction();

export const copy = (src: any): FractionInstance => new Fraction(src);
