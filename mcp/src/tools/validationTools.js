// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file validationTools.js - Diagram validation MCP tools
 * @description Tools for validating diagram structure and detecting issues.
 */

import { z } from "zod";
import * as logger from "../utils/logger.js";

/**
 * Register validation tools with the MCP server.
 * @param {Object} server - MCP server instance
 * @param {Object} engine - DiagramEngine instance
 */
export function registerValidationTools(server, engine) {
  // validate_diagram - Run validation checks on the diagram
  server.tool(
    "validate_diagram",
    "Run validation checks on the diagram (orphan edges, missing connections, etc.)",
    {
      checks: z
        .array(
          z.enum([
            "orphan_edges",
            "disconnected_vertices",
            "empty_labels",
            "overlapping_cells",
            "out_of_bounds",
            "all",
          ]),
        )
        .default(["all"])
        .describe("Validation checks to run"),
    },
    async ({ checks = ["all"] }) => {
      logger.debug("validate_diagram called", { checks });

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
        const runAll = checks.includes("all");
        const issues = [];

        // Get all cells
        const verticesResult = engine.api.cells.getCells({ type: "vertices" });
        const edgesResult = engine.api.cells.getCells({ type: "edges" });

        const vertices = verticesResult.success ? verticesResult.data : [];
        const edges = edgesResult.success ? edgesResult.data : [];

        // Check for orphan edges (edges without valid source or target)
        if (runAll || checks.includes("orphan_edges")) {
          const vertexIds = new Set(vertices.map((v) => v.id));
          for (const edge of edges) {
            const hasSource = edge.source && vertexIds.has(edge.source);
            const hasTarget = edge.target && vertexIds.has(edge.target);

            if (!hasSource || !hasTarget) {
              issues.push({
                type: "orphan_edge",
                severity: "warning",
                cell_id: edge.id,
                message: `Edge "${edge.id}" has ${!hasSource ? "missing source" : ""}${!hasSource && !hasTarget ? " and " : ""}${!hasTarget ? "missing target" : ""}`,
              });
            }
          }
        }

        // Check for disconnected vertices (vertices with no edges)
        if (runAll || checks.includes("disconnected_vertices")) {
          const connectedVertices = new Set();
          for (const edge of edges) {
            if (edge.source) connectedVertices.add(edge.source);
            if (edge.target) connectedVertices.add(edge.target);
          }

          for (const vertex of vertices) {
            if (!connectedVertices.has(vertex.id)) {
              issues.push({
                type: "disconnected_vertex",
                severity: "info",
                cell_id: vertex.id,
                message: `Vertex "${vertex.id}" has no connections`,
              });
            }
          }
        }

        // Check for empty labels
        if (runAll || checks.includes("empty_labels")) {
          for (const cell of [...vertices, ...edges]) {
            if (!cell.label || cell.label.trim() === "") {
              issues.push({
                type: "empty_label",
                severity: "info",
                cell_id: cell.id,
                message: `Cell "${cell.id}" has no label`,
              });
            }
          }
        }

        // Check for overlapping cells
        if (runAll || checks.includes("overlapping_cells")) {
          const verticesWithGeo = vertices.filter((v) => v.geometry);
          for (let i = 0; i < verticesWithGeo.length; i++) {
            for (let j = i + 1; j < verticesWithGeo.length; j++) {
              const a = verticesWithGeo[i];
              const b = verticesWithGeo[j];

              // Check for overlap
              const aRight = a.geometry.x + (a.geometry.width || 100);
              const aBottom = a.geometry.y + (a.geometry.height || 50);
              const bRight = b.geometry.x + (b.geometry.width || 100);
              const bBottom = b.geometry.y + (b.geometry.height || 50);

              const overlaps = !(
                a.geometry.x >= bRight ||
                aRight <= b.geometry.x ||
                a.geometry.y >= bBottom ||
                aBottom <= b.geometry.y
              );

              if (overlaps) {
                issues.push({
                  type: "overlapping_cells",
                  severity: "warning",
                  cell_ids: [a.id, b.id],
                  message: `Cells "${a.id}" and "${b.id}" overlap`,
                });
              }
            }
          }
        }

        // Check for out of bounds (negative coordinates)
        if (runAll || checks.includes("out_of_bounds")) {
          for (const vertex of vertices) {
            if (vertex.geometry) {
              if (vertex.geometry.x < 0 || vertex.geometry.y < 0) {
                issues.push({
                  type: "out_of_bounds",
                  severity: "warning",
                  cell_id: vertex.id,
                  message: `Vertex "${vertex.id}" has negative coordinates (x: ${vertex.geometry.x}, y: ${vertex.geometry.y})`,
                });
              }
            }
          }
        }

        // Group issues by severity
        const errors = issues.filter((i) => i.severity === "error");
        const warnings = issues.filter((i) => i.severity === "warning");
        const infos = issues.filter((i) => i.severity === "info");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  valid: issues.length === 0,
                  summary: {
                    total_issues: issues.length,
                    errors: errors.length,
                    warnings: warnings.length,
                    info: infos.length,
                    vertices_count: vertices.length,
                    edges_count: edges.length,
                  },
                  issues: issues.length > 0 ? issues : undefined,
                  message:
                    issues.length === 0
                      ? "Diagram passed all validation checks"
                      : `Found ${issues.length} issues: ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info`,
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

  // find_overlapping_cells - Find cells that overlap
  server.tool(
    "find_overlapping_cells",
    "Find all pairs of cells that overlap each other",
    {
      cell_ids: z
        .array(z.string())
        .optional()
        .describe("IDs of cells to check (all vertices if omitted)"),
      min_overlap: z
        .number()
        .default(0)
        .describe("Minimum overlap area in pixels to report"),
    },
    async ({ cell_ids, min_overlap = 0 }) => {
      logger.debug("find_overlapping_cells called", { cell_ids, min_overlap });

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
        // Get cells to check
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
            cells = verticesResult.data.filter((v) => v.geometry);
          }
        }

        const overlaps = [];

        for (let i = 0; i < cells.length; i++) {
          for (let j = i + 1; j < cells.length; j++) {
            const a = cells[i];
            const b = cells[j];

            const aGeo = a.geometry;
            const bGeo = b.geometry;

            // Calculate overlap rectangle
            const overlapX = Math.max(aGeo.x, bGeo.x);
            const overlapY = Math.max(aGeo.y, bGeo.y);
            const overlapRight = Math.min(
              aGeo.x + (aGeo.width || 100),
              bGeo.x + (bGeo.width || 100),
            );
            const overlapBottom = Math.min(
              aGeo.y + (aGeo.height || 50),
              bGeo.y + (bGeo.height || 50),
            );

            const overlapWidth = overlapRight - overlapX;
            const overlapHeight = overlapBottom - overlapY;

            if (overlapWidth > 0 && overlapHeight > 0) {
              const overlapArea = overlapWidth * overlapHeight;
              if (overlapArea >= min_overlap) {
                overlaps.push({
                  cell_a: a.id,
                  cell_b: b.id,
                  overlap_area: overlapArea,
                  overlap_rect: {
                    x: overlapX,
                    y: overlapY,
                    width: overlapWidth,
                    height: overlapHeight,
                  },
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
                  cells_checked: cells.length,
                  overlaps_found: overlaps.length,
                  overlaps: overlaps.length > 0 ? overlaps : undefined,
                  message:
                    overlaps.length === 0
                      ? `No overlapping cells found among ${cells.length} cells`
                      : `Found ${overlaps.length} overlapping cell pairs`,
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

  logger.info("Registered validation tools");
}
