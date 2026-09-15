import * as npscalar from "./npscalar.js";

export type NpArray = npscalar.NpScalar & { __shape__: number[] };
type Params = [ shape: number[], ...npscalar.Params ];
type ParamsHuman = [ shape: number[], ...npscalar.ParamsHuman ];

export let fromMachine = ([shape, dtypeName, base64]: any[]): NpArray => {
    let typed = npscalar.fromMachine([dtypeName, base64]) as NpArray;
    typed.__shape__ = shape;
    return typed;
};

export let toMachine = (data: any): Params => {
    let params = npscalar.toMachine(data as NpArray);
    return [ (data as NpArray).__shape__, ...params ];
};

export let fromHuman = ([shape, dtypeName, arr]: any[]): NpArray => {
    let typed = npscalar.fromHuman([dtypeName, arr]) as NpArray;
    typed.__shape__ = shape;
    return typed;
};

export let toHuman = (data: any): ParamsHuman => {
    let params = npscalar.toHuman(data as NpArray);
    return [ (data as NpArray).__shape__, ...params ];
};

export let forPreview = (data: any): (number | bigint)[] => [ ...(data as NpArray) ];

export let copy = (src: any): NpArray => {
    let dest = npscalar.copy(src) as NpArray;
    dest.__shape__ = src.__shape__;
    return dest;
};

// TODO: support tuple indices like [1, [2, 3]] and such
export let get = (tagged: any, key: any): any => (tagged as NpArray)[key];

// TODO: get rid of __jsonclass__, as pyon.ts owns tagging
export let set = (tagged: any, key: any, value: any): void => {
    let [ , ...tail ] = tagged.__shape__;
    let stride = tail.reduce((a: number, b: number) => a * b, 1);
    let offset = key * stride;

    if (value.__jsonclass__ === "nparray") {
        tagged.set(value, offset);
        return;
    }

    tagged[offset] = value;
};