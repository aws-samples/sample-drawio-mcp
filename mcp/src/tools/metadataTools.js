// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file metadataTools.js - Cell metadata MCP tools
 * @description Tools for managing custom data, tooltips, and links on cells.
 */

import { z } from "zod";
import * as logger from "../utils/logger.js";

/**
 * Register metadata tools with the MCP server.
 * @param {Object} server - MCP server instance
 * @param {Object} engine - DiagramEngine instance
 */
export function registerMetadataTools(server, engine) {
  // set_cell_data - Set custom data attributes on a cell
  server.tool(
    "set_cell_data",
    "Set custom data attributes on a cell (key-value pairs stored in cell metadata)",
    {
      cell_id: z.string().describe("ID of the cell"),
      data: z
        .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
        .describe("Key-value pairs to set"),
    },
    async ({ cell_id, data }) => {
      logger.debug("set_cell_data called", { cell_id, data });

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
        // Verify cell exists
        const cellResult = engine.api.cells.getCell(cell_id);
        if (!cellResult.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: `Cell not found: ${cell_id}` },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Try to use the model to set custom data
        const model = engine.api.model;
        if (model) {
          const cell = model.getCell(cell_id);
          if (cell) {
            model.beginUpdate();
            try {
              // Initialize or update the cell's value with custom data
              if (!cell.value || typeof cell.value === "string") {
                // Convert string value to object with label and data
                const existingLabel = cell.value || "";
                cell.value = {
                  _label: existingLabel,
                  _customData: { ...data },
                };
              } else if (typeof cell.value === "object") {
                // Merge with existing data
                cell.value._customData = {
                  ...(cell.value._customData || {}),
                  ...data,
                };
              }
            } finally {
              model.endUpdate();
            }

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: true,
                      message: `Set ${Object.keys(data).length} data attributes on cell "${cell_id}"`,
                      cell_id,
                      data_set: Object.keys(data),
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
                { success: false, error: "Could not access cell model" },
                null,
                2,
              ),
            },
          ],
          isError: true,
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

  // get_cell_data - Get custom data attributes from a cell
  server.tool(
    "get_cell_data",
    "Get custom data attributes from a cell",
    {
      cell_id: z.string().describe("ID of the cell"),
      keys: z
        .array(z.string())
        .optional()
        .describe("Specific keys to retrieve (all if omitted)"),
    },
    async ({ cell_id, keys }) => {
      logger.debug("get_cell_data called", { cell_id, keys });

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
        // Verify cell exists
        const cellResult = engine.api.cells.getCell(cell_id);
        if (!cellResult.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: `Cell not found: ${cell_id}` },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Try to get custom data from the model
        const model = engine.api.model;
        let customData = {};

        if (model) {
          const cell = model.getCell(cell_id);
          if (
            cell &&
            cell.value &&
            typeof cell.value === "object" &&
            cell.value._customData
          ) {
            customData = cell.value._customData;
          }
        }

        // Filter by keys if specified
        if (keys && keys.length > 0) {
          const filtered = {};
          for (const key of keys) {
            if (key in customData) {
              filtered[key] = customData[key];
            }
          }
          customData = filtered;
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  cell_id,
                  data: customData,
                  keys_found: Object.keys(customData),
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

  // set_cell_tooltip - Set tooltip text for a cell
  server.tool(
    "set_cell_tooltip",
    "Set tooltip text that appears when hovering over a cell",
    {
      cell_id: z.string().describe("ID of the cell"),
      tooltip: z.string().describe("Tooltip text to display on hover"),
    },
    async ({ cell_id, tooltip }) => {
      logger.debug("set_cell_tooltip called", { cell_id, tooltip });

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
        // Verify cell exists
        const cellResult = engine.api.cells.getCell(cell_id);
        if (!cellResult.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: `Cell not found: ${cell_id}` },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Set tooltip via style (draw.io uses the 'tooltip' style property)
        const result = engine.api.styles.setStyle({
          cellId: cell_id,
          style: { tooltip },
        });

        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: `Set tooltip on cell "${cell_id}"`,
                    cell_id,
                    tooltip,
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
                {
                  success: false,
                  error: result.error || "Failed to set tooltip",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
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

  // set_cell_link - Set a clickable link on a cell
  server.tool(
    "set_cell_link",
    "Set a clickable URL link on a cell",
    {
      cell_id: z.string().describe("ID of the cell"),
      url: z.string().describe("URL to navigate to when cell is clicked"),
    },
    async ({ cell_id, url }) => {
      logger.debug("set_cell_link called", { cell_id, url });

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
        // Verify cell exists
        const cellResult = engine.api.cells.getCell(cell_id);
        if (!cellResult.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: `Cell not found: ${cell_id}` },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Set link via style (draw.io uses the 'link' style property)
        const result = engine.api.styles.setStyle({
          cellId: cell_id,
          style: { link: url },
        });

        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: `Set link on cell "${cell_id}"`,
                    cell_id,
                    url,
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
                { success: false, error: result.error || "Failed to set link" },
                null,
                2,
              ),
            },
          ],
          isError: true,
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

  // get_cell_link - Get the link from a cell
  server.tool(
    "get_cell_link",
    "Get the clickable link URL from a cell",
    {
      cell_id: z.string().describe("ID of the cell"),
    },
    async ({ cell_id }) => {
      logger.debug("get_cell_link called", { cell_id });

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
        // Get the cell's style
        const styleResult = engine.api.styles.getStyle(cell_id);
        if (!styleResult.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: `Cell not found: ${cell_id}` },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        const link = styleResult.data?.link || null;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  cell_id,
                  has_link: link !== null,
                  url: link,
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

  logger.info("Registered metadata tools");
}
