// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file rollup.config.js - Rollup build configuration for drawio-jsapi
 */

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const input = "src/index.ts";
const external = ["fs", "@xmldom/xmldom", "pako"];

export default [
  // ESM build for Node.js and modern bundlers
  {
    input,
    output: {
      file: "dist/drawio-jsapi.esm.js",
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
    external,
  },

  // CommonJS build for older Node.js environments
  {
    input,
    output: {
      file: "dist/drawio-jsapi.cjs.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
    external,
  },

  // Minified UMD build for browsers
  {
    input,
    output: {
      file: "dist/drawio-jsapi.min.js",
      format: "umd",
      name: "DrawioJSAPI",
      sourcemap: true,
      globals: {
        "@xmldom/xmldom": "xmldom",
        pako: "pako",
        fs: "fs",
      },
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
    ],
    external: ["fs", "@xmldom/xmldom", "pako"],
  },

  // Type declarations bundle
  {
    input: "dist/types/index.d.ts",
    output: {
      file: "dist/drawio-jsapi.d.ts",
      format: "esm",
    },
    plugins: [
      dts({
        respectExternal: true,
        compilerOptions: {
          preserveSymlinks: false,
        },
      }),
    ],
    external: [/\.css$/, /globalMocks/],
  },
];
