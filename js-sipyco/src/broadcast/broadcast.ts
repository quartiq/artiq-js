import * as pyon from "../pyon/pyon.js";
import * as proxy from "../net.js";

// see: https://git.m-labs.hk/M-Labs/artiq/src/branch/master/doc/manual/default_network_ports.rst
const port = 1067;

export const subscribe = (params: {
  masterHostname: string;
  targetName: string;
  onReceive: (msg: any) => void;
}) => {
  proxy.reconnect({
    open: () =>
      proxy.chan(params.masterHostname, port, "broadcast", params.targetName),
    onReceive: (msg) => params.onReceive(pyon.decode(msg)),
  });
};
