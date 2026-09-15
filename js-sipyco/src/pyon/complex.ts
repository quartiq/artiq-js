type Complex = Float64Array;
type Params = [ re: number, im: number ];

export let fromMachine = (params: any[]): Complex =>
    new Float64Array((params as Params)) as Complex;

export let toMachine = (data: any): Params =>
    [ ...(data as Complex) ] as Params;

export let fromHuman = fromMachine;
export let toHuman = toMachine;

export let forPreview = (data: any): string => {
    let sign = data[1] < 0 ? "-" : "+";
    return `${data[0]} ${sign} ${Math.abs(data[1])}j`;
};

export let copy = (src: any): Complex => src.slice();