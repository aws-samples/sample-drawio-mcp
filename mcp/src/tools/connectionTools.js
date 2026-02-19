// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file connectionTools.js - Connection enhancement MCP tools
 * @description Tools for managing cell connections and edge waypoints.
 */

import { z } from "zod";
import * as logger from "../utils/logger.js";

/**
 * Register connection enhancement tools with the MCP server.
 * @param {Object} server - MCP server instance
 * @param {Object} engine - DiagramEngine instance
 */
export function registerConnectionTools(server, engine) {
  // get_connected_cells - Get all cells connected to a cell
  server.tool(
    "get_connected_cells",
    "Get all cells connected to a cell via edges",
    {
      cell_id: z.string().describe("ID of the cell"),
      direction: z
        .enum(["incoming", "outgoing", "both"])
        .default("both")
        .describe("Direction of connections to find"),
    },
    async ({ cell_id, direction = "both" }) => {
      logger.debug("get_connected_cells called", { cell_id, direction });

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
        // Get all edges
        const edgesResult = engine.api.cells.getCells({ type: "edges" });
        if (!edgesResult.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: "Could not get edges" },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        const incoming = [];
        const outgoing = [];

        for (const edge of edgesResult.data) {
          if (
            edge.source === cell_id &&
            (direction === "outgoing" || direction === "both")
          ) {
            // This cell is the source, so target is outgoing
            if (edge.target) {
              const targetResult = engine.api.cells.getCell(edge.target);
              if (targetResult.success) {
                outgoing.push({
                  cell_id: edge.target,
                  label: targetResult.data.label,
                  edge_id: edge.id,
                  edge_label: edge.label,
                });
              }
            }
          }
          if (
            edge.target === cell_id &&
            (direction === "incoming" || direction === "both")
          ) {
            // This cell is the target, so source is incoming
            if (edge.source) {
              const sourceResult = engine.api.cells.getCell(edge.source);
              if (sourceResult.success) {
                incoming.push({
                  cell_id: edge.source,
                  label: sourceResult.data.label,
                  edge_id: edge.id,
                  edge_label: edge.label,
                });
              }
            }
          }
        }

        const result = {
          success: true,
          cell_id,
          connections: {},
        };

        if (direction === "both" || direction === "incoming") {
          result.connections.incoming = incoming;
        }
        if (direction === "both" || direction === "outgoing") {
          result.connections.outgoing = outgoing;
        }

        result.total_connections = incoming.length + outgoing.length;
        result.message = `Found ${incoming.length} incoming and ${outgoing.length} outgoing connections for "${cell_id}"`;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
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

  // set_edge_waypoints - Set intermediate waypoints for an edge
  server.tool(
    "set_edge_waypoints",
    "Set intermediate waypoints for an edge to control its routing path",
    {
      edge_id: z.string().describe("ID of the edge"),
      waypoints: z
        .array(
          z.object({
            x: z.number().describe("X coordinate"),
            y: z.number().describe("Y coordinate"),
          }),
        )
        .describe("Array of waypoint coordinates in order"),
    },
    async ({ edge_id, waypoints }) => {
      logger.debug("set_edge_waypoints called", { edge_id, waypoints });

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
        // Verify the edge exists
        const edgeResult = engine.api.cells.getCell(edge_id);
        if (!edgeResult.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: `Edge not found: ${edge_id}` },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        if (!edgeResult.data.isEdge) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: `Cell "${edge_id}" is not an edge` },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Try to use the engine's model to set waypoints
        const model = engine.api.model;
        const graph = engine.api.graph;

        if (model && graph) {
          const edge = model.getCell(edge_id);
          if (edge && edge.geometry) {
            model.beginUpdate();
            try {
              // Clear existing points and set new ones
              edge.geometry.points = waypoints.map((wp) => ({
                x: wp.x,
                y: wp.y,
              }));
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
                      message: `Set ${waypoints.length} waypoints for edge "${edge_id}"`,
                      edge_id,
                      waypoints,
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }
        }

        // Fallback: update via updateCell if model access doesn't work
        const result = engine.api.cells.updateCell({
          cellId: edge_id,
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
                    message: `Set ${waypoints.length} waypoints for edge "${edge_id}"`,
                    edge_id,
                    waypoints,
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
                  error: result.error || "Failed to set waypoints",
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

  // get_edge_waypoints - Get waypoints for an edge
  server.tool(
    "get_edge_waypoints",
    "Get the waypoints for an edge",
    {
      edge_id: z.string().describe("ID of the edge"),
    },
    async ({ edge_id }) => {
      logger.debug("get_edge_waypoints called", { edge_id });

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
        const edgeResult = engine.api.cells.getCell(edge_id);
        if (!edgeResult.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: `Edge not found: ${edge_id}` },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        if (!edgeResult.data.isEdge) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: `Cell "${edge_id}" is not an edge` },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Try to get waypoints from the model
        const model = engine.api.model;
        let waypoints = [];

        if (model) {
          const edge = model.getCell(edge_id);
          if (edge && edge.geometry && edge.geometry.points) {
            waypoints = edge.geometry.points.map((p) => ({ x: p.x, y: p.y }));
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  edge_id,
                  source: edgeResult.data.source,
                  target: edgeResult.data.target,
                  waypoints,
                  waypoint_count: waypoints.length,
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

  logger.info("Registered connection tools");
}
