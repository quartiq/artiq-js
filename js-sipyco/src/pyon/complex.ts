type Complex = Float64Array;
type Params = [re: number, im: number];

export const fromMachine = (params: any[]): Complex =>
  new Float64Array(params as Params) as Complex;

export const toMachine = (data: any): Params =>
  [...(data as Complex)] as Params;

export const fromHuman = fromMachine;
export const toHuman = toMachine;

export const forPreview = (data: any): string => {
  const sign = data[1] < 0 ? "-" : "+";
  return `${data[0]} ${sign} ${Math.abs(data[1])}j`;
};

export const copy = (src: any): Complex => src.slice();
