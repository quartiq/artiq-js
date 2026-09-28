type Params = [start: number, stop: number, step: number];
type Slice = Params;

export const fromMachine = (params: any[]): Slice => params as Slice;
export const toMachine = (data: any): Params => data as Params;

export const fromHuman = fromMachine;
export const toHuman = toMachine;

export const forPreview = (data: any): Slice => data as Slice;

export const copy = (src: any): Slice => [...src] as Slice;
