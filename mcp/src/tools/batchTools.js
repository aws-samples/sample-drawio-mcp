// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file batchTools.js - Batch operation MCP tools
 * @description Tools for performing bulk operations on multiple cells efficiently.
 */

import { z } from "zod";
import * as logger from "../utils/logger.js";

const GeometrySchema = z.object({
  x: z.number().describe("X coordinate"),
  y: z.number().describe("Y coordinate"),
  width: z.number().optional().describe("Width (default: 100)"),
  height: z.number().optional().describe("Height (default: 50)"),
});

const StyleObjectSchema = z
  .record(z.string(), z.union([z.string(), z.number()]))
  .optional();

const VertexDefinitionSchema = z.object({
  id: z.string().optional().describe("Unique ID (auto-generated if omitted)"),
  label: z.string().optional().describe("Text label for the shape"),
  geometry: GeometrySchema.describe("Position and size"),
  style: z
    .union([z.string(), StyleObjectSchema])
    .optional()
    .describe("Style string or object"),
  parent_id: z.string().optional().describe("Parent cell ID for grouping"),
});

const EdgeDefinitionSchema = z.object({
  id: z.string().optional().describe("Unique ID (auto-generated if omitted)"),
  label: z.string().optional().describe("Text label for the edge"),
  source_id: z.string().describe("Source vertex ID"),
  target_id: z.string().describe("Target vertex ID"),
  style: z
    .union([z.string(), StyleObjectSchema])
    .optional()
    .describe("Style string or object"),
  waypoints: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
      }),
    )
    .optional()
    .describe("Intermediate waypoints"),
});

const CellUpdateSchema = z.object({
  cell_id: z.string().describe("ID of the cell to update"),
  label: z.string().optional().describe("New label"),
  geometry: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional()
    .describe("New geometry (partial update)"),
  style: StyleObjectSchema.describe("Style properties to update"),
});

/**
 * Register batch operation tools with the MCP server.
 * @param {Object} server - MCP server instance
 * @param {Object} engine - DiagramEngine instance
 */
export function registerBatchTools(server, engine) {
  // batch_insert_vertices - Insert multiple vertices in one operation
  server.tool(
    "batch_insert_vertices",
    "Insert multiple vertices/shapes in a single batch operation",
    {
      vertices: z
        .array(VertexDefinitionSchema)
        .min(1)
        .describe("Array of vertex definitions to insert"),
    },
    async ({ vertices }) => {
      logger.debug("batch_insert_vertices called", { count: vertices.length });

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

      const results = [];
      const errors = [];

      for (const vertex of vertices) {
        try {
          const result = engine.api.cells.insertVertex({
            id: vertex.id,
            label: vertex.label,
            geometry: vertex.geometry,
            style: vertex.style,
            parentId: vertex.parent_id,
          });

          if (result.success) {
            results.push(result.data);
          } else {
            errors.push({ vertex, error: result.error });
          }
        } catch (e) {
          errors.push({ vertex, error: e.message });
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: errors.length === 0,
                message: `Inserted ${results.length} vertices${errors.length > 0 ? `, ${errors.length} failed` : ""}`,
                inserted: results,
                errors: errors.length > 0 ? errors : undefined,
              },
              null,
              2,
            ),
          },
        ],
        isError: errors.length > 0 && results.length === 0,
      };
    },
  );

  // batch_insert_edges - Insert multiple edges in one operation
  server.tool(
    "batch_insert_edges",
    "Insert multiple edges/connections in a single batch operation",
    {
      edges: z
        .array(EdgeDefinitionSchema)
        .min(1)
        .describe("Array of edge definitions to insert"),
    },
    async ({ edges }) => {
      logger.debug("batch_insert_edges called", { count: edges.length });

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

      const results = [];
      const errors = [];

      for (const edge of edges) {
        try {
          const result = engine.api.cells.insertEdge({
            id: edge.id,
            label: edge.label,
            sourceId: edge.source_id,
            targetId: edge.target_id,
            style: edge.style,
            waypoints: edge.waypoints,
          });

          if (result.success) {
            results.push(result.data);
          } else {
            errors.push({ edge, error: result.error });
          }
        } catch (e) {
          errors.push({ edge, error: e.message });
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: errors.length === 0,
                message: `Inserted ${results.length} edges${errors.length > 0 ? `, ${errors.length} failed` : ""}`,
                inserted: results,
                errors: errors.length > 0 ? errors : undefined,
              },
              null,
              2,
            ),
          },
        ],
        isError: errors.length > 0 && results.length === 0,
      };
    },
  );

  // batch_update_cells - Update multiple cells in one operation
  server.tool(
    "batch_update_cells",
    "Update multiple cells (labels, geometry, styles) in a single batch operation",
    {
      updates: z
        .array(CellUpdateSchema)
        .min(1)
        .describe("Array of cell updates to apply"),
    },
    async ({ updates }) => {
      logger.debug("batch_update_cells called", { count: updates.length });

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

      const results = [];
      const errors = [];

      for (const update of updates) {
        try {
          const result = engine.api.cells.updateCell({
            cellId: update.cell_id,
            label: update.label,
            geometry: update.geometry,
            style: update.style,
          });

          if (result.success) {
            results.push({ cell_id: update.cell_id, updated: true });
          } else {
            errors.push({ cell_id: update.cell_id, error: result.error });
          }
        } catch (e) {
          errors.push({ cell_id: update.cell_id, error: e.message });
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: errors.length === 0,
                message: `Updated ${results.length} cells${errors.length > 0 ? `, ${errors.length} failed` : ""}`,
                updated: results,
                errors: errors.length > 0 ? errors : undefined,
              },
              null,
              2,
            ),
          },
        ],
        isError: errors.length > 0 && results.length === 0,
      };
    },
  );

  // batch_remove_cells - Remove multiple cells in one operation
  server.tool(
    "batch_remove_cells",
    "Remove multiple cells in a single batch operation",
    {
      cell_ids: z
        .array(z.string())
        .min(1)
        .describe("Array of cell IDs to remove"),
    },
    async ({ cell_ids }) => {
      logger.debug("batch_remove_cells called", { count: cell_ids.length });

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

      const results = [];
      const errors = [];

      for (const cellId of cell_ids) {
        try {
          const result = engine.api.cells.removeCell(cellId);

          if (result.success) {
            results.push(cellId);
          } else {
            errors.push({ cell_id: cellId, error: result.error });
          }
        } catch (e) {
          errors.push({ cell_id: cellId, error: e.message });
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: errors.length === 0,
                message: `Removed ${results.length} cells${errors.length > 0 ? `, ${errors.length} failed` : ""}`,
                removed: results,
                errors: errors.length > 0 ? errors : undefined,
              },
              null,
              2,
            ),
          },
        ],
        isError: errors.length > 0 && results.length === 0,
      };
    },
  );

  logger.info("Registered batch tools");
}
