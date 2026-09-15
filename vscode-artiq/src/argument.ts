import * as scan from "./scan.js";

export type Name = string;
export type State<P extends Procdesc> = P extends Scannable ? scan.ScanState : P["default"];
export type SubmitState<P extends Procdesc> = P extends Scannable ? scan.ScanObject : P["default"];

export type Argument<P extends Procdesc, S = State<P>> = [ procdesc: P, group: string, tooltip: string, state: S ];
export type SyncInfo<P extends Procdesc> = Record<Name, Argument<P>>;
export type SubmitInfo<P extends Procdesc> = Record<Name, SubmitState<P>>;
export type RowInfo<P extends Procdesc> = { name: Name, arg: Argument<P>, state: State<P> };

export let toSubmitInfo = <P extends Procdesc>(syncinfo: SyncInfo<P>): SubmitInfo<P> => {
    let entries = Object.entries(syncinfo).map(([k, v]) => {
		if (v[0].ty === "Scannable") return [k, v[3][v[3].selected]];
		return [k, v[3]];
	});
    return Object.fromEntries(entries);
};

export type Ty = string;

export interface Procdesc {
	ty: Ty,
	default: any,
}

export interface Boolean extends Procdesc {
	ty: "BooleanValue",
	default: boolean,
}

export interface Enum extends Procdesc {
	ty: "EnumerationValue",
	choices: any[],
	quickstyle: boolean,
}

export interface Number extends Procdesc {
	ty: "NumberValue",
	default: number,
	max: number,
	min: number,
	precision: number,
	scale: number,
	step: number,
	type: string,
	unit: string,
}

export interface Unixtime extends Procdesc {
	ty: "UnixtimeValue",
	default: number,
}

export interface PYON extends Procdesc {
	ty: "PYONValue",
}

export interface Scannable extends Procdesc {
	ty: "Scannable",
	default: scan.ScanObject[],
	global_max: number,
	global_min: number,
	global_step: number,
	precision: number,
	scale: number,
	unit: string,
}

export interface String extends Procdesc {
	ty: "StringValue",
	default: string,
}