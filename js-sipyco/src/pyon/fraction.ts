import Fraction from "fraction.js";
type FractionInstance = InstanceType<typeof Fraction>;

type Params =
    | [ numerator: number, denominator: number ]
    | [ number ]
    | [ string ];

export let fromMachine = (params: any[]): FractionInstance => {
    params = params as Params;
    if (params.length === 2) {
        return new Fraction(params[0], params[1]);
    }
    return new Fraction(params[0]);
};

export let toMachine = (data: any): Params => {
    let f = data as FractionInstance;
    return [ Number(f.s * f.n), Number(f.d) ] as Params;
};

export let fromHuman = fromMachine;
export let toHuman = toMachine;

export let forPreview = (data: any): string => (data as FractionInstance).toFraction();

export let copy = (src: any): FractionInstance => new Fraction(src);