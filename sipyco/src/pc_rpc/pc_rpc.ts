import * as pyon from "../pyon/pyon.js";
import * as proxy from "../net.js";

type Error = string;

type BannerMessage = {
    targets: string[],
    description: null,
    features: string[],
};

type TargetMessage = Set<string>; // FIXME: refer to pyon.Set<string> instead

type RpcExceptionClass = "GenericRemoteException";

type RpcException = {
    class: RpcExceptionClass,
    message: string,
    traceback: string,
};

type RpcStatus = "ok" | "failed";
export interface MethodMessage {
    status: RpcStatus,
    ret: any,
    exception?: RpcException,
};

type Phase = "banner" | "target" | "method";

// see: https://git.m-labs.hk/M-Labs/artiq/src/branch/master/doc/manual/default_network_ports.rst
const port = 3251;

let handleBanner = (msg: BannerMessage, targetName: string): Error => {
    if (!msg.targets.includes(targetName)) {
        return `pc_rpc target not found: "${targetName}". Custom port in use?`;
    }

    if (!msg.features.includes("pyon_v2")) {
        return "pc_rpc: Missing PYON v2 support. Upgrade to ARTIQ-9 or newer.";
    }

    return "";
};

let handleTarget = (msg: TargetMessage, methodName: string, targetName: string): Error => {
    if (!msg.has(methodName)) {
        return `pc_rpc method not found: "${methodName}". Wrong target "${targetName}"?`;
    }

    return "";
};

let handleMethod = (msg: MethodMessage): Error => {
    if (msg.status === "failed") {
        return `pc_rpc failed: ${JSON.stringify(msg.exception)}`;
    }

    return "";
};


export let from = async (params: {
    masterHostname: string,
    targetName: string,
    methodName: string,
    args?: any[],
    kwargs?: Record<string, any>,
    onError?: (err: string) => void,

}): Promise<MethodMessage | undefined> => {
    let resolve: Function;
    let result: Promise<MethodMessage | undefined> = new Promise(r => resolve = r);
    let chan = proxy.chan(params.masterHostname, port, "pc_rpc", `${params.targetName} pyon_v2`);
    let phase: Phase = "banner";

    chan.addEventListener("message", ev => {
        let err: Error;

        switch (phase) {
            case "banner":
                err = handleBanner(pyon.decode(ev.data) as BannerMessage, params.targetName);
                if (err) {
                    params.onError?.(err);
                    resolve(undefined);
                    return;
                }

                phase = "target";
                break;

            case "target":
                err = handleTarget(pyon.decode(ev.data) as TargetMessage, params.methodName, params.targetName);
                if (err) {
                    params.onError?.(err);
                    resolve(undefined);
                    return;
                }

                phase = "method";
                chan.send(pyon.encode({
                    action: "call",
                    name: params.methodName,
                    args: params.args ?? [],
                    kwargs: params.kwargs ?? {},
                }) + "\n");
                break;

            case "method":
                let msg = pyon.decode(ev.data) as MethodMessage;
                err = handleMethod(msg);
                if (err) {
                    params.onError?.(err);
                    resolve(undefined);
                    return;
                }

                resolve(msg);
                chan.close();
                break;
        }
    });

    return result;
};