// see: https://code.visualstudio.com/api/working-with-extensions/bundling-extension#run-esbuild

const esbuild = require("esbuild");
const glob = require("glob");
const fs = require("fs");
const path = require("path");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

const cssFiles = [
  [ "node_modules/tabulator-tables/dist/css", "tabulator.min.css" ],
  [ "src/webviews", "main.css" ],
];

const copyCSS = (subpath, filename) => {
  const src = path.join(__dirname, subpath, filename);
  const dest = path.join(__dirname, "dist/webviews", filename);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);

  console.log(`Copied: ${src} → ${dest}`);
};

async function main() {
  const coreCtx = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "node",
    outfile: "dist/extension.js",
    external: [ "vscode" ],
    logLevel: "warning",
    plugins: [ esbuildProblemMatcherPlugin ],
  });

  const webviewCtx = await esbuild.context({
    entryPoints: glob.sync("src/webviews/*.ts"),
    bundle: true,
    format: "esm",
    minify: production,
    sourcemap: !production,
    platform: "browser",
    outdir: "dist/webviews",
    external: [ "vscode" ],
    logLevel: "warning",
    plugins: [ esbuildProblemMatcherPlugin ],
  });

  cssFiles.forEach(([subpath, filename]) => copyCSS(subpath, filename));

  if (watch) {
    await Promise.all([ coreCtx.watch(), webviewCtx.watch() ]);
    cssFiles.forEach(([subpath, filename]) => {
      const src = path.join(__dirname, subpath, filename);
      fs.watch(src, ev => {
        if (ev !== "change") { return; }
        console.log(`CSS changed: ${src}`);
        copyCSS(subpath, filename);
      });
    });
  } else {
    await Promise.all([ coreCtx.rebuild(), webviewCtx.rebuild() ]);
    await Promise.all([ coreCtx.dispose(), webviewCtx.dispose() ]);
  }
}

/**
 * @type {import("esbuild").Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",

  setup(build) {
    build.onStart(() => {
      console.log("[watch] build started");
    });
    build.onEnd(result => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        if (location === null) { return; }
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log("[watch] build finished");
    });
  }
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});