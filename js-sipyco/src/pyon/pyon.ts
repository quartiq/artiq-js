// see sequence.plantuml
export const marker = "__jsonclass__"; // see: m-labs/sipyco/pyon

import * as set from "./set.js";
import * as dict from "./dict.js";
import * as tuple from "./tuple.js";
import * as nparray from "./nparray.js";
import * as Fraction from "./fraction.js";
import * as bytes from "./bytes.js";
import * as slice from "./slice.js";
import * as npscalar from "./npscalar.js";
import * as complex from "./complex.js";

export const types: Record<string, TypeInterface> = {
  set,
  dict,
  tuple,
  nparray,
  Fraction,
  bytes,
  slice,
  npscalar,
  complex,
};

export type TypeName = keyof typeof types;

// TODO: export all types?
export { Dict } from "./dict.js";
export { Set } from "./set.js";
export { NpArray } from "./nparray.js";

export type TaggedDict<K = any, V = any> = TypeTaggedObject<
  dict.Dict<K, V>,
  "dict"
>;

const isMarked = (v: any): boolean => v && typeof v === "object" && marker in v;

type Params = any[];
type JsonClass = [name: TypeName, params: Params];
type HintedJsonClass = { [marker]: JsonClass }; // see: https://www.jsonrpc.org/specification_v1#a3.JSONClasshinting
const isHintedJsonClass = (v: any): boolean =>
  isMarked(v) &&
  Object.keys(v).length === 1 &&
  Array.isArray(v[marker]) &&
  v[marker].length === 2 &&
  typeof v[marker][0] === "string" &&
  Array.isArray(v[marker][1]);

// we use a marker key to tag type info, because
// instanceof or constructor.name may be lost
// by operations like structuredClone() in the meantime
// except for TypedArray
export type TypeTaggedObject<
  T extends object = object,
  Name extends TypeName = TypeName,
> = T & { [marker]: Name };
export const isTypeTaggedObject = (v: any): boolean =>
  isMarked(v) && typeof v[marker] === "string";

export const tag = <T extends object, Name extends TypeName>(
  value: T,
  name: Name,
): TypeTaggedObject<T, Name> => {
  (value as TypeTaggedObject)[marker] = name;
  return value as TypeTaggedObject<T, Name>;
};

type ConvName = keyof ConvInterface;
type Reviver = (params: Params) => any; // any := TypeTaggedObject
type Replacer = (data: TypeTaggedObject) => Params;
type Previewer = (data: TypeTaggedObject) => any;

interface ConvInterface {
  fromMachine: Reviver;
  toMachine: Replacer;

  // TODO: for now fromHuman and toHuman return PYON v2 JSON
  // maybe one day, the user may enjoy editing python style formatted strings
  fromHuman: Reviver;
  toHuman: Replacer;
  forPreview: Previewer; // this is one-way, so it may be very liberal

  // provides JSON replacer traverse with untagged copies of TypeTaggedObjects
  // especially important for nested structures natively passed by reference
  copy: (tagged: TypeTaggedObject) => any;
}

interface TypeInterface extends ConvInterface {
  get?: (tagged: TypeTaggedObject, key: any) => any;
  set?: (tagged: TypeTaggedObject, key: any, value: any) => void;
  del?: (tagged: TypeTaggedObject, key: any) => void;
}

type IdentityConv = (v: any) => any;
const identityConv = (v: any) => v;
const identityType: Record<ConvName, IdentityConv> = {
  fromMachine: identityConv,
  toMachine: identityConv,
  fromHuman: identityConv,
  toHuman: identityConv,
  forPreview: identityConv,
  copy: (v: any) => [...v],
};

const conv = (t: TypeName, c: ConvName): Reviver | Replacer | IdentityConv => {
  const type = types[t];
  if (!type) {
    // TODO: distinguish between valid PYON v2 types, not yet implemented
    // and random text
    console.error(`PYON type not yet implemented: ${t}`);
    return identityType[c];
  }
  return type[c];
};

const toTagged = (v: HintedJsonClass, convname: ConvName): TypeTaggedObject => {
  const [typename, params] = v[marker];
  const reviver = conv(typename, convname);

  const revived = reviver(params);
  revived[marker] = typename;
  return revived as TypeTaggedObject;
};

export const copy = (v: TypeTaggedObject): TypeTaggedObject =>
  conv(v[marker], "copy")(v);

const toHinted = (v: TypeTaggedObject, convname: ConvName): HintedJsonClass => {
  const typename = v[marker];
  const replacer = conv(typename, convname);

  const replaced: Record<string, any> = {};
  replaced[marker] = [typename, replacer(copy(v))];
  return replaced as HintedJsonClass;
};

export type Decoder = (hinted: string) => any; // HintedJsonClass -> TypeTaggedObject
export type Encoder = (tagged: any) => string; // TypeTaggedObject -> HintedJsonClass

// TODO: deal with BigInt roundtrip
// e. g. "zerodim", "d" and "h" in test data hold BigInt
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#using_json_numbers
export const decode: Decoder = (hinted) =>
  JSON.parse(hinted, (k: string, v: any): any => {
    if (!isHintedJsonClass(v)) {
      return v;
    }
    return toTagged(v, "fromMachine");
  });

export const encode: Encoder = (tagged) =>
  JSON.stringify(tagged, (k: string, v: any): any => {
    if (!isTypeTaggedObject(v)) {
      return v;
    }
    return toHinted(v, "toMachine");
  });

export const parse: Decoder = (hinted) =>
  JSON.parse(hinted, (k: string, v: any): any => {
    if (!isHintedJsonClass(v)) {
      return v;
    }
    return toTagged(v, "fromHuman");
  });

export const fmt: Encoder = (tagged) =>
  JSON.stringify(tagged, (k: string, v: any): any => {
    if (!isTypeTaggedObject(v)) {
      return v;
    }
    return toHinted(v, "toHuman");
  });

export const preview: Encoder = (tagged) =>
  JSON.stringify(tagged, (k: string, v: any): any => {
    // FIXME: make use of JSON.rawJSON(v.toString()); as soon as it becomes available
    if (typeof v === "bigint") {
      return v.toString();
    }
    if (!isTypeTaggedObject(v)) {
      return v;
    }

    const typename = v[marker];
    const replacer = conv(typename, "forPreview");
    return [typename, replacer(copy(v))] as JsonClass;
  });
