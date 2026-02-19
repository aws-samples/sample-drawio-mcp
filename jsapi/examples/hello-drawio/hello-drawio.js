#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
/**
 * @file hello-drawio.js
 * @description Example script that creates a simple draw.io diagram using the DrawioAPI
 *
 * This demonstrates how to use the DrawioAPI programmatically in Node.js
 * to generate draw.io XML files.
 */

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";

// Import from drawio-jsapi package
import { DiagramEngine, setupGlobalMocks } from "drawio-jsapi";

// Setup global mocks (initializes mxConstants, mxUtils, etc. for Node.js)
setupGlobalMocks();

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================================
// Main Example: Create a simple flowchart using DrawioAPI
// ============================================================================

function main() {
  console.log("Creating a draw.io diagram using DrawioAPI...\n");

  // Create DiagramEngine - handles all setup and serialization
  const engine = new DiagramEngine();
  const result = engine.create({ name: "Hello Flowchart" });

  if (!result.success) {
    console.error("Failed to create diagram:", result.error);
    process.exit(1);
  }

  const api = engine.api;

  console.log("Diagram created:", result.data.name);
  console.log("");

  // -------------------------------------------------------------------------
  // Create flowchart nodes using the API
  // -------------------------------------------------------------------------

  console.log("Adding shapes...");

  // Start node (green ellipse)
  const start = api.cells.insertVertex({
    id: "start",
    label: "Start",
    geometry: { x: 365, y: 40, width: 120, height: 60 },
    style: {
      rounded: 1,
      whiteSpace: "wrap",
      html: 1,
      fillColor: "#d5e8d4",
      strokeColor: "#82b366",
      fontStyle: 1,
    },
  });
  console.log(`  - Created: Start (${start.data.id})`);

  // Input node (blue rectangle)
  const input = api.cells.insertVertex({
    id: "input",
    label: "Get User Input",
    geometry: { x: 365, y: 140, width: 120, height: 60 },
    style: {
      rounded: 0,
      whiteSpace: "wrap",
      html: 1,
      fillColor: "#dae8fc",
      strokeColor: "#6c8ebf",
    },
  });
  console.log(`  - Created: Get User Input (${input.data.id})`);

  // Decision node (yellow diamond)
  const validate = api.cells.insertVertex({
    id: "validate",
    label: "Valid?",
    geometry: { x: 375, y: 240, width: 100, height: 100 },
    style: {
      shape: "rhombus",
      whiteSpace: "wrap",
      html: 1,
      fillColor: "#fff2cc",
      strokeColor: "#d6b656",
    },
  });
  console.log(`  - Created: Valid? (${validate.data.id})`);

  // Process node (blue rectangle)
  const process = api.cells.insertVertex({
    id: "process",
    label: "Process Data",
    geometry: { x: 365, y: 390, width: 120, height: 60 },
    style: {
      rounded: 0,
      whiteSpace: "wrap",
      html: 1,
      fillColor: "#dae8fc",
      strokeColor: "#6c8ebf",
    },
  });
  console.log(`  - Created: Process Data (${process.data.id})`);

  // Error node (red rectangle)
  const error = api.cells.insertVertex({
    id: "error",
    label: "Show Error",
    geometry: { x: 545, y: 265, width: 120, height: 50 },
    style: {
      rounded: 0,
      whiteSpace: "wrap",
      html: 1,
      fillColor: "#f8cecc",
      strokeColor: "#b85450",
    },
  });
  console.log(`  - Created: Show Error (${error.data.id})`);

  // End node (green ellipse)
  const end = api.cells.insertVertex({
    id: "end",
    label: "End",
    geometry: { x: 365, y: 500, width: 120, height: 60 },
    style: {
      rounded: 1,
      whiteSpace: "wrap",
      html: 1,
      fillColor: "#d5e8d4",
      strokeColor: "#82b366",
      fontStyle: 1,
    },
  });
  console.log(`  - Created: End (${end.data.id})`);

  // -------------------------------------------------------------------------
  // Create connections using the API
  // -------------------------------------------------------------------------

  console.log("\nAdding connections...");

  const edgeStyle = {
    edgeStyle: "orthogonalEdgeStyle",
    rounded: 0,
    orthogonalLoop: 1,
    jettySize: "auto",
    html: 1,
    strokeColor: "#666666",
    strokeWidth: 2,
  };

  // Start -> Input
  const e1 = api.cells.insertEdge({
    sourceId: "start",
    targetId: "input",
    style: edgeStyle,
  });
  console.log(`  - Connected: Start -> Input (${e1.data.id})`);

  // Input -> Validate
  const e2 = api.cells.insertEdge({
    sourceId: "input",
    targetId: "validate",
    style: edgeStyle,
  });
  console.log(`  - Connected: Input -> Validate (${e2.data.id})`);

  // Validate -> Process (Yes)
  const e3 = api.cells.insertEdge({
    label: "Yes",
    sourceId: "validate",
    targetId: "process",
    style: edgeStyle,
  });
  console.log(`  - Connected: Validate -> Process [Yes] (${e3.data.id})`);

  // Validate -> Error (No)
  const e4 = api.cells.insertEdge({
    label: "No",
    sourceId: "validate",
    targetId: "error",
    style: { ...edgeStyle, exitX: 1, exitY: 0.5 },
  });
  console.log(`  - Connected: Validate -> Error [No] (${e4.data.id})`);

  // Error -> Input (loop back)
  const e5 = api.cells.insertEdge({
    sourceId: "error",
    targetId: "input",
    style: { ...edgeStyle, entryX: 1, entryY: 0.5 },
  });
  console.log(`  - Connected: Error -> Input (${e5.data.id})`);

  // Process -> End
  const e6 = api.cells.insertEdge({
    sourceId: "process",
    targetId: "end",
    style: edgeStyle,
  });
  console.log(`  - Connected: Process -> End (${e6.data.id})`);

  // -------------------------------------------------------------------------
  // Get diagram info
  // -------------------------------------------------------------------------

  console.log("\nDiagram Statistics:");
  const info = engine.getInfo();
  console.log(`  - Total cells: ${info.data.cellCount}`);
  console.log(`  - Vertices: ${info.data.vertexCount}`);
  console.log(`  - Edges: ${info.data.edgeCount}`);

  // -------------------------------------------------------------------------
  // Save to file using DiagramEngine
  // -------------------------------------------------------------------------

  console.log("\nExporting diagram...");

  const outputDir = join(__dirname, "output");
  const outputPath = join(outputDir, "hello-flowchart.drawio");

  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const saveResult = engine.saveToFile(outputPath);

  if (!saveResult.success) {
    console.error("Failed to save:", saveResult.error);
    return;
  }

  console.log(`\nDiagram saved to: ${outputPath}`);
  console.log("\nOpen the file with:");
  console.log("  - https://app.diagrams.net/");
  console.log("  - VS Code with Draw.io Integration extension");
  console.log("  - draw.io Desktop app");
}

// Run the example
main();
