// Zero-new-dependency test runner: compile tests/*.test.ts with esbuild,
// then run them with node's built-in test runner. Mirrors @boxworld/engine's
// scripts/test.mjs.
import esbuild from "esbuild";
import { readdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

const outdir = "dist-tests";
const entryPoints = readdirSync("tests")
  .filter((f) => f.endsWith(".test.ts"))
  .map((f) => `tests/${f}`);

rmSync(outdir, { recursive: true, force: true });
await esbuild.build({
  entryPoints,
  bundle: true,
  platform: "node",
  format: "esm",
  outdir,
  sourcemap: "inline",
});

const files = readdirSync(outdir)
  .filter((f) => f.endsWith(".test.js"))
  .map((f) => `${outdir}/${f}`);
const result = spawnSync("node", ["--test", "--enable-source-maps", ...files], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
