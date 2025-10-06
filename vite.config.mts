import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { livestoreDevtoolsPlugin } from "@livestore/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";

const shellDir = (...path: string[]) => resolve(fileURLToPath(import.meta.url), "..", ...path);

export default defineConfig((env) => ({
  appType: "spa",
  root: "./src",
  publicDir: "./public",
  server: {
    port: 5091,
  },
  esbuild: {
    target: ["esnext", "chrome115", "firefox120", "safari16"],
    format: "esm",
    platform: "browser",
  },
  optimizeDeps: {
    exclude: ["@livestore/wa-sqlite"],
  },
  plugins: [
    tanstackRouter({
      routesDirectory: shellDir("src/routes"),
      generatedRouteTree: shellDir("src/routeTree.gen.ts"),
    }),
    viteReact(),
    tsconfigPaths(),
    wasm(),
    topLevelAwait(),
    env.mode === "development" &&
      livestoreDevtoolsPlugin({
        schemaPath: shellDir("src/livestore/schema.ts"),
      }),
  ],
  build: {
    target: ["chrome115", "firefox120", "safari16"],
    sourcemap: true,
    emptyOutDir: true,
    outDir: "../build",
  },
}));
