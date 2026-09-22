import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
  files: "out/test/**/*.test.js",
  // when adding activation tests, restore dependency installation
  skipExtensionDependencies: true,
  launchArgs: ["--disable-gpu"],
});
