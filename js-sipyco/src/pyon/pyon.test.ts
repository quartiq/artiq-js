import { describe, it, expect } from "vitest";

import { join } from "path";
import { readFileSync } from "fs";
import Fraction from "fraction.js";

import * as dtype from "./dtype.js";
import * as pyon from "./pyon.js";
// TODO: test get and set
// TODO: test toHuman and fromHuman

let hinted = readFileSync(join(__dirname, "pyon_v2.test.json"), "utf8");
let tagged = pyon.decode(hinted);

let normalize = (s: string): string => JSON.stringify(JSON.parse(s));

describe("roundtrip", () => {
    it("should be identical to the input JSON", () => {
        expect(normalize(pyon.encode(tagged))).toBe(normalize(hinted));
    });
});

let testCopy = (orig: pyon.TypeTaggedObject) => {
    let copy = pyon.copy(orig);
    expect(copy.__jsonclass__).toBe(undefined);

    copy.__jsonclass__ = orig.__jsonclass__;
    expect(copy).toStrictEqual(orig);
    expect(copy).not.toBe(orig);
};

describe("set", () => {
    it("should match the structure of a JS pyon set", () => {
        expect(tagged.get("set")).toStrictEqual(new Set(["testing", "sets"]));
        expect(tagged.get("set").__jsonclass__).toBe("set");
        expect([
            `["set",["testing","sets"]]`,
            `["set",["sets","testing"]]`
        ]).toContain(pyon.preview(tagged.get("set")));
        testCopy(tagged.get("set"));
    });
});

let tupleArrayKey = [1, 2] as any;
tupleArrayKey.__jsonclass__ = "tuple";

describe("dict", () => {
    it("should match the structure of a JS pyon dict", () => {
        expect(tagged.get("od")).toStrictEqual(new Map([
            [2, "a"], [1, "b"], [0, "c"]
        ]));
        expect(tagged.get("od").__jsonclass__).toBe("dict");
        expect(pyon.preview(tagged.get("od"))).toBe(`["dict",[[2,"a"],[1,"b"],[0,"c"]]]`);
        testCopy(tagged.get("od"));

        expect(tagged.has(tupleArrayKey)).toBe(true);
    });
});

describe("tuple", () => {
    it("should match the structure of a JS pyon tuple", () => {
        expect(tagged.get(tupleArrayKey)).toStrictEqual([[3, 4.2], [2]]);
        tagged.get(tupleArrayKey).forEach((tuple: any) => {
            expect(tuple.__jsonclass__).toBe("tuple");
            testCopy(tuple);
        });
        expect(pyon.preview(tagged.get(tupleArrayKey))).toBe(`[["tuple",[3,4.2]],["tuple",[2]]]`);
    });
});

describe("bytes", () => {
    it("should match the structure of JS pyon bytes", () => {
        expect(tagged.get(true)).toStrictEqual(new Uint8Array([98, 121, 116, 101, 115]));
        expect(tagged.get(true).__jsonclass__).toBe("bytes");
        expect(pyon.preview(tagged.get(true))).toBe(`["bytes",["62","79","74","65","73"]]`);
        testCopy(tagged.get(true));
    });
});

describe("slice", () => {
    it("should match the structure of a JS pyon slice", () => {
        expect(tagged.get("slice")).toStrictEqual([ null, 3, null ]);
        expect(tagged.get("slice").__jsonclass__).toBe("slice");
        expect(pyon.preview(tagged.get("slice"))).toBe(`["slice",[null,3,null]]`);
        testCopy(tagged.get("slice"));
    });
});

let testNpScalar = (key: string, dtype: string, value: dtype.TypedArray, preview: string) => {
    expect(tagged.get(key).__dtype__).toStrictEqual(dtype);
    expect(tagged.get(key)).toStrictEqual(value);
    expect(tagged.get(key).__jsonclass__).toBe("npscalar");
    expect(pyon.preview(tagged.get(key))).toBe(`["npscalar",${preview}]`);
    testCopy(tagged.get(key));
};

describe("npscalar", () => {
    it("should match the structure of a JS pyon npscalar", () => {
        testNpScalar("a", "|i1", new Int8Array([ 9 ]), `[9]`);
        testNpScalar("b", "<i2", new Int16Array([ -98 ]), `[-98]`);
        testNpScalar("c", "<i4", new Int32Array([ 42 ]), `[42]`);
        testNpScalar("d", "<i8", new BigInt64Array([ -5n ]), `["-5"]`);

        testNpScalar("e", "|u1", new Uint8Array([ 8 ]), `[8]`);
        testNpScalar("f", "<u2", new Uint16Array([ 5 ]), `[5]`);
        testNpScalar("g", "<u4", new Uint32Array([ 4 ]), `[4]`);
        testNpScalar("h", "<u8", new BigUint64Array([ 9n ]), `["9"]`);

        // FIXME: "x" waits for vanilla Float16Array feature to drop
        //testNpScalar("x", "<f2", new Float16Array([ 9 ]), `[9]`);
        testNpScalar("y", "<f4", new Float32Array([ 9 ]), `[9]`);
        // "z" is pyonized to regular js float

        testNpScalar("q", "<c16", new Float64Array([ 0, 1 ]), `[0,1]`);
    });
});

let linspaceKey = new Fraction(3, 4) as any;
linspaceKey.__jsonclass__ = "Fraction";

describe("Fraction", () => {
    it("should match the structure of a JS pyon Fraction", () => {
        expect(tagged.has(linspaceKey)).toBe(true);
        expect(pyon.preview(linspaceKey)).toBe(`["Fraction","3/4"]`);
        testCopy(linspaceKey);
    });
});

describe("nparray", () => {
    it("should match the structure of a JS pyon nparray", () => {
        expect(tagged.get(linspaceKey).__shape__).toStrictEqual([1]);
        expect(tagged.get(linspaceKey).constructor).toBe(Float64Array);
        expect(tagged.get(linspaceKey).length).toBe(1);
        expect(tagged.get(linspaceKey)[0]).toBe(5);
        expect(tagged.get(linspaceKey).__jsonclass__).toBe("nparray");
        expect(pyon.preview(tagged.get(linspaceKey))).toBe(`["nparray",[5]]`);
        testCopy(tagged.get(linspaceKey));

        expect(tagged.get("zerodim").__shape__).toStrictEqual([]);
        expect(tagged.get("zerodim").constructor).toBe(BigInt64Array);
        expect(tagged.get("zerodim").length).toBe(1);
        expect(tagged.get("zerodim")[0]).toBe(0n);
        expect(tagged.get("zerodim").__jsonclass__).toBe("nparray");
        expect(pyon.preview(tagged.get("zerodim"))).toBe(`["nparray",["0"]]`);
        testCopy(tagged.get("zerodim"));
    });
});

let complexKey = new Float64Array([0, 1]) as any;
complexKey.__jsonclass__ = "complex";

describe("complex", () => {
    it("should match the structure of a JS pyon complex", () => {
        expect(tagged.get(complexKey).length).toBe(2);
        expect(tagged.get(complexKey)[0]).toBe(1);
        expect(tagged.get(complexKey)[1]).toBe(-9);
        expect(tagged.get(complexKey).__jsonclass__).toBe("complex");
        expect(pyon.preview(tagged.get(complexKey))).toBe(`["complex","1 - 9j"]`);
        testCopy(tagged.get(complexKey));
    });
});
