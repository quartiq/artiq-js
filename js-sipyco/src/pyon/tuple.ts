type Tuple = any[];
type Params = [ tuple: Tuple ];

export let fromMachine = (params: any[]): Tuple => (params as Params)[0] as Tuple;
export let toMachine = (data: any): Params => [ data as Tuple ] as Params;

export let fromHuman = fromMachine;
export let toHuman = toMachine;

export let forPreview = (data: any): Tuple => data as Tuple;

export let copy = (src: any): Tuple => [ ...src ] as Tuple;

export let get = (tagged: any, key: any): any => (tagged as Tuple)[key];
export let set = (tagged: any, key: any, value: any) => (tagged as Tuple)[key] = value;
export let del = (tagged: any, key: any) => delete (tagged as Tuple)[key];