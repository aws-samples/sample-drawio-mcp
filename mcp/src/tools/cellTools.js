// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file cellTools.js - Cell manipulation MCP tools
 * @description Tools for inserting, updating, and removing cells (vertices and edges).
 */

import { z } from "zod";
import * as logger from "../utils/logger.js";

// Zod schemas for cell operations
const GeometrySchema = z.object({
  x: z.number().describe("X coordinate"),
  y: z.number().describe("Y coordinate"),
  width: z.number().optional().describe("Width (default: 100)"),
  height: z.number().optional().describe("Height (default: 50)"),
});

const PointSchema = z.object({
  x: z.number().describe("X coordinate"),
  y: z.number().describe("Y coordinate"),
});

const StyleObjectSchema = z
  .record(z.string(), z.union([z.string(), z.number()]))
  .optional();

/**
 * Register cell manipulation tools with the MCP server.
 * @param {Object} server - MCP server instance
 * @param {Object} engine - DiagramEngine instance
 */
export function registerCellTools(server, engine) {
  // insert_vertex - Insert a new vertex (shape)
  server.tool(
    "insert_vertex",
    "Insert a new vertex (shape) into the diagram",
    {
      id: z
        .string()
        .optional()
        .describe("Unique ID for the cell (auto-generated if not provided)"),
      label: z.string().optional().describe("Text label for the shape"),
      geometry: GeometrySchema.describe("Position and size of the shape"),
      style: z
        .union([z.string(), StyleObjectSchema])
        .optional()
        .describe("Style as string or object"),
      parent_id: z.string().optional().describe("Parent cell ID for grouping"),
    },
    async ({ id, label, geometry, style, parent_id }) => {
      logger.debug("insert_vertex called", {
        id,
        label,
        geometry,
        style,
        parent_id,
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

      const result = engine.api.cells.insertVertex({
        id,
        label,
        geometry,
        style,
        parentId: parent_id,
      });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Inserted vertex "${result.data.id}"`,
                  data: {
                    id: result.data.id,
                    label: result.data.label,
                    geometry: result.data.geometry,
                  },
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: false, error: result.error },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    },
  );

  // insert_edge - Insert a new edge (connection)
  server.tool(
    "insert_edge",
    "Insert a new edge (connection) between two vertices",
    {
      id: z
        .string()
        .optional()
        .describe("Unique ID for the edge (auto-generated if not provided)"),
      label: z.string().optional().describe("Text label for the edge"),
      source_id: z.string().describe("ID of the source vertex"),
      target_id: z.string().describe("ID of the target vertex"),
      style: z
        .union([z.string(), StyleObjectSchema])
        .optional()
        .describe("Style as string or object"),
      waypoints: z
        .array(PointSchema)
        .optional()
        .describe("Intermediate waypoints for the edge"),
    },
    async ({ id, label, source_id, target_id, style, waypoints }) => {
      logger.debug("insert_edge called", {
        id,
        label,
        source_id,
        target_id,
        style,
        waypoints,
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

      const result = engine.api.cells.insertEdge({
        id,
        label,
        sourceId: source_id,
        targetId: target_id,
        style,
        waypoints,
      });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Inserted edge "${result.data.id}"`,
                  data: {
                    id: result.data.id,
                    label: result.data.label,
                    sourceId: source_id,
                    targetId: target_id,
                  },
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: false, error: result.error },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    },
  );

  // update_cell - Update an existing cell
  server.tool(
    "update_cell",
    "Update properties of an existing cell (vertex or edge)",
    {
      id: z.string().describe("ID of the cell to update"),
      label: z.string().optional().describe("New text label"),
      geometry: GeometrySchema.optional().describe("New position and size"),
      style: z
        .union([z.string(), StyleObjectSchema])
        .optional()
        .describe("New style (replaces existing)"),
    },
    async ({ id, label, geometry, style }) => {
      logger.debug("update_cell called", { id, label, geometry, style });

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

      const result = engine.api.cells.updateCell({
        id,
        label,
        geometry,
        style,
      });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Updated cell "${id}"`,
                  data: result.data,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: false, error: result.error },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    },
  );

  // remove_cell - Remove a cell from the diagram
  server.tool(
    "remove_cell",
    "Remove a cell (and optionally its children) from the diagram",
    {
      id: z.string().describe("ID of the cell to remove"),
      remove_children: z
        .boolean()
        .optional()
        .describe("Also remove child cells (default: true)"),
    },
    async ({ id, remove_children }) => {
      logger.debug("remove_cell called", { id, remove_children });

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

      const result = engine.api.cells.removeCell({
        id,
        removeChildren: remove_children,
      });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Removed cell "${id}"`,
                  data: result.data,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: false, error: result.error },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    },
  );

  // get_cell - Get information about a specific cell
  server.tool(
    "get_cell",
    "Get information about a specific cell by ID",
    {
      id: z.string().describe("ID of the cell to retrieve"),
    },
    async ({ id }) => {
      logger.debug("get_cell called", { id });

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

      const result = engine.api.cells.getCell(id);

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  data: result.data,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: false, error: result.error },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    },
  );

  // get_cells - Get all cells or filter by type
  server.tool(
    "get_cells",
    "Get all cells in the diagram, optionally filtered by type",
    {
      type: z
        .enum(["all", "vertices", "edges"])
        .optional()
        .describe('Filter by cell type (default: "all")'),
    },
    async ({ type = "all" }) => {
      logger.debug("get_cells called", { type });

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

      let result;
      if (type === "vertices") {
        result = engine.api.cells.getVertices();
      } else if (type === "edges") {
        result = engine.api.cells.getEdges();
      } else {
        result = engine.api.cells.getAllCells();
      }

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  count: result.data.length,
                  data: result.data,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: false, error: result.error },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    },
  );

  // set_cell_style - Set or update cell style properties
  server.tool(
    "set_cell_style",
    "Set or update specific style properties on a cell",
    {
      id: z.string().describe("ID of the cell to style"),
      style: z
        .record(z.string(), z.union([z.string(), z.number()]))
        .describe("Style properties to set"),
    },
    async ({ id, style }) => {
      logger.debug("set_cell_style called", { id, style });

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

      const result = engine.api.styles.setStyle({ cellId: id, style });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Updated style for cell "${id}"`,
                  data: result.data,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: false, error: result.error },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    },
  );

  // move_cell - Move a cell to a new position
  server.tool(
    "move_cell",
    "Move a cell to a new position",
    {
      id: z.string().describe("ID of the cell to move"),
      x: z.number().describe("New X coordinate"),
      y: z.number().describe("New Y coordinate"),
    },
    async ({ id, x, y }) => {
      logger.debug("move_cell called", { id, x, y });

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

      const result = engine.api.cells.moveCell({ id, x, y });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Moved cell "${id}" to (${x}, ${y})`,
                  data: result.data,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: false, error: result.error },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    },
  );

  // resize_cell - Resize a cell
  server.tool(
    "resize_cell",
    "Resize a cell to new dimensions",
    {
      id: z.string().describe("ID of the cell to resize"),
      width: z.number().describe("New width"),
      height: z.number().describe("New height"),
    },
    async ({ id, width, height }) => {
      logger.debug("resize_cell called", { id, width, height });

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

      const result = engine.api.cells.resizeCell({ id, width, height });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Resized cell "${id}" to ${width}x${height}`,
                  data: result.data,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: false, error: result.error },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    },
  );

  // insert_image_vertex - Insert a vertex with a custom image
  server.tool(
    "insert_image_vertex",
    "Insert a vertex with a custom image (SVG or raster image). " +
      "This tool allows you to add custom icons to your diagram using base64-encoded images. " +
      "You can provide either an SVG string (which will be automatically converted to a data URI) " +
      "or a pre-encoded data URI for PNG/JPG images. " +
      "The image will be embedded directly in the diagram file, making it portable. " +
      "Use maintain_aspect=true (default) to preserve the image's aspect ratio.",
    {
      id: z
        .string()
        .optional()
        .describe("Unique ID for the cell (auto-generated if not provided)"),
      label: z
        .string()
        .optional()
        .describe("Text label displayed below the image"),
      geometry: GeometrySchema.describe(
        "Position and size of the image vertex",
      ),
      svg_content: z
        .string()
        .optional()
        .describe(
          'Raw SVG content as a string (e.g., "<svg>...</svg>"). ' +
            "If provided, this will be automatically base64-encoded and converted to a data URI. " +
            "Do not use this with image_data_uri.",
        ),
      image_data_uri: z
        .string()
        .optional()
        .describe(
          'Pre-encoded data URI for the image (e.g., "data:image/png;base64,iVBORw0KG..."). ' +
            "Use this for PNG, JPG, or pre-encoded SVG images. " +
            "Do not use this with svg_content.",
        ),
      maintain_aspect: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          "Whether to maintain the image aspect ratio (default: true). " +
            "When true, the image will scale proportionally within the specified geometry.",
        ),
      style_overrides: StyleObjectSchema.describe(
        'Additional style properties to apply (e.g., {"opacity": "50", "shadow": "1"})',
      ),
    },
    async ({
      id,
      label,
      geometry,
      svg_content,
      image_data_uri,
      maintain_aspect,
      style_overrides,
    }) => {
      logger.debug("insert_image_vertex called", {
        id,
        label,
        geometry,
        has_svg: !!svg_content,
        has_uri: !!image_data_uri,
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

      // Validate input
      if (!svg_content && !image_data_uri) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error:
                    "Either svg_content or image_data_uri must be provided",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      if (svg_content && image_data_uri) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error:
                    "Provide either svg_content or image_data_uri, not both",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      // Generate data URI
      let dataUri;
      if (svg_content) {
        dataUri = engine.api.createSvgDataUri(svg_content);
      } else {
        dataUri = image_data_uri;
      }

      const result = engine.api.insertImageVertex({
        id,
        label,
        geometry,
        imageDataUri: dataUri,
        maintainAspect: maintain_aspect,
        styleOverrides: style_overrides,
      });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Inserted image vertex "${result.data.id}"`,
                  data: {
                    id: result.data.id,
                    label: label || "",
                    geometry: geometry,
                    imageType: svg_content ? "svg" : "raster",
                  },
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: false, error: result.error },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    },
  );

  logger.info("Registered cell tools");
}
