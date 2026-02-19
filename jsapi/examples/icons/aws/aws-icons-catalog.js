#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
/**
 * @file aws-icons-catalog.js
 * @description Generates a comprehensive catalog of all AWS4 icons
 */

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";
import { DiagramEngine, setupGlobalMocks, AWS4_ICONS } from "drawio-jsapi";

setupGlobalMocks();

const __dirname = dirname(fileURLToPath(import.meta.url));

function main() {
  console.log("Creating AWS Icons Catalog...\n");

  const engine = new DiagramEngine();
  const result = engine.create({ name: "AWS Icons Catalog" });

  if (!result.success) {
    console.error("Failed to create diagram:", result.error);
    return;
  }

  const api = engine.api;

  // Diagram dimensions (8.5" wide = 612 points at 72 DPI)
  const pageWidth = 612;
  const iconSize = 78;
  const iconSpacing = 26;
  const categoryHeaderHeight = 40;
  const iconsPerRow = Math.floor(pageWidth / (iconSize + iconSpacing));
  const leftMargin =
    (pageWidth - (iconsPerRow * (iconSize + iconSpacing) - iconSpacing)) / 2;

  let currentY = 50;

  // Get all categories
  const categories = Object.keys(AWS4_ICONS);
  console.log(`Found ${categories.length} categories\n`);

  categories.forEach((categoryKey) => {
    const categoryIcons = AWS4_ICONS[categoryKey];
    const iconKeys = Object.keys(categoryIcons);

    console.log(`Category: ${categoryKey} (${iconKeys.length} icons)`);

    // Insert category header
    api.cells.insertVertex({
      id: `header-${categoryKey}`,
      label: categoryKey.toUpperCase(),
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

    // Calculate rows needed for this category
    const rows = Math.ceil(iconKeys.length / iconsPerRow);

    // Insert icons in grid
    iconKeys.forEach((iconKey, index) => {
      const iconDef = categoryIcons[iconKey];
      const row = Math.floor(index / iconsPerRow);
      const col = index % iconsPerRow;

      const x = leftMargin + col * (iconSize + iconSpacing);
      const y = currentY + row * (iconSize + iconSpacing);

      // Insert icon with built-in label
      api.cells.insertAwsIcon({
        id: `icon-${categoryKey}-${iconKey}`,
        icon: iconKey,
        category: categoryKey,
        label: iconDef.name,
        geometry: { x, y, width: iconSize, height: iconSize },
      });
    });

    currentY += rows * (iconSize + iconSpacing) + iconSpacing;
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
  const outputPath = join(outputDir, "aws-icons-catalog.drawio");

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
