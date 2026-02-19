// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file layoutTools.js - Layout and alignment MCP tools
 * @description Tools for aligning, distributing, and arranging cells in diagrams.
 */

import { z } from "zod";
import * as logger from "../utils/logger.js";
import { getLayoutGuidanceText } from "../utils/layoutGuidance.js";
import * as layoutPatterns from "../utils/layoutPatterns.js";
import * as layoutOptimizer from "../utils/layoutOptimizer.js";

/**
 * Register layout and alignment tools with the MCP server.
 * @param {Object} server - MCP server instance
 * @param {Object} engine - DiagramEngine instance
 */
export function registerLayoutTools(server, engine) {
  // align_cells - Align multiple cells along an axis
  server.tool(
    "align_cells",
    "Align multiple cells along an axis (left, center, right, top, middle, bottom)",
    {
      cell_ids: z.array(z.string()).min(2).describe("IDs of cells to align"),
      alignment: z
        .enum(["left", "center", "right", "top", "middle", "bottom"])
        .describe("Alignment direction"),
    },
    async ({ cell_ids, alignment }) => {
      logger.debug("align_cells called", { cell_ids, alignment });

      if (!engine.isLoaded) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error:
                    "No diagram loaded. Use create_diagram or load_diagram first.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      try {
        // Get all cells and their geometries
        const cells = [];
        for (const id of cell_ids) {
          const result = engine.api.cells.getCell(id);
          if (result.success && result.data.geometry) {
            cells.push({ id, geometry: result.data.geometry });
          }
        }

        if (cells.length < 2) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error: "Need at least 2 cells with geometry to align",
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Calculate alignment target based on first cell (anchor)
        const anchor = cells[0].geometry;
        let target;

        switch (alignment) {
          case "left":
            target = Math.min(...cells.map((c) => c.geometry.x));
            for (const cell of cells) {
              engine.api.cells.updateCell({
                cellId: cell.id,
                geometry: { x: target },
              });
            }
            break;
          case "center":
            target = anchor.x + (anchor.width || 100) / 2;
            for (const cell of cells) {
              const width = cell.geometry.width || 100;
              engine.api.cells.updateCell({
                cellId: cell.id,
                geometry: { x: target - width / 2 },
              });
            }
            break;
          case "right":
            target = Math.max(
              ...cells.map((c) => c.geometry.x + (c.geometry.width || 100)),
            );
            for (const cell of cells) {
              const width = cell.geometry.width || 100;
              engine.api.cells.updateCell({
                cellId: cell.id,
                geometry: { x: target - width },
              });
            }
            break;
          case "top":
            target = Math.min(...cells.map((c) => c.geometry.y));
            for (const cell of cells) {
              engine.api.cells.updateCell({
                cellId: cell.id,
                geometry: { y: target },
              });
            }
            break;
          case "middle":
            target = anchor.y + (anchor.height || 50) / 2;
            for (const cell of cells) {
              const height = cell.geometry.height || 50;
              engine.api.cells.updateCell({
                cellId: cell.id,
                geometry: { y: target - height / 2 },
              });
            }
            break;
          case "bottom":
            target = Math.max(
              ...cells.map((c) => c.geometry.y + (c.geometry.height || 50)),
            );
            for (const cell of cells) {
              const height = cell.geometry.height || 50;
              engine.api.cells.updateCell({
                cellId: cell.id,
                geometry: { y: target - height },
              });
            }
            break;
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Aligned ${cells.length} cells to ${alignment}`,
                  aligned_cells: cell_ids,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: e.message },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // distribute_cells - Distribute cells evenly
  server.tool(
    "distribute_cells",
    "Distribute cells evenly along horizontal or vertical axis",
    {
      cell_ids: z
        .array(z.string())
        .min(3)
        .describe("IDs of cells to distribute (minimum 3)"),
      direction: z
        .enum(["horizontal", "vertical"])
        .describe("Distribution direction"),
      spacing: z
        .number()
        .optional()
        .describe("Fixed spacing between cells (auto-calculates if omitted)"),
    },
    async ({ cell_ids, direction, spacing }) => {
      logger.debug("distribute_cells called", { cell_ids, direction, spacing });

      if (!engine.isLoaded) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error:
                    "No diagram loaded. Use create_diagram or load_diagram first.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      try {
        // Get all cells and their geometries
        const cells = [];
        for (const id of cell_ids) {
          const result = engine.api.cells.getCell(id);
          if (result.success && result.data.geometry) {
            cells.push({ id, geometry: result.data.geometry });
          }
        }

        if (cells.length < 3) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error: "Need at least 3 cells with geometry to distribute",
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        if (direction === "horizontal") {
          // Sort by x position
          cells.sort((a, b) => a.geometry.x - b.geometry.x);

          const first = cells[0];
          const last = cells[cells.length - 1];

          if (spacing !== undefined) {
            // Use fixed spacing
            let currentX = first.geometry.x;
            for (let i = 0; i < cells.length; i++) {
              engine.api.cells.updateCell({
                cellId: cells[i].id,
                geometry: { x: currentX },
              });
              currentX += (cells[i].geometry.width || 100) + spacing;
            }
          } else {
            // Calculate even spacing
            const totalWidth =
              last.geometry.x + (last.geometry.width || 100) - first.geometry.x;
            const cellsWidth = cells.reduce(
              (sum, c) => sum + (c.geometry.width || 100),
              0,
            );
            const gap = (totalWidth - cellsWidth) / (cells.length - 1);

            let currentX = first.geometry.x;
            for (let i = 0; i < cells.length; i++) {
              engine.api.cells.updateCell({
                cellId: cells[i].id,
                geometry: { x: currentX },
              });
              currentX += (cells[i].geometry.width || 100) + gap;
            }
          }
        } else {
          // Sort by y position
          cells.sort((a, b) => a.geometry.y - b.geometry.y);

          const first = cells[0];
          const last = cells[cells.length - 1];

          if (spacing !== undefined) {
            // Use fixed spacing
            let currentY = first.geometry.y;
            for (let i = 0; i < cells.length; i++) {
              engine.api.cells.updateCell({
                cellId: cells[i].id,
                geometry: { y: currentY },
              });
              currentY += (cells[i].geometry.height || 50) + spacing;
            }
          } else {
            // Calculate even spacing
            const totalHeight =
              last.geometry.y + (last.geometry.height || 50) - first.geometry.y;
            const cellsHeight = cells.reduce(
              (sum, c) => sum + (c.geometry.height || 50),
              0,
            );
            const gap = (totalHeight - cellsHeight) / (cells.length - 1);

            let currentY = first.geometry.y;
            for (let i = 0; i < cells.length; i++) {
              engine.api.cells.updateCell({
                cellId: cells[i].id,
                geometry: { y: currentY },
              });
              currentY += (cells[i].geometry.height || 50) + gap;
            }
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Distributed ${cells.length} cells ${direction}ly`,
                  distributed_cells: cell_ids,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: e.message },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // snap_to_grid - Snap cells to a grid
  server.tool(
    "snap_to_grid",
    "Snap cell positions to a grid",
    {
      cell_ids: z
        .array(z.string())
        .optional()
        .describe("IDs of cells to snap (all cells if omitted)"),
      grid_size: z
        .number()
        .default(10)
        .describe("Grid size in pixels (default: 10)"),
    },
    async ({ cell_ids, grid_size = 10 }) => {
      logger.debug("snap_to_grid called", { cell_ids, grid_size });

      if (!engine.isLoaded) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error:
                    "No diagram loaded. Use create_diagram or load_diagram first.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      try {
        // Get cells to snap
        let cellsToSnap = cell_ids;
        if (!cellsToSnap || cellsToSnap.length === 0) {
          const allCells = engine.api.cells.getCells({ type: "vertices" });
          if (allCells.success) {
            cellsToSnap = allCells.data.map((c) => c.id);
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    { success: false, error: "Could not get cells" },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            };
          }
        }

        const snapped = [];
        for (const id of cellsToSnap) {
          const result = engine.api.cells.getCell(id);
          if (result.success && result.data.geometry) {
            const geo = result.data.geometry;
            const newX = Math.round(geo.x / grid_size) * grid_size;
            const newY = Math.round(geo.y / grid_size) * grid_size;

            if (newX !== geo.x || newY !== geo.y) {
              engine.api.cells.updateCell({
                cellId: id,
                geometry: { x: newX, y: newY },
              });
              snapped.push(id);
            }
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Snapped ${snapped.length} cells to ${grid_size}px grid`,
                  snapped_cells: snapped,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: e.message },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // auto_layout - Apply automatic layout algorithm
  server.tool(
    "auto_layout",
    "Apply automatic layout algorithm to arrange cells",
    {
      layout_type: z
        .enum(["horizontal", "vertical", "tree", "grid"])
        .describe("Layout algorithm type"),
      cell_ids: z
        .array(z.string())
        .optional()
        .describe("IDs of cells to layout (all vertices if omitted)"),
      spacing: z.number().default(50).describe("Spacing between cells"),
      start_x: z.number().default(50).describe("Starting X position"),
      start_y: z.number().default(50).describe("Starting Y position"),
    },
    async ({
      layout_type,
      cell_ids,
      spacing = 50,
      start_x = 50,
      start_y = 50,
    }) => {
      logger.debug("auto_layout called", {
        layout_type,
        cell_ids,
        spacing,
        start_x,
        start_y,
      });

      if (!engine.isLoaded) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error:
                    "No diagram loaded. Use create_diagram or load_diagram first.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      try {
        // Get cells to layout
        let cellsToLayout = [];
        if (cell_ids && cell_ids.length > 0) {
          for (const id of cell_ids) {
            const result = engine.api.cells.getCell(id);
            if (result.success && result.data.geometry) {
              cellsToLayout.push({ id, geometry: result.data.geometry });
            }
          }
        } else {
          const allCells = engine.api.cells.getCells({ type: "vertices" });
          if (allCells.success) {
            cellsToLayout = allCells.data
              .filter((c) => c.geometry)
              .map((c) => ({ id: c.id, geometry: c.geometry }));
          }
        }

        if (cellsToLayout.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: "No cells to layout" },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        switch (layout_type) {
          case "horizontal": {
            let currentX = start_x;
            for (const cell of cellsToLayout) {
              engine.api.cells.updateCell({
                cellId: cell.id,
                geometry: { x: currentX, y: start_y },
              });
              currentX += (cell.geometry.width || 100) + spacing;
            }
            break;
          }
          case "vertical": {
            let currentY = start_y;
            for (const cell of cellsToLayout) {
              engine.api.cells.updateCell({
                cellId: cell.id,
                geometry: { x: start_x, y: currentY },
              });
              currentY += (cell.geometry.height || 50) + spacing;
            }
            break;
          }
          case "grid": {
            const cols = Math.ceil(Math.sqrt(cellsToLayout.length));
            let row = 0;
            let col = 0;
            const maxWidth = Math.max(
              ...cellsToLayout.map((c) => c.geometry.width || 100),
            );
            const maxHeight = Math.max(
              ...cellsToLayout.map((c) => c.geometry.height || 50),
            );

            for (const cell of cellsToLayout) {
              const x = start_x + col * (maxWidth + spacing);
              const y = start_y + row * (maxHeight + spacing);
              engine.api.cells.updateCell({
                cellId: cell.id,
                geometry: { x, y },
              });

              col++;
              if (col >= cols) {
                col = 0;
                row++;
              }
            }
            break;
          }
          case "tree": {
            // Simple tree layout - assumes first cell is root
            const root = cellsToLayout[0];
            const children = cellsToLayout.slice(1);
            const childCount = children.length;

            // Position root at top center
            const totalChildWidth =
              childCount * ((children[0]?.geometry.width || 100) + spacing) -
              spacing;
            const rootX =
              start_x + totalChildWidth / 2 - (root.geometry.width || 100) / 2;
            engine.api.cells.updateCell({
              cellId: root.id,
              geometry: { x: rootX, y: start_y },
            });

            // Position children below
            let childX = start_x;
            const childY = start_y + (root.geometry.height || 50) + spacing * 2;
            for (const child of children) {
              engine.api.cells.updateCell({
                cellId: child.id,
                geometry: { x: childX, y: childY },
              });
              childX += (child.geometry.width || 100) + spacing;
            }
            break;
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Applied ${layout_type} layout to ${cellsToLayout.length} cells`,
                  layout_cells: cellsToLayout.map((c) => c.id),
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: e.message },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // get_layout_guidance - Get comprehensive layout guidance
  server.tool(
    "get_layout_guidance",
    "Get comprehensive layout guidance for planning and creating well-structured diagrams. " +
      "IMPORTANT: Call this tool BEFORE creating any diagram to understand best practices for " +
      "layout planning, grid-based positioning, pattern selection, and tool usage. " +
      "The guidance helps create balanced, presentation-ready diagrams with minimal overlaps.",
    {},
    async () => {
      logger.debug("get_layout_guidance called");

      try {
        const guidanceText = getLayoutGuidanceText();

        return {
          content: [
            {
              type: "text",
              text: guidanceText,
            },
          ],
        };
      } catch (error) {
        logger.error("Error getting layout guidance:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: `Failed to get layout guidance: ${error.message}`,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // plan_layout - Generate grid-based layout plan
  server.tool(
    "plan_layout",
    "Generate a grid-based layout plan with calculated coordinates for diagram elements. " +
      "This tool helps visualize and plan layouts before creating cells. " +
      "Returns a layout plan with pixel coordinates, connections, and a visual grid representation.",
    {
      elements: z
        .array(
          z.object({
            id: z.string().describe("Unique identifier for the element"),
            type: z
              .string()
              .optional()
              .describe("Element type (icon, label, group, etc.)"),
            label: z.string().optional().describe("Display label"),
          }),
        )
        .min(1)
        .describe("Array of elements to layout"),

      pattern: z
        .enum([
          "single-center",
          "dual-center",
          "triangle",
          "linear",
          "tree",
          "grid",
          "auto",
        ])
        .default("auto")
        .describe(
          "Layout pattern to use. 'auto' selects based on element count. " +
            "single-center: hub with satellites, dual-center: two balanced groups, " +
            "triangle: three centers, linear: sequential flow, tree: hierarchy, grid: uniform grid",
        ),

      grid_size: z
        .number()
        .min(6)
        .max(20)
        .default(10)
        .describe(
          "Grid size (6-20). Recommended: 8 for simple, 10 for medium, 12 for complex diagrams",
        ),

      spacing: z
        .number()
        .min(50)
        .max(200)
        .default(100)
        .describe(
          "Spacing between grid cells in pixels. 50=compact, 100=standard, 150=spacious",
        ),

      margin: z
        .number()
        .min(0)
        .max(100)
        .default(50)
        .describe("Margin from diagram edges in pixels"),

      main_groups: z
        .number()
        .min(1)
        .max(3)
        .optional()
        .describe(
          "Number of main groups/centers (1-3). Used for pattern auto-selection",
        ),

      has_hierarchy: z
        .boolean()
        .optional()
        .describe(
          "Whether elements have parent-child relationships. Used for pattern auto-selection",
        ),
    },
    async ({
      elements,
      pattern,
      grid_size,
      spacing,
      margin,
      main_groups,
      has_hierarchy,
    }) => {
      logger.debug("plan_layout called", {
        elementCount: elements.length,
        pattern,
        grid_size,
      });

      try {
        let selectedPattern = pattern;
        if (pattern === "auto") {
          selectedPattern = layoutPatterns.selectPattern(
            elements.length,
            has_hierarchy || false,
            main_groups || 1,
          );
        }

        let layoutPlan;
        const options = { gridSize: grid_size, spacing, margin };

        switch (selectedPattern) {
          case "single-center":
            layoutPlan = layoutPatterns.generateSingleCenterLayout(
              elements,
              options,
            );
            break;
          case "dual-center":
            layoutPlan = layoutPatterns.generateDualCenterLayout(
              elements,
              options,
            );
            break;
          case "triangle":
            layoutPlan = layoutPatterns.generateTriangleLayout(
              elements,
              options,
            );
            break;
          case "linear":
            layoutPlan = layoutPatterns.generateLinearLayout(elements, options);
            break;
          case "tree":
            layoutPlan = layoutPatterns.generateTreeLayout(elements, options);
            break;
          case "grid":
            layoutPlan = layoutPatterns.generateGridLayout(elements, options);
            break;
          default:
            throw new Error(`Unknown pattern: ${selectedPattern}`);
        }

        const gridViz = generateGridVisualization(layoutPlan, elements);

        const result = {
          success: true,
          pattern: layoutPlan.pattern,
          gridSize: layoutPlan.gridSize,
          spacing: layoutPlan.spacing,
          margin: layoutPlan.margin,
          elementCount: elements.length,
          coordinates: layoutPlan.coordinates,
          connections: layoutPlan.connections,
          gridVisualization: gridViz,
          nextSteps: [
            "Use the coordinates to create cells with insert_vertex or insert_aws_icon",
            "Use the connections to create edges with insert_edge",
            "Apply snap_to_grid for final alignment",
            "Run validate_diagram to check for issues",
          ],
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error planning layout:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: `Failed to plan layout: ${error.message}`,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // optimize_layout - Automatically improve existing layout
  server.tool(
    "optimize_layout",
    "Automatically improve an existing layout by reducing overlaps, balancing spacing, " +
      "and optionally minimizing edge crossings. This tool analyzes the current layout and " +
      "suggests or applies position adjustments to create a more balanced, professional appearance.",
    {
      cell_ids: z
        .array(z.string())
        .optional()
        .describe(
          "IDs of cells to optimize (defaults to all vertices if omitted)",
        ),

      strategy: z
        .enum(["resolve-overlaps", "balance-spacing", "force-directed", "auto"])
        .default("auto")
        .describe(
          "Optimization strategy. resolve-overlaps: fix overlapping cells, " +
            "balance-spacing: even distribution, force-directed: physics-based layout, " +
            "auto: apply all strategies",
        ),

      preserve_groups: z
        .boolean()
        .default(true)
        .describe("Keep grouped elements together during optimization"),

      target_spacing: z
        .number()
        .min(50)
        .max(300)
        .default(100)
        .describe("Target spacing between elements in pixels"),

      apply_changes: z
        .boolean()
        .default(false)
        .describe(
          "If true, apply changes immediately. If false, return suggestions only",
        ),

      snap_to_grid: z
        .boolean()
        .default(true)
        .describe("Snap optimized positions to grid after optimization"),

      grid_size: z
        .number()
        .default(10)
        .describe("Grid size for snapping (only used if snap_to_grid is true)"),
    },
    async ({
      cell_ids,
      strategy,
      preserve_groups,
      target_spacing,
      apply_changes,
      snap_to_grid,
      grid_size,
    }) => {
      logger.debug("optimize_layout called", {
        strategy,
        cellCount: cell_ids?.length || "all",
        apply_changes,
      });

      if (!engine.isLoaded) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error:
                    "No diagram loaded. Use create_diagram or load_diagram first.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      try {
        const allCellsResult = engine.api.cells.getCells({ type: "vertices" });
        if (!allCellsResult.success) {
          throw new Error("Failed to get cells");
        }

        let cellsToOptimize = allCellsResult.data;

        if (cell_ids && cell_ids.length > 0) {
          cellsToOptimize = cellsToOptimize.filter((c) =>
            cell_ids.includes(c.id),
          );
        }

        if (cellsToOptimize.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error: "No cells found to optimize",
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        if (preserve_groups) {
          cellsToOptimize = cellsToOptimize.filter((cell) => {
            const parentResult = engine.api.cells.getParent(cell.id);
            return (
              !parentResult.success ||
              !parentResult.data ||
              parentResult.data.id === "1"
            );
          });
        }

        let adjustments = [];
        const diagnostics = {
          initialOverlaps: 0,
          finalOverlaps: 0,
          spacingBefore: null,
          spacingAfter: null,
        };

        const initialOverlaps = layoutOptimizer.detectOverlaps(cellsToOptimize);
        diagnostics.initialOverlaps = initialOverlaps.length;
        diagnostics.spacingBefore =
          layoutOptimizer.analyzeSpacing(cellsToOptimize);

        if (strategy === "resolve-overlaps" || strategy === "auto") {
          const overlapAdjustments = layoutOptimizer.resolveOverlaps(
            cellsToOptimize,
            target_spacing / 5,
          );
          adjustments.push(...overlapAdjustments);
        }

        if (strategy === "balance-spacing" || strategy === "auto") {
          const balanceAdjustments = layoutOptimizer.balanceLayout(
            cellsToOptimize,
            target_spacing,
          );
          adjustments.push(...balanceAdjustments);
        }

        if (strategy === "force-directed") {
          const edgesResult = engine.api.cells.getCells({ type: "edges" });
          const edges = edgesResult.success
            ? edgesResult.data.map((e) => ({
                source: e.source,
                target: e.target,
              }))
            : [];

          const forceAdjustments = layoutOptimizer.optimizeWithForces(
            cellsToOptimize,
            edges,
            {
              iterations: 50,
              repulsionStrength: target_spacing * 10,
              attractionStrength: 0.1,
            },
          );
          adjustments = forceAdjustments;
        }

        const uniqueAdjustments = [];
        const seen = new Set();
        for (let i = adjustments.length - 1; i >= 0; i--) {
          if (!seen.has(adjustments[i].cellId)) {
            uniqueAdjustments.unshift(adjustments[i]);
            seen.add(adjustments[i].cellId);
          }
        }

        if (snap_to_grid) {
          uniqueAdjustments.forEach((adj) => {
            adj.newX = Math.round(adj.newX / grid_size) * grid_size;
            adj.newY = Math.round(adj.newY / grid_size) * grid_size;
          });
        }

        if (apply_changes && uniqueAdjustments.length > 0) {
          for (const adj of uniqueAdjustments) {
            const updateResult = engine.api.cells.updateCell({
              cellId: adj.cellId,
              geometry: {
                x: adj.newX,
                y: adj.newY,
              },
            });

            if (!updateResult.success) {
              logger.warn(
                `Failed to update cell ${adj.cellId}:`,
                updateResult.error,
              );
            }
          }

          const updatedCells = cellsToOptimize.map((cell) => {
            const adj = uniqueAdjustments.find((a) => a.cellId === cell.id);
            if (adj) {
              return {
                ...cell,
                geometry: {
                  ...cell.geometry,
                  x: adj.newX,
                  y: adj.newY,
                },
              };
            }
            return cell;
          });

          const finalOverlaps = layoutOptimizer.detectOverlaps(updatedCells);
          diagnostics.finalOverlaps = finalOverlaps.length;
          diagnostics.spacingAfter =
            layoutOptimizer.analyzeSpacing(updatedCells);
        }

        const result = {
          success: true,
          strategy,
          cellsOptimized: cellsToOptimize.length,
          adjustmentsGenerated: uniqueAdjustments.length,
          changesApplied: apply_changes,
          diagnostics,
          adjustments: uniqueAdjustments.map((adj) => ({
            cellId: adj.cellId,
            newPosition: { x: adj.newX, y: adj.newY },
          })),
          recommendations: [],
        };

        if (diagnostics.initialOverlaps > 0) {
          result.recommendations.push(
            `Found ${diagnostics.initialOverlaps} overlapping cell pairs. ` +
              (apply_changes
                ? "Resolved."
                : "Run with apply_changes=true to fix."),
          );
        }

        if (diagnostics.spacingBefore) {
          const spacing = diagnostics.spacingBefore;
          if (spacing.variance > target_spacing * target_spacing) {
            result.recommendations.push(
              `Spacing is uneven (variance: ${spacing.variance.toFixed(0)}). ` +
                "Consider using balance-spacing strategy.",
            );
          }
        }

        if (!apply_changes && uniqueAdjustments.length > 0) {
          result.recommendations.push(
            "Changes not applied. Set apply_changes=true to apply optimizations.",
          );
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error optimizing layout:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: `Failed to optimize layout: ${error.message}`,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );

  logger.info("Registered layout tools");
}

/**
 * Generate ASCII grid visualization of layout
 */
function generateGridVisualization(layoutPlan, elements) {
  const { gridSize, coordinates } = layoutPlan;

  const grid = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill("."));

  coordinates.forEach((coord, i) => {
    const col = Math.round((coord.x - layoutPlan.margin) / layoutPlan.spacing);
    const row = Math.round((coord.y - layoutPlan.margin) / layoutPlan.spacing);

    if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
      const marker = String.fromCharCode(65 + (i % 26));
      grid[row][col] = marker;
    }
  });

  let viz = "Grid Layout Visualization:\n";
  viz +=
    "   " +
    Array(gridSize)
      .fill(null)
      .map((_, i) => i)
      .join(" ") +
    "\n";
  grid.forEach((row, i) => {
    viz += `${i.toString().padStart(2)} ${row.join(" ")}\n`;
  });

  viz += "\nLegend:\n";
  coordinates.forEach((coord, i) => {
    const marker = String.fromCharCode(65 + (i % 26));
    const elem = elements[i];
    viz += `${marker} = ${elem.id}${elem.label ? ` (${elem.label})` : ""} at (${coord.x}, ${coord.y})\n`;
  });

  return viz;
}
