import * as permission from "./applets/permission";
import * as schedule from "./applets/schedule";
import * as ccb from "./applets/ccb";
import * as layout from "./applets/layout";
import * as manager from "./applets/manager";
import * as editor from "./applets/editor";
import * as template from "./applets/template";
import type { LeafNode } from "./applets/tree";

let activate = (leaf: LeafNode): void => {
    let [ applet, gridDefaults ] = template.fetch(leaf.command);
    let host = layout.newTemplateItem(leaf, gridDefaults);
    schedule.setup(leaf, applet, host);
};

let upsert = (args: ccb.CreateArgs, manually: boolean): void => {
    if (!manually && !permission.granted("create", args)) return;

    let leaf = manager.upsert(args);
    if (manually || permission.granted("visible", args))
        manager.setVisible(leaf, true);

    activate(leaf);
    manager.refresh();
};

let update = (args: ccb.CreateArgs): void => {
    let leaf = manager.upsert(args);
    activate(leaf);
    manager.refresh();
};

let move = (args: ccb.CreateArgs, old: LeafNode): void => {
    let leaf = manager.move(args, old);

    layout.remove(old);
    schedule.remove(old);

    activate(leaf);
    manager.refresh();
};

let setVisible = (k: ccb.TargetKey, visible: boolean) => {
    let leafs = permission.leafsByPolicy("visible", k);
    manager.setVisibleAll(leafs, visible);
    layout.updateVisibility(leafs);
    manager.refresh();
};

layout.init();

editor.handleFuncs({
    upsert: args => upsert(args, true),
    update,
    move,
});

manager.handleFuncs({
    updateVisibility: layout.updateVisibility,
    remove: leafs => leafs.forEach(l => {
        layout.remove(l);
        schedule.remove(l);
    }),
});

ccb.handleFuncs({
    create_applet: args => upsert(args, false),
    restart_applet: args => setVisible(args, true),
    disable_applet: args => setVisible(args, false),

    // legacy alias for calling disable_applet with name === null
    disable_applet_group: args => setVisible({ ...args, name: null }, false),
});

manager.init().forEach(leaf => activate(leaf));
layout.listen();

// changing workspace requires a clean restart
window.addEventListener("hashchange", () => window.location.reload());

// TODO: add loop-free sync between tabs displaying the same workspace
// one write must cause one refresh per peer without publishing another write

ccb.listen();