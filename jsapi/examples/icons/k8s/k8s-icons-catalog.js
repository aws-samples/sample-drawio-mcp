#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
/**
 * @file k8s-icons-catalog.js
 * @description Generates a comprehensive catalog of all Kubernetes icons
 */

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync, readFileSync } from "fs";
import { DiagramEngine, setupGlobalMocks } from "drawio-jsapi";

setupGlobalMocks();

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load Kubernetes catalog
const catalogPath = join(
  __dirname,
  "../../../../mcp/src/catalogs/kubernetes.json",
);
const K8S_CATALOG = JSON.parse(readFileSync(catalogPath, "utf8"));

function main() {
  console.log("Creating Kubernetes Icons Catalog...\n");

  const engine = new DiagramEngine();
  const result = engine.create({ name: "Kubernetes Icons Catalog" });

  if (!result.success) {
    console.error("Failed to create diagram:", result.error);
    return;
  }

  const api = engine.api;

  // Diagram dimensions (8.5" wide = 612 points at 72 DPI)
  const pageWidth = 612;
  const iconSize = 50;
  const iconSpacing = 36;
  const categoryHeaderHeight = 40;
  const iconsPerRow = Math.floor(pageWidth / (iconSize + iconSpacing));
  const leftMargin =
    (pageWidth - (iconsPerRow * (iconSize + iconSpacing) - iconSpacing)) / 2;

  let currentY = 50;

  // Get all categories
  const categories = Object.keys(K8S_CATALOG.categories);
  console.log(`Found ${categories.length} categories\n`);

  categories.forEach((categoryKey) => {
    const category = K8S_CATALOG.categories[categoryKey];
    const shapes = category.shapes;

    console.log(`Category: ${category.name} (${shapes.length} icons)`);

    // Insert category header
    api.cells.insertVertex({
      id: `header-${categoryKey}`,
      label: category.name.toUpperCase(),
      geometry: {
        x: leftMargin,
        y: currentY,
        width: pageWidth - leftMargin * 2,
        height: categoryHeaderHeight,
      },
      style: {
        fillColor: "#f5f5f5",
        strokeColor: "#666666",
        fontStyle: 1,
        fontSize: 16,
        align: "left",
        verticalAlign: "middle",
        spacingLeft: 10,
      },
    });

    currentY += categoryHeaderHeight + iconSpacing;

    // Insert icons in grid, with special handling for long names
    let currentRow = 0;
    let currentCol = 0;

    shapes.forEach((shape) => {
      // If name is too long (>12 chars), place on its own row
      const isLongName = shape.name.length > 12;

      if (isLongName && currentCol > 0) {
        // Move to next row if we're not at the start
        currentRow++;
        currentCol = 0;
      }

      const x = leftMargin + currentCol * (iconSize + iconSpacing);
      const y = currentY + currentRow * (iconSize + iconSpacing);

      // Insert icon with style from catalog
      api.cells.insertVertex({
        id: `icon-${categoryKey}-${shape.id}`,
        label: shape.name,
        geometry: {
          x,
          y,
          width: shape.defaultSize.width,
          height: shape.defaultSize.height,
        },
        style: shape.style,
      });

      // Update position for next icon
      if (isLongName) {
        // Long name takes full row, move to next row
        currentRow++;
        currentCol = 0;
      } else {
        currentCol++;
        if (currentCol >= iconsPerRow) {
          currentRow++;
          currentCol = 0;
        }
      }
    });

    // Calculate actual height used
    const actualRows = currentRow + (currentCol > 0 ? 1 : 0);
    currentY += actualRows * (iconSize + iconSpacing) + iconSpacing;
  });

  // Get diagram info
  const info = engine.getInfo();
  console.log("\nDiagram Statistics:");
  console.log(`  - Total cells: ${info.data.totalCells}`);
  console.log(`  - Vertices: ${info.data.vertices}`);
  console.log(`  - Diagram height: ${currentY} points`);

  // Save diagram
  console.log("\nExporting diagram...");

  const outputDir = join(__dirname, "output");
  const outputPath = join(outputDir, "k8s-icons-catalog.drawio");

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

main();
