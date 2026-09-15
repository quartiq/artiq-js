/**
 * ARTIQ Ticker - TypeScript Port
 * Original: Robert Jordens <rj@m-labs.hk>, 2016
 * Ported to TypeScript: 2026 by Claude LLM
 * 
 * Generates optimal tick positions and labels for numeric axes
 */

interface TickerOptions {
    minTicks?: number;
    precision?: number;
    steps?: number[];
}

interface TickResult {
    ticks: number[];
    prefix: string;
    labels: string[];
}

export class Ticker {
    public minTicks: number;
    private precision: number;
    private steps: number[];

    /**
     * Create a new Ticker
     * @param minTicks - Minimum number of ticks to generate.
     *                   The maximum number of ticks is max(consecutive ratios in steps)*minTicks
     *                   thus 5/2*minTicks for default steps.
     * @param precision - Maximum number of significant digits in labels.
     *                    Also extract common offset and magnitude from ticks
     *                    if dynamic range exceeds precision number of digits
     *                    (small range on top of large offset).
     * @param steps - Tick increments at a given magnitude.
     *                The .5 catches rounding errors where the calculation
     *                of step_magnitude falls into the wrong exponent bin.
     */
    constructor(options: TickerOptions = {}) {
        this.minTicks = options.minTicks ?? 3;
        this.precision = options.precision ?? 3;
        this.steps = options.steps ?? [5, 2, 1, 0.5];
    }

    /**
     * Return recommended step value for interval size `i`.
     */
    step(i: number): number {
        if (!i) {
            throw new Error("Need a finite interval");
        }
        
        const step = i / this.minTicks; // rational step size for min_ticks
        const stepMagnitude = Math.pow(10, Math.floor(Math.log10(step)));
        // underlying magnitude for steps
        
        for (const m of this.steps) {
            const goodStep = m * stepMagnitude;
            if (goodStep <= step) {
                return goodStep;
            }
        }
        
        // Fallback (shouldn't reach here with proper steps)
        return stepMagnitude;
    }

    /**
     * Return recommended tick values for interval `[a, b[`.
     */
    ticks(a: number, b: number): number[] {
        const step = this.step(b - a);
        const a0 = Math.ceil(a / step) * step;
        
        const ticks: number[] = [];
        for (let tick = a0; tick < b; tick += step) {
            ticks.push(tick);
        }
        
        return ticks;
    }

    /**
     * Find offset if dynamic range of the interval is large
     * (small range on large offset).
     * 
     * If offset is finite, show `offset + value`.
     */
    offset(a: number, step: number): number {
        if (a === 0) {
            return 0;
        }
        
        const la = Math.floor(Math.log10(Math.abs(a)));
        const lr = Math.floor(Math.log10(step));
        
        if (la - lr < this.precision) {
            return 0;
        }
        
        const magnitude = Math.pow(10, lr - 1 + this.precision);
        const offset = Math.floor(a / magnitude) * magnitude;
        
        return offset;
    }

    /**
     * Determine the scaling magnitude.
     * 
     * If magnitude differs from unity, show `magnitude * value`.
     * This depends on proper offsetting by `offset()`.
     */
    magnitude(a: number, b: number, step: number): number {
        const v = Math.floor(Math.log10(Math.max(Math.abs(a), Math.abs(b))));
        const w = Math.floor(Math.log10(step));
        
        if (v < this.precision && w > -this.precision) {
            return 1;
        }
        
        return Math.pow(10, v);
    }

    /**
     * Replace ASCII minus with Unicode minus for better typography
     */
    private fixMinus(s: string): string {
        return s.replace(/-/g, "−"); // unicode minus U+2212
    }

    /**
     * Determine format string to represent step sufficiently accurate.
     */
    private format(step: number): (value: number) => string {
        const dynamic = -Math.floor(Math.log10(step));
        const decimals = Math.min(Math.max(0, dynamic), this.precision);
        
        return (value: number) => value.toFixed(decimals);
    }

    /**
     * Format `v` in compact exponential, stripping redundant elements
     * (pluses, leading and trailing zeros and decimal point, trailing `e`).
     */
    private compactExponential(v: number): string {
        // Format in exponential notation
        let str = v.toExponential(15);
        
        if (!str.includes("e")) {
            return str; // short number, inf, NaN, -inf
        }
        
        const [mantissaStr, exponentStr] = str.split("e");
        
        // Clean mantissa: remove trailing zeros and decimal point
        let mantissa = mantissaStr.replace(/\.?0+$/, "");
        
        // Clean exponent: remove leading plus and zeros
        const exponentSign = exponentStr[0] === "+" ? "" : exponentStr[0];
        const exponent = exponentStr.slice(1).replace(/^0+/, "") || "0";
        
        // Construct result, removing trailing 'e' if exponent is zero
        const result = `${mantissa}e${exponentSign}${exponent}`;
        return result.replace(/e0$/, "");
    }

    /**
     * Stringify `offset` and `magnitude`.
     * 
     * Expects the string to be shown top/left of the value it refers to.
     */
    prefix(offset: number, magnitude: number): string {
        let prefix = "";
        
        if (offset !== 0) {
            prefix += this.compactExponential(offset) + " + ";
        }
        
        if (magnitude !== 1) {
            prefix += this.compactExponential(magnitude) + " × ";
        }
        
        return this.fixMinus(prefix);
    }

    /**
     * Determine ticks, prefix and labels given the interval `[a, b[`.
     * 
     * Return tick values, prefix string to be shown to the left or
     * above the labels, and tick labels.
     */
    call(a: number, b: number): TickResult {
        const ticks = this.ticks(a, b);
        
        if (ticks.length === 0) {
            return { ticks: [], prefix: "", labels: [] };
        }
        
        const step = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
        const offset = this.offset(a, step);
        
        // Apply offset
        const t = ticks.map(tick => tick - offset);
        
        // Calculate magnitude
        const magnitude = this.magnitude(t[0], t[t.length - 1], step);
        
        // Apply magnitude scaling
        const tScaled = t.map(tick => tick / magnitude);
        
        // Generate prefix string
        const prefixStr = this.prefix(offset, magnitude);
        
        // Format labels
        const formatter = this.format(tScaled.length > 1 ? tScaled[1] - tScaled[0] : 1);
        const labels = tScaled.map(tick => this.fixMinus(formatter(tick)));
        
        return {
            ticks,
            prefix: prefixStr,
            labels
        };
    }
}