// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file libraryTools.js - Library and shape catalog MCP tools
 * @description Tools for listing and searching shape libraries (AWS, Azure, GCP, basic).
 */

import { z } from "zod";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import * as logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lazy-load catalogs
let catalogs = null;

/**
 * Load all shape catalogs from JSON files.
 * @returns {Object} Catalog data
 */
function loadCatalogs() {
  if (catalogs) return catalogs;

  catalogs = {};
  const catalogDir = join(__dirname, "..", "catalogs");

  const catalogFiles = [
    "aws4.json",
    "azure.json",
    "gcp.json",
    "basic.json",
    "kubernetes.json",
  ];

  for (const file of catalogFiles) {
    try {
      const filePath = join(catalogDir, file);
      const data = JSON.parse(readFileSync(filePath, "utf8"));
      const name = file.replace(".json", "");
      catalogs[name] = data;
      logger.debug(`Loaded catalog: ${name}`, {
        categories: Object.keys(data.categories || {}).length,
      });
    } catch (e) {
      logger.warn(`Failed to load catalog: ${file}`, { error: e.message });
    }
  }

  return catalogs;
}

/**
 * Register library tools with the MCP server.
 * @param {Object} server - MCP server instance
 * @param {Object} engine - DiagramEngine instance
 */
export function registerLibraryTools(server, engine) {
  // list_libraries - List available shape libraries
  server.tool(
    "list_libraries",
    "List all available shape libraries (AWS4, Azure, GCP, Basic, Kubernetes)",
    {},
    async () => {
      logger.debug("list_libraries called");

      const cats = loadCatalogs();
      const libraries = Object.entries(cats).map(([name, data]) => ({
        name,
        displayName: data.displayName || name,
        description: data.description || "",
        categoryCount: Object.keys(data.categories || {}).length,
        shapeCount: Object.values(data.categories || {}).reduce(
          (sum, cat) => sum + (cat.shapes || []).length,
          0,
        ),
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                libraries,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // list_categories - List categories in a library
  server.tool(
    "list_categories",
    "List categories in a shape library",
    {
      library: z
        .enum(["aws4", "azure", "gcp", "basic", "kubernetes"])
        .describe("Library name"),
    },
    async ({ library }) => {
      logger.debug("list_categories called", { library });

      const cats = loadCatalogs();
      const lib = cats[library];

      if (!lib) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: `Library not found: ${library}` },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      const categories = Object.entries(lib.categories || {}).map(
        ([id, cat]) => ({
          id,
          name: cat.name || id,
          description: cat.description || "",
          shapeCount: (cat.shapes || []).length,
        }),
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                library: library,
                categories,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // list_shapes - List shapes in a category
  server.tool(
    "list_shapes",
    "List shapes in a library category",
    {
      library: z
        .enum(["aws4", "azure", "gcp", "basic", "kubernetes"])
        .describe("Library name"),
      category: z.string().describe("Category ID"),
    },
    async ({ library, category }) => {
      logger.debug("list_shapes called", { library, category });

      const cats = loadCatalogs();
      const lib = cats[library];

      if (!lib) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: `Library not found: ${library}` },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      const cat = lib.categories?.[category];
      if (!cat) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: `Category not found: ${category}`,
                  availableCategories: Object.keys(lib.categories || {}),
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      const shapes = (cat.shapes || []).map((shape) => ({
        id: shape.id,
        name: shape.name || shape.id,
        description: shape.description || "",
        style: shape.style,
        defaultSize: shape.defaultSize || { width: 78, height: 78 },
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                library,
                category,
                shapes,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // search_shapes - Search for shapes across libraries
  server.tool(
    "search_shapes",
    "Search for shapes by name or keyword across all libraries",
    {
      query: z
        .string()
        .describe("Search query (matches shape name, id, or description)"),
      library: z
        .enum(["aws4", "azure", "gcp", "basic", "kubernetes", "all"])
        .optional()
        .describe("Limit search to specific library (default: all)"),
    },
    async ({ query, library = "all" }) => {
      logger.debug("search_shapes called", { query, library });

      const cats = loadCatalogs();
      const queryLower = query.toLowerCase();
      const results = [];

      const librariesToSearch =
        library === "all" ? Object.keys(cats) : [library];

      for (const libName of librariesToSearch) {
        const lib = cats[libName];
        if (!lib) continue;

        for (const [catId, cat] of Object.entries(lib.categories || {})) {
          for (const shape of cat.shapes || []) {
            const nameMatch = (shape.name || shape.id || "")
              .toLowerCase()
              .includes(queryLower);
            const idMatch = (shape.id || "").toLowerCase().includes(queryLower);
            const descMatch = (shape.description || "")
              .toLowerCase()
              .includes(queryLower);

            if (nameMatch || idMatch || descMatch) {
              results.push({
                library: libName,
                category: catId,
                categoryName: cat.name || catId,
                id: shape.id,
                name: shape.name || shape.id,
                description: shape.description || "",
                style: shape.style,
                defaultSize: shape.defaultSize || { width: 78, height: 78 },
              });
            }
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
                query,
                resultCount: results.length,
                results: results.slice(0, 50), // Limit to 50 results
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // get_shape_style - Get the style string for a specific shape
  server.tool(
    "get_shape_style",
    "Get the complete style string for a specific shape",
    {
      library: z
        .enum(["aws4", "azure", "gcp", "basic", "kubernetes"])
        .describe("Library name"),
      shape_id: z.string().describe("Shape ID"),
    },
    async ({ library, shape_id }) => {
      logger.debug("get_shape_style called", { library, shape_id });

      const cats = loadCatalogs();
      const lib = cats[library];

      if (!lib) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: `Library not found: ${library}` },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      // Search all categories for the shape
      for (const [catId, cat] of Object.entries(lib.categories || {})) {
        const shape = (cat.shapes || []).find((s) => s.id === shape_id);
        if (shape) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    library,
                    category: catId,
                    shape: {
                      id: shape.id,
                      name: shape.name || shape.id,
                      style: shape.style,
                      defaultSize: shape.defaultSize || {
                        width: 78,
                        height: 78,
                      },
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: `Shape not found: ${shape_id} in library ${library}`,
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    },
  );

  // insert_library_shape - Insert a shape from a library
  server.tool(
    "insert_library_shape",
    "Insert a shape from a library into the diagram",
    {
      library: z
        .enum(["aws4", "azure", "gcp", "basic", "kubernetes"])
        .describe("Library name"),
      shape_id: z.string().describe("Shape ID from the library"),
      id: z.string().optional().describe("Custom ID for the cell"),
      label: z.string().optional().describe("Label for the shape"),
      x: z.number().describe("X coordinate"),
      y: z.number().describe("Y coordinate"),
      width: z
        .number()
        .optional()
        .describe("Width (uses default if not specified)"),
      height: z
        .number()
        .optional()
        .describe("Height (uses default if not specified)"),
      style_overrides: z
        .record(z.string(), z.union([z.string(), z.number()]))
        .optional()
        .describe("Style properties to override"),
    },
    async ({
      library,
      shape_id,
      id,
      label,
      x,
      y,
      width,
      height,
      style_overrides,
    }) => {
      logger.debug("insert_library_shape called", {
        library,
        shape_id,
        id,
        label,
        x,
        y,
        width,
        height,
        style_overrides,
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

      const cats = loadCatalogs();
      const lib = cats[library];

      if (!lib) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: `Library not found: ${library}` },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      // Find the shape
      let foundShape = null;
      for (const cat of Object.values(lib.categories || {})) {
        const shape = (cat.shapes || []).find((s) => s.id === shape_id);
        if (shape) {
          foundShape = shape;
          break;
        }
      }

      if (!foundShape) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: `Shape not found: ${shape_id} in library ${library}`,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      // Build the style
      let style = foundShape.style;
      if (style_overrides && Object.keys(style_overrides).length > 0) {
        // Append overrides to style string
        const overrideStr = Object.entries(style_overrides)
          .map(([k, v]) => `${k}=${v}`)
          .join(";");
        style = style.endsWith(";")
          ? style + overrideStr
          : style + ";" + overrideStr;
      }

      // Determine size
      const defaultSize = foundShape.defaultSize || { width: 78, height: 78 };
      const finalWidth = width || defaultSize.width;
      const finalHeight = height || defaultSize.height;

      // Insert the vertex
      const result = engine.api.cells.insertVertex({
        id,
        label: label || "",
        geometry: { x, y, width: finalWidth, height: finalHeight },
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
                  message: `Inserted ${library} shape "${shape_id}"`,
                  data: {
                    id: result.data.id,
                    library,
                    shape: shape_id,
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

  logger.info("Registered library tools");
}
