import * as broadcast from "js-sipyco/broadcast";
import { Dict } from "js-sipyco/pyon";

export type Name = string;
export type Command = string;
export type Code = string;
export type GroupEl = string;
export type Group = GroupEl[];

export const isGroup = (g: unknown): g is Group =>
  Array.isArray(g) && g.every((v) => typeof v === "string");

export type GroupKey = { group: Group };
export type AppletKey = GroupKey & { name: Name };
export type TargetKey = AppletKey | (GroupKey & { name: null });
export type CreateArgs = AppletKey & { command: Command; code: Code };

export const sameKey = (a: AppletKey, b: AppletKey): boolean => {
  const keys = new Dict<Partial<AppletKey>, true>();
  keys.set({ group: a.group, name: a.name }, true);
  return keys.has({ group: b.group, name: b.name });
};

// what "args" may consist of:
// { name: "code_applet_example", command: "code_applet_dataset", code: 'from PyQt6 import QtWidgets\n\nfrom artiq.applets.simple import SimpleApplet\n\n\nclass DemoWidget(QtWidgets.QLabel):\n    def __init__(self, args, ctl):\n        QtWidgets.QLabel.__init__(self)\n        self.dataset_name = args.dataset\n\n    def data_changed(self, value, metadata, persist, mods):\n        try:\n            n = str(value[self.dataset_name])\n        except (KeyError, ValueError, TypeError):\n            n = "---"\n        n = "<font size=15>" + n + "</font>"\n        self.setText(n)\n\n\ndef main():\n    applet = SimpleApplet(DemoWidget)\n    applet.add_dataset("dataset", "dataset to show")\n    applet.run()\n\nif __name__ == "__main__":\n    main()\n', group: "autoapplet" }
// { name: "flopping_f", command: "${artiq_applet}plot_xy flopping_f_brightness --x flopping_f_frequency --fit flopping_f_fit" }

type ArgTypes = {
  create_applet: [Name, Command, Group, string];
  restart_applet: [Name | null, Group];
  disable_applet: [Name | null, Group];
  disable_applet_group: [Group];
};

type KwargTypes = {
  create_applet: CreateArgs;
  restart_applet: TargetKey;
  disable_applet: TargetKey;
  disable_applet_group: GroupKey;
};

type ServiceName = keyof KwargTypes;

type Message<S extends ServiceName> = {
  service: S;
  args: ArgTypes[S];
  kwargs: KwargTypes[S];
};

const keyLists: { [K in ServiceName]: Array<keyof KwargTypes[K]> } = {
  create_applet: ["name", "command", "group", "code"],
  restart_applet: ["name", "group"],
  disable_applet: ["name", "group"],
  disable_applet_group: ["group"],
};

const normalize = <S extends ServiceName>(msg: Message<S>): KwargTypes[S] => {
  const keys = keyLists[msg.service] as (keyof KwargTypes[S])[];
  const args = msg.args.reduce((a, v, i) => ({ ...a, [keys[i]]: v }), {});

  const union: KwargTypes[S] = { ...args, ...msg.kwargs };
  if (!Object.hasOwn(union, "group")) union.group = [];
  if (union.group === null) union.group = [];
  if (typeof union.group === "string") union.group = [union.group];
  return union;
};

type HandleFuncs = {
  [S in ServiceName]: (args: KwargTypes[S]) => void;
};
let handlers: HandleFuncs;
export const handleFuncs = (funcs: HandleFuncs) => (handlers = funcs);

export const listen = () =>
  broadcast.subscribe<Message<ServiceName>>({
    masterHostname: "localhost",
    targetName: "ccb",
    onReceive: <S extends ServiceName>(msg: Message<S>) => {
      const handler = handlers[msg.service];
      if (!handler) {
        console.error(`applets: unknown ccb service "${msg.service}"`);
        return;
      }

      handler(normalize(msg));
    },
  });
