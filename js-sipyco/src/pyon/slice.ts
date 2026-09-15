type Params = [ start: number, stop: number, step: number ];
type Slice = Params;

export let fromMachine = (params: any[]): Slice => params as Slice;
export let toMachine = (data: any): Params => data as Params;

export let fromHuman = fromMachine;
export let toHuman = toMachine;

export let forPreview = (data: any): Slice => data as Slice;

export let copy = (src: any): Slice => [ ...src ] as Slice;