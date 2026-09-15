// Mapping numpy-like dtypes to JS TypedArray subtypes
// see: https://numpy.org/doc/stable/reference/arrays.interface.html#object.__array_interface__
// TODO: implement float16, float128, bUcmOVS and big-endianness
// also check ndarrays internal mapping and package ndarray-complex

type TypedArrayConstructor =
    | Int8ArrayConstructor
    | Int16ArrayConstructor
    | Int32ArrayConstructor
    | BigInt64ArrayConstructor

    | Uint8ArrayConstructor
    | Uint16ArrayConstructor
    | Uint32ArrayConstructor
    | BigUint64ArrayConstructor

    | Float32ArrayConstructor
    | Float64ArrayConstructor;

export type TypedArray =
    | Int8Array
    | Int16Array
    | Int32Array
    | BigInt64Array

    | Uint8Array
    | Uint16Array
    | Uint32Array
    | BigUint64Array

    | Float32Array
    | Float64Array;

type Name = string;
type Entry = { dtype: Name, ctor: TypedArrayConstructor };

let dict: Entry[] = [
    { dtype: "|i1", ctor: Int8Array },
    { dtype: "<i2", ctor: Int16Array },
    { dtype: "<i4", ctor: Int32Array },
    { dtype: "<i8", ctor: BigInt64Array },

    { dtype: "|u1", ctor: Uint8Array },
    { dtype: "<u2", ctor: Uint16Array },
    { dtype: "<u4", ctor: Uint32Array },
    { dtype: "<u8", ctor: BigUint64Array },

// FIXME: use Float16Array, as soon it is natively available
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array
//    { dtype: "<f2", ctor: Float16Array },
    { dtype: "<f4", ctor: Float32Array },
    { dtype: "<f8", ctor: Float64Array },

    { dtype: "<c16", ctor: Float64Array },
];

export let from = (dtype: Name): TypedArrayConstructor => {
    let entry = dict.find((e: Entry) => e.dtype === dtype);
    if (entry) { return entry.ctor; }

    console.error("Unknown dtype: " + dtype);
    return Uint8Array;
};

export let toString = (ctor: TypedArrayConstructor): Name | undefined => dict
    .find((e: Entry) => e.ctor.name === ctor.name)
    ?.dtype;