import * as sync_struct from "sipyco-js/sync_struct";

sync_struct.from({
  masterHostname: "localhost",
  notifierName: "schedule",
  onReceive: (store) => console.log(store.struct),
});
