import { pluginLess } from "@rsbuild/plugin-less";
import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";
import tailwindcss from "tailwindcss";

const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  source: {
    entry: {
      index: ["./src/index.ts"],
    },
    define: {
      __DEV__: isDev,
    },
  },
  lib: [
    {
      bundle: true,
      dts: true,
      format: "esm",
    },
  ],
  output: {
    target: "web",
  },
  plugins: [
    pluginReact(), //
    pluginLess(),
  ],
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [tailwindcss],
      },
    },
  },
});
