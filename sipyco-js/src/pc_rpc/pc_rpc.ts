import * as pyon from "../pyon/pyon.js";
import * as net from "../net.js";

type BannerMessage = {
  targets: string[];
  description: null;
  features: string[];
};

type TargetMessage = pyon.Set<string>;

type RpcExceptionClass = "GenericRemoteException";

type RpcException = {
  class: RpcExceptionClass;
  message: string;
  traceback: string;
};

type RpcStatus = "ok" | "failed";

export interface MethodMessage<Return> {
  status: RpcStatus;
  ret: Return;
  exception?: RpcException;
}

type Params = {
  masterHostname: string;
  targetName: string;
  methodName: string;
  args?: unknown[];
  kwargs?: Record<string, unknown>;
  onError?: (err: string) => void;
};

type Phase = "banner" | "target" | "method";

type Context<Return> = {
  params: Params;
  chan: WebSocket;
  curr: Phase;
  resolve: (v: MethodMessage<Return> | undefined) => void;
};

type PhaseHandler = <Return>(data: string, context: Context<Return>) => void;

// see: https://git.m-labs.hk/M-Labs/artiq/src/branch/master/doc/manual/default_network_ports.rst
const port = 3251;

const banner = <Return>(data: string, ctx: Context<Return>) => {
  const msg = pyon.decode(data) as BannerMessage;

  if (!msg.targets.includes(ctx.params.targetName)) {
    ctx.params.onError?.(
      `pc_rpc target not found: "${ctx.params.targetName}". Custom port in use?`,
    );
    ctx.resolve(undefined);
    return;
  }

  if (!msg.features.includes("pyon_v2")) {
    ctx.params.onError?.(
      "pc_rpc: Missing PYON v2 support. Upgrade to ARTIQ-9 or newer.",
    );
    ctx.resolve(undefined);
    return;
  }

  ctx.curr = "target";
};

const target = <Return>(data: string, ctx: Context<Return>) => {
  const msg = pyon.decode(data) as TargetMessage;
  if (!msg.has(ctx.params.methodName)) {
    ctx.params.onError?.(
      `pc_rpc method not found: "${ctx.params.methodName}". Wrong target "${ctx.params.targetName}"?`,
    );
    ctx.resolve(undefined);
    return;
  }

  ctx.curr = "method";

  ctx.chan.send(
    pyon.encode({
      action: "call",
      name: ctx.params.methodName,
      args: ctx.params.args ?? [],
      kwargs: ctx.params.kwargs ?? {},
    }) + "\n",
  );
};

const method = <Return>(data: string, ctx: Context<Return>) => {
  const msg = pyon.decode(data) as MethodMessage<Return>;
  if (msg.status === "failed") {
    ctx.params.onError?.(`pc_rpc failed: ${JSON.stringify(msg.exception)}`);
    ctx.resolve(undefined);
    return;
  }

  ctx.resolve(msg);
  ctx.chan.close();
};

const phases: Record<Phase, PhaseHandler> = { banner, target, method };

export const from = <Return>(
  params: Params,
): Promise<MethodMessage<Return> | undefined> =>
  new Promise((resolve) => {
    const ctx: Context<Return> = {
      params,
      resolve,
      curr: "banner",
      chan: net.chan(
        params.masterHostname,
        port,
        "pc_rpc",
        `${params.targetName} pyon_v2`,
      ),
    };

    ctx.chan.addEventListener("message", (ev) =>
      phases[ctx.curr](ev.data, ctx),
    );
  });
