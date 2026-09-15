import equal from "fast-deep-equal";

export class Set<V = any> extends globalThis.Set<V> {
    // like Set, but Objects are compared by value, not by reference
    // inspired by Python set

    private find(value: V): V {
        if (typeof value !== "object") { return value; }

        for (let v of this.values()) {
            if (equal(v, value)) { return v; }
        }

        return value;
    }

    add(value: V): this {
        return super.add(this.find(value));
    }

    has(value: V): boolean {
        return super.has(this.find(value));
    }

    delete(value: V): boolean {
        return super.delete(this.find(value));
    }
}

type Params = [ set: any[] ];

export let fromMachine = (params: any[]): Set<any> => new Set((params as Params)[0]);
export let toMachine = (data: any): Params => [[ ...(data as Set<any>) ]] as Params;

export let fromHuman = fromMachine;
export let toHuman = toMachine;

export let forPreview = (data: any): any[] => [ ...(data as Set<any>) ];

export let copy = (src: any): Set<any> => new Set(src as Set<any>);