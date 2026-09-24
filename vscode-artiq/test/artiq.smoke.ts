import * as assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";

import "../src/proxy.js";
import * as pc_rpc from "js-sipyco/pc_rpc";
import * as datasets from "shared/datasets";

const timeout = setTimeout(() => {
  console.error("ARTIQ smoke test timed out");
  process.exit(1);
}, 15000);

async function main() {
  const store = await datasets.from({
    masterHostname: "127.0.0.1",
    onReceive: () => {},
  });

  const key = "ci.smoke";

  async function call(methodName: string, args: unknown[]) {
    const resp = await pc_rpc.from<null>({
      masterHostname: "127.0.0.1",
      targetName: "dataset_db",
      methodName,
      args,
      onError: (message) => console.error(message),
    });
    assert.equal(resp?.status, "ok");
  }
  async function waitFor(condition: () => boolean) {
    const deadline = Date.now() + 3000;
    while (!condition()) {
      assert.ok(Date.now() < deadline, "Dataset notification timed out");
      await sleep(20);
    }
  }

  for (const value of [42, 43]) {
    await call("set", [key, value]);
    await waitFor(() => store.struct.get(key)?.[1] === value);
  }

  await call("delete", [key]);
  await waitFor(() => !store.struct.has(key));

  console.log("ARTIQ dataset create/update/delete passed");
}

main().then(
  () => {
    clearTimeout(timeout);
    process.exit(0);
  },
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
