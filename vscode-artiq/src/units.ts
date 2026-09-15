// see: m-labs/artiq/language/units

const basic = "_"; // represents the absence of any prefix
const step = 3; // ARTIQ only makes use of prefixes based on multiples of 3
const all = "pnum_kMG"; // consecutive range of all SI prefix symbols used in ARTIQ

let join = (prefix: string, unit: string) => prefix === basic ? unit : prefix + unit;
let exp = (prefix: string) => step * (all.indexOf(prefix) - all.indexOf(basic));

const exps = Object.entries({
    // sets of SI units and dedicated prefixes supported by ARTIQ
    s: "pnum_",
    Hz: "m_kMG",
    dB: "_",
    V: "um_k",
    A: "um_",
    W: "num_",
})
    .map(([unit, supported]) => [...supported].map((prefix) => [join(prefix, unit), exp(prefix)]))
    .flat();

// returns the corresponding decimal factor for any supported prefixed unit symbol
export let scale = (prefixed: string) => Math.pow(10, Object.fromEntries(exps)[prefixed]);