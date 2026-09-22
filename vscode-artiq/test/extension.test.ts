import * as assert from "node:assert/strict";
import * as vscode from "vscode";

suite("ARTIQ extension", () => {
  test("is discoverable", () => {
    assert.ok(vscode.extensions.getExtension("quartiq.artiq"));
  });
});
