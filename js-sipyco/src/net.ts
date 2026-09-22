const proxyPort = 1071; // FIXME: standardize this port via ARTIQ repo

export const chan = (
  host: string,
  port: number,
  banner: string,
  target: string,
) => {
  const ws = new WebSocket(`ws://${host}:${proxyPort}/proxy/${host}:${port}`);

  ws.addEventListener("open", () => {
    // see: https://git.m-labs.hk/M-Labs/sipyco/src/branch/master/sipyco/sync_struct.py
    // and: https://git.m-labs.hk/M-Labs/sipyco/src/branch/master/sipyco/pc_rpc.py
    ws.send(`ARTIQ ${banner}\n`);
    ws.send(`${target}\n`);
  });

  return ws;
};

type Stop = () => void;
type ConnectionState = "connecting" | "connected" | "failed";

interface Events extends EventTarget {
  addEventListener(
    type: "change",
    listener: (ev: CustomEvent<ConnectionState>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
}

const delayMin = 1000;
const delayMax = 30_000;
const connections = new Map<symbol, ConnectionState>();

export const events = new EventTarget() as Events;

const writeSingleState = (id: symbol, state?: ConnectionState) =>
  state === undefined ? connections.delete(id) : connections.set(id, state);

const readGlobalState = (): ConnectionState => {
  const states = [...connections.values()];
  if (states.some((s) => s === "failed")) return "failed";
  if (states.length > 0 && states.every((s) => s === "connected"))
    return "connected";
  return "connecting";
};

let previous: ConnectionState | undefined;

const status = (id: symbol, state?: ConnectionState): void => {
  writeSingleState(id, state);
  const current = readGlobalState();
  if (current === previous) return;

  previous = current;
  events.dispatchEvent(
    new CustomEvent<ConnectionState>("change", { detail: current }),
  );
};

export const reconnect = (params: {
  open: () => WebSocket;
  onReceive: (msg: any) => void;
  onClose?: (err: string) => void;
}): Stop => {
  const id = Symbol();
  let active = true;
  let delay = delayMin;
  let timeoutID: ReturnType<typeof setTimeout> | undefined;
  let ch: WebSocket;

  const connect = (): void => {
    ch = params.open();

    ch.addEventListener("open", () => active && status(id, "connected"));

    ch.addEventListener("message", (ev) => {
      params.onReceive(ev.data);
      delay = delayMin;
    });

    ch.addEventListener("close", (ev) => {
      if (!active) return;

      status(id, "failed");
      params.onClose?.(ev.reason);
      timeoutID = globalThis.setTimeout(connect, delay);
      delay = Math.min(delay * 2, delayMax);
    });
  };

  status(id, "connecting");
  connect();

  return () => {
    active = false;
    if (timeoutID !== undefined) globalThis.clearTimeout(timeoutID);
    status(id);
    ch.close();
  };
};
