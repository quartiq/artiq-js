import * as sync_struct from "js-sipyco/sync_struct";

sync_struct.from({
  masterHostname: "localhost",
  notifierName: "schedule",
  onReceive: (store) => console.log(store.struct),
});
