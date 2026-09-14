import * as sync_struct from "sipyco/sync_struct";

let store = sync_struct.from({
    masterHostname: "localhost",
    notifierName: "schedule",
    onReceive: store => console.log(store.struct),
});