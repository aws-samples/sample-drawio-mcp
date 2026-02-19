// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file index.js - Custom Icon Example
 * @description Demonstrates how to use custom images (SVG and PNG) in diagrams
 */

import {
  DiagramEngine,
  setupGlobalMocks,
} from "../../dist/drawio-jsapi.esm.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup global mocks for Node.js environment
setupGlobalMocks();

// Read the SVG and PNG files
const svgContent = readFileSync(join(__dirname, "red-dot.svg"), "utf8");
const pngBuffer = readFileSync(join(__dirname, "blue-dot.png"));

// Create engine and API
const engine = new DiagramEngine();
engine.create();
const api = engine.api;

// Method 1: Using SVG content directly with insertImageVertex
const svgDataUri = api.createSvgDataUri(svgContent);
api.insertImageVertex({
  geometry: { x: 50, y: 50, width: 100, height: 100 },
  label: "SVG (insertImageVertex)",
  imageDataUri: svgDataUri,
});

// Method 2: Using PNG with createImageDataUri helper
const pngDataUri = api.createImageDataUri(pngBuffer, "image/png");
api.insertImageVertex({
  geometry: { x: 200, y: 50, width: 100, height: 100 },
  label: "PNG (insertImageVertex)",
  imageDataUri: pngDataUri,
});

// Method 3: Using insertVertex with manual style (SVG)
api.insertVertex({
  geometry: { x: 350, y: 50, width: 100, height: 100 },
  label: "SVG (insertVertex)",
  style: {
    shape: "image",
    image: svgDataUri,
    aspect: "fixed",
  },
});

// Method 4: Using insertVertex with style string (PNG)
api.insertVertex({
  geometry: { x: 500, y: 50, width: 100, height: 100 },
  label: "PNG (insertVertex)",
  style: `shape=image;image=${pngDataUri};aspect=fixed`,
});

// Method 5: Custom styling with shadow and opacity
api.insertImageVertex({
  geometry: { x: 125, y: 200, width: 100, height: 100 },
  label: "With Shadow",
  imageDataUri: svgDataUri,
  styleOverrides: {
    shadow: "1",
    opacity: "80",
  },
});

// Method 6: Without aspect ratio constraint
api.insertImageVertex({
  geometry: { x: 275, y: 200, width: 150, height: 80 },
  label: "Stretched",
  imageDataUri: pngDataUri,
  maintainAspect: false,
});

// Add title
api.insertVertex({
  geometry: { x: 200, y: 10, width: 250, height: 30 },
  label: "Custom Icon Examples",
  style: {
    fontSize: "18",
    fontStyle: "1",
    fillColor: "none",
    strokeColor: "none",
  },
});

// Save diagram
const xml = engine.toXml();
if (xml.success) {
  const outputDir = join(__dirname, "output");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = join(outputDir, "custom-icons.drawio");
  writeFileSync(outputPath, xml.data);
  console.log(`✓ Diagram saved to: ${outputPath}`);
} else {
  console.error("Failed to generate XML:", xml.error);
  process.exit(1);
}
