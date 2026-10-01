type Bytes = Uint8Array;
type Params = [base64: string];

export const fromMachine = ([base64]: any[]): Bytes =>
  Uint8Array.fromBase64(base64) as Bytes;

export const toMachine = (data: any): Params =>
  [(data as Bytes).toBase64()] as Params;

export const fromHuman = fromMachine;
export const toHuman = toMachine;

export const forPreview = (data: any): string => (data as Bytes).toHex();

export const copy = (src: any): Bytes => src.slice();
