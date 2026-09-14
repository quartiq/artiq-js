// TODO: move ws proxy towards artiq_ctlmgr?

import * as net from "node:net";
import * as http from "node:http";
import { WebSocketServer } from "ws";

let port = 1071; // FIXME: standardize proxy port via ARTIQ repo
let server = http.createServer();
let wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
    if (!req.url) {
        socket.destroy();
        return;
    }

    let [host, port] = req.url?.slice("/proxy/".length).split(":"); // FIXME: does not support IPv6
    let tcp = net.connect({ host, port: Number(port) });

    socket.on("close", () => tcp.destroy());
    socket.on("error", () => tcp.destroy());
    tcp.on("error", () => socket.destroy());

    tcp.once("connect", () => {
        if (socket.destroyed) {
            tcp.destroy();
            return;
        }

        wss.handleUpgrade(req, socket, head, ws => {
            ws.on("message", data => tcp.write(data.toString()));

            let buf = "";
            tcp.on("data", chunk => {
                buf += chunk.toString("utf8");
                let i: number;

                while ((i = buf.indexOf("\n")) !== -1) {
                    ws.send(buf.slice(0, i + 1));
                    buf = buf.slice(i + 1);
                }
            });

            ws.on("close", () => tcp.destroy());
            ws.on("error", () => tcp.destroy());
            tcp.on("close", () => ws.close());
        });
    });
});

server.listen(port);