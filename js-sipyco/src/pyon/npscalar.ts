import * as dtype from "./dtype.js";
import * as utils from "./utils.js";

export type NpScalar = dtype.TypedArray & { __dtype__: string };
export type Params = [ dtype: string, base64: string ];
export type ParamsHuman = [ dtype: string, arr: (number | bigint)[] ];

let from = (dtypeName: string, data: ArrayBuffer | ArrayLike<bigint>): NpScalar => {
    let TypedArray = dtype.from(dtypeName);
    let typed = new TypedArray(data) as NpScalar;
    typed.__dtype__ = dtypeName;
    return typed;
};

export let fromMachine = ([dtypeName, base64]: any[]): NpScalar => {
    let buffer = utils.bytesFrom(base64).buffer as ArrayBuffer;
    return from(dtypeName, buffer);
};

export let toMachine = (data: any): Params => {
    let base64 = utils.base64From(new Uint8Array((data as NpScalar).buffer));
    return [ (data as NpScalar).__dtype__, base64 ] as Params;
};

export let fromHuman = ([dtypeName, arr]: any[]): NpScalar =>
    from(dtypeName, arr);

// humans can not edit base64 data which
// justifies this additional conversion
export let toHuman = (data: any): ParamsHuman => [
    (data as NpScalar).__dtype__,
    [ ...data as dtype.TypedArray ],
] as ParamsHuman;

export let forPreview = (data: any): (number | bigint)[] => [ ...data as NpScalar ];

export let copy = (src: any): NpScalar => {
    let dest = src.slice() as NpScalar;
    dest.__dtype__ = src.__dtype__;
    return dest;
};