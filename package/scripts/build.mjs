// Produces the dist/ that package.json's exports point at — mirrors
// @boxworld/engine's build.mjs.
import esbuild from "esbuild";
import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

const outdir = "dist";
rmSync(outdir, { recursive: true, force: true });

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir,
  // Library, not an app — no environment assumptions. React is a peer
  // dependency, so it's marked external rather than bundled (a consumer's
  // own React instance is the one that must render this).
  platform: "neutral",
  format: "esm",
  sourcemap: true,
  external: ["react", "react/jsx-runtime"],
});
console.log(`Bundled to ${outdir}/`);

const tsc = spawnSync("npx", ["tsc", "-p", "tsconfig.build.json"], { stdio: "inherit" });
if (tsc.status !== 0) {
  console.error("Declaration build failed.");
  process.exit(tsc.status ?? 1);
}
console.log(`Declarations emitted to ${outdir}/`);
