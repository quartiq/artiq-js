import * as sync_struct from "sipyco-js/sync_struct";

const store = sync_struct.from({
  masterHostname: "localhost",
  notifierName: "schedule",
  onReceive: async () => console.log((await store).struct),
}).store;
