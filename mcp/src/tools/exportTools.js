// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file exportTools.js - Export and bounds MCP tools
 * @description Tools for exporting diagrams and calculating bounds.
 */

import { z } from "zod";
import * as logger from "../utils/logger.js";

/**
 * Register export and bounds tools with the MCP server.
 * @param {Object} server - MCP server instance
 * @param {Object} engine - DiagramEngine instance
 */
export function registerExportTools(server, engine) {
  // get_bounds - Get the bounding box of cells
  server.tool(
    "get_bounds",
    "Get the bounding box of one or more cells",
    {
      cell_ids: z
        .array(z.string())
        .optional()
        .describe("IDs of cells to get bounds for (all cells if omitted)"),
    },
    async ({ cell_ids }) => {
      logger.debug("get_bounds called", { cell_ids });

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
        // Get cells to measure
        let cells = [];
        if (cell_ids && cell_ids.length > 0) {
          for (const id of cell_ids) {
            const result = engine.api.cells.getCell(id);
            if (result.success && result.data.geometry) {
              cells.push(result.data);
            }
          }
        } else {
          const verticesResult = engine.api.cells.getCells({
            type: "vertices",
          });
          if (verticesResult.success) {
            cells = verticesResult.data.filter((c) => c.geometry);
          }
        }

        if (cells.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    bounds: null,
                    message: "No cells with geometry found",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        // Calculate bounding box
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const cell of cells) {
          const geo = cell.geometry;
          minX = Math.min(minX, geo.x);
          minY = Math.min(minY, geo.y);
          maxX = Math.max(maxX, geo.x + (geo.width || 100));
          maxY = Math.max(maxY, geo.y + (geo.height || 50));
        }

        const bounds = {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          right: maxX,
          bottom: maxY,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  cells_measured: cells.length,
                  bounds,
                  center: {
                    x: minX + bounds.width / 2,
                    y: minY + bounds.height / 2,
                  },
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

  // get_diagram_bounds - Get the overall diagram bounds
  server.tool(
    "get_diagram_bounds",
    "Get the overall bounding box of the entire diagram",
    {},
    async () => {
      logger.debug("get_diagram_bounds called");

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
        // Get all cells
        const allCellsResult = engine.api.cells.getCells();
        if (!allCellsResult.success) {
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

        const cells = allCellsResult.data.filter((c) => c.geometry);

        if (cells.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    bounds: null,
                    message: "Diagram is empty or has no cells with geometry",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        // Calculate bounding box
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const cell of cells) {
          const geo = cell.geometry;
          minX = Math.min(minX, geo.x);
          minY = Math.min(minY, geo.y);
          maxX = Math.max(maxX, geo.x + (geo.width || 100));
          maxY = Math.max(maxY, geo.y + (geo.height || 50));
        }

        const bounds = {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
        };

        // Count by type
        const vertices = allCellsResult.data.filter((c) => c.isVertex).length;
        const edges = allCellsResult.data.filter((c) => c.isEdge).length;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  bounds,
                  statistics: {
                    total_cells: allCellsResult.data.length,
                    vertices,
                    edges,
                    cells_with_geometry: cells.length,
                  },
                  recommended_canvas_size: {
                    width:
                      Math.ceil((bounds.width + bounds.x + 100) / 100) * 100,
                    height:
                      Math.ceil((bounds.height + bounds.y + 100) / 100) * 100,
                  },
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

  // center_diagram - Center all cells in the diagram
  server.tool(
    "center_diagram",
    "Center all cells in the diagram at a specified origin",
    {
      origin_x: z
        .number()
        .default(50)
        .describe("X coordinate for the diagram origin"),
      origin_y: z
        .number()
        .default(50)
        .describe("Y coordinate for the diagram origin"),
    },
    async ({ origin_x = 50, origin_y = 50 }) => {
      logger.debug("center_diagram called", { origin_x, origin_y });

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
        // Get all cells with geometry
        const allCellsResult = engine.api.cells.getCells();
        if (!allCellsResult.success) {
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

        const cells = allCellsResult.data.filter((c) => c.geometry);

        if (cells.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: "No cells to center",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        // Find current bounds
        let minX = Infinity;
        let minY = Infinity;

        for (const cell of cells) {
          minX = Math.min(minX, cell.geometry.x);
          minY = Math.min(minY, cell.geometry.y);
        }

        // Calculate offset to move cells to origin
        const offsetX = origin_x - minX;
        const offsetY = origin_y - minY;

        // Move all cells
        let movedCount = 0;
        for (const cell of cells) {
          const newX = cell.geometry.x + offsetX;
          const newY = cell.geometry.y + offsetY;
          const result = engine.api.cells.updateCell({
            cellId: cell.id,
            geometry: { x: newX, y: newY },
          });
          if (result.success) {
            movedCount++;
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Centered ${movedCount} cells at origin (${origin_x}, ${origin_y})`,
                  offset_applied: { x: offsetX, y: offsetY },
                  cells_moved: movedCount,
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

  // fit_cells_to_bounds - Scale/move cells to fit within bounds
  server.tool(
    "fit_cells_to_bounds",
    "Scale and position cells to fit within specified bounds",
    {
      target_bounds: z
        .object({
          x: z.number().describe("Target X origin"),
          y: z.number().describe("Target Y origin"),
          width: z.number().describe("Target width"),
          height: z.number().describe("Target height"),
        })
        .describe("Target bounds to fit cells within"),
      maintain_aspect_ratio: z
        .boolean()
        .default(true)
        .describe("Whether to maintain aspect ratio when scaling"),
      cell_ids: z
        .array(z.string())
        .optional()
        .describe("IDs of cells to fit (all cells if omitted)"),
    },
    async ({ target_bounds, maintain_aspect_ratio = true, cell_ids }) => {
      logger.debug("fit_cells_to_bounds called", {
        target_bounds,
        maintain_aspect_ratio,
        cell_ids,
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
        // Get cells to fit
        let cells = [];
        if (cell_ids && cell_ids.length > 0) {
          for (const id of cell_ids) {
            const result = engine.api.cells.getCell(id);
            if (result.success && result.data.geometry) {
              cells.push(result.data);
            }
          }
        } else {
          const allCellsResult = engine.api.cells.getCells();
          if (allCellsResult.success) {
            cells = allCellsResult.data.filter((c) => c.geometry);
          }
        }

        if (cells.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: "No cells to fit",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        // Calculate current bounds
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        for (const cell of cells) {
          const geo = cell.geometry;
          minX = Math.min(minX, geo.x);
          minY = Math.min(minY, geo.y);
          maxX = Math.max(maxX, geo.x + (geo.width || 100));
          maxY = Math.max(maxY, geo.y + (geo.height || 50));
        }

        const currentWidth = maxX - minX;
        const currentHeight = maxY - minY;

        // Calculate scale factors
        let scaleX = target_bounds.width / currentWidth;
        let scaleY = target_bounds.height / currentHeight;

        if (maintain_aspect_ratio) {
          const scale = Math.min(scaleX, scaleY);
          scaleX = scale;
          scaleY = scale;
        }

        // Transform each cell
        let transformedCount = 0;
        for (const cell of cells) {
          const geo = cell.geometry;
          const newX = target_bounds.x + (geo.x - minX) * scaleX;
          const newY = target_bounds.y + (geo.y - minY) * scaleY;
          const newWidth = (geo.width || 100) * scaleX;
          const newHeight = (geo.height || 50) * scaleY;

          const result = engine.api.cells.updateCell({
            cellId: cell.id,
            geometry: { x: newX, y: newY, width: newWidth, height: newHeight },
          });
          if (result.success) {
            transformedCount++;
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Fitted ${transformedCount} cells to target bounds`,
                  original_bounds: {
                    x: minX,
                    y: minY,
                    width: currentWidth,
                    height: currentHeight,
                  },
                  target_bounds,
                  scale_applied: { x: scaleX, y: scaleY },
                  cells_transformed: transformedCount,
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

  logger.info("Registered export tools");
}
