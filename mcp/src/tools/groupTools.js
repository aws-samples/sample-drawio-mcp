// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file groupTools.js - Grouping and container MCP tools
 * @description Tools for creating groups, managing parent-child relationships,
 * and inserting AWS architecture containers.
 */

import { z } from "zod";
import * as logger from "../utils/logger.js";

const GeometrySchema = z.object({
  x: z.number().describe("X coordinate"),
  y: z.number().describe("Y coordinate"),
  width: z.number().describe("Width"),
  height: z.number().describe("Height"),
});

const StyleObjectSchema = z
  .record(z.string(), z.union([z.string(), z.number()]))
  .optional();

/**
 * Register grouping and container tools with the MCP server.
 * @param {Object} server - MCP server instance
 * @param {Object} engine - DiagramEngine instance
 */
export function registerGroupTools(server, engine) {
  // create_group - Group multiple cells into a container
  server.tool(
    "create_group",
    "Group multiple cells into a container",
    {
      cell_ids: z
        .array(z.string())
        .min(2)
        .describe("IDs of cells to group (minimum 2)"),
      style: StyleObjectSchema.describe(
        "Optional style for the group container",
      ),
    },
    async ({ cell_ids, style }) => {
      logger.debug("create_group called", { cell_ids, style });

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

      const result = engine.api.cells.groupCells(cell_ids);

      if (result.success && style && Object.keys(style).length > 0) {
        // Apply style to the new group
        engine.api.styles.setStyle({ cellId: result.data.id, style });
      }

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Created group "${result.data.id}" containing ${cell_ids.length} cells`,
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

  // ungroup_cells - Dissolve a group, releasing its children
  server.tool(
    "ungroup_cells",
    "Dissolve a group, releasing its children back to the parent",
    {
      group_id: z.string().describe("ID of the group to dissolve"),
    },
    async ({ group_id }) => {
      logger.debug("ungroup_cells called", { group_id });

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

      const result = engine.api.cells.ungroupCells(group_id);

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Ungrouped "${group_id}", released ${result.data.ids.length} children`,
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

  // get_parent - Get the parent container of a cell
  server.tool(
    "get_parent",
    "Get the parent container of a cell",
    {
      cell_id: z.string().describe("ID of the cell"),
    },
    async ({ cell_id }) => {
      logger.debug("get_parent called", { cell_id });

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

      const result = engine.api.cells.getParent(cell_id);

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  data: result.data,
                  message: result.data
                    ? `Parent of "${cell_id}" is "${result.data.id}"`
                    : `Cell "${cell_id}" has no parent container`,
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

  // get_children - Get all direct children of a cell
  server.tool(
    "get_children",
    "Get all direct children of a container/group cell",
    {
      cell_id: z.string().describe("ID of the parent cell"),
    },
    async ({ cell_id }) => {
      logger.debug("get_children called", { cell_id });

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

      const result = engine.api.cells.getChildren(cell_id);

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

  // set_parent - Move a cell into a parent container
  server.tool(
    "set_parent",
    "Move a cell into a parent container/group",
    {
      cell_id: z.string().describe("ID of the cell to move"),
      parent_id: z.string().describe("ID of the new parent container"),
    },
    async ({ cell_id, parent_id }) => {
      logger.debug("set_parent called", { cell_id, parent_id });

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

      // Get the cell and reparent it
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

      const parentResult = engine.api.cells.getCell(parent_id);
      if (!parentResult.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: `Parent cell not found: ${parent_id}`,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      // Use the internal model to reparent
      try {
        const model = engine.api.model;
        const graph = engine.api.graph;

        if (!model || !graph) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { success: false, error: "Graph not initialized" },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        const cell = model.getCell(cell_id);
        const parent = model.getCell(parent_id);

        if (!cell || !parent) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error: "Cell or parent not found in model",
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Remove from current parent and add to new parent
        model.beginUpdate();
        try {
          graph.addCells([cell], parent);
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
                  message: `Moved cell "${cell_id}" into parent "${parent_id}"`,
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

  // insert_aws_group - Insert an AWS architecture group container
  server.tool(
    "insert_aws_group",
    "Insert an AWS architecture group container (VPC, Region, Subnet, etc.)",
    {
      group_type: z
        .enum([
          "awsCloud",
          "awsCloudAlt",
          "region",
          "availabilityZone",
          "securityGroup",
          "vpc",
          "privateSubnet",
          "publicSubnet",
          "autoScalingGroup",
          "ec2InstanceContents",
          "elasticBeanstalkContainer",
          "spotFleet",
          "stepFunctionsWorkflow",
          "awsAccount",
          "corporateDataCenter",
          "serverContents",
          "iotGreengrassDeployment",
          "iotGreengrass",
          "generic",
          "genericFilled",
        ])
        .describe("AWS group type"),
      id: z.string().optional().describe("Custom ID for the group"),
      label: z.string().optional().describe("Label for the group"),
      geometry: GeometrySchema.describe("Position and size of the group"),
      style_overrides: StyleObjectSchema.describe(
        "Style properties to override",
      ),
    },
    async ({ group_type, id, label, geometry, style_overrides }) => {
      logger.debug("insert_aws_group called", {
        group_type,
        id,
        label,
        geometry,
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

      const result = engine.api.cells.insertAwsGroup({
        id,
        groupType: group_type,
        label,
        geometry,
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
                  message: `Inserted AWS ${group_type} group "${result.data.id}"`,
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

  // insert_aws_icon - Insert an AWS service icon
  server.tool(
    "insert_aws_icon",
    "Insert an AWS service icon (EC2, Lambda, S3, RDS, etc.)",
    {
      icon: z
        .string()
        .describe('Icon name (e.g., "ec2", "lambda", "s3", "rds")'),
      category: z
        .string()
        .optional()
        .describe(
          'Category hint for faster lookup (e.g., "compute", "database", "storage")',
        ),
      id: z.string().optional().describe("Custom ID for the icon"),
      label: z.string().optional().describe("Label for the icon"),
      geometry: z
        .object({
          x: z.number().describe("X coordinate"),
          y: z.number().describe("Y coordinate"),
          width: z
            .number()
            .optional()
            .describe("Width (default: from icon definition)"),
          height: z
            .number()
            .optional()
            .describe("Height (default: from icon definition)"),
        })
        .describe("Position and optional size"),
      style_overrides: StyleObjectSchema.describe(
        "Style properties to override",
      ),
    },
    async ({ icon, category, id, label, geometry, style_overrides }) => {
      logger.debug("insert_aws_icon called", {
        icon,
        category,
        id,
        label,
        geometry,
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

      const result = engine.api.cells.insertAwsIcon({
        id,
        icon,
        category,
        label,
        geometry,
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
                  message: `Inserted AWS icon "${icon}" as "${result.data.id}"`,
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

  // list_aws_group_types - List available AWS group types
  server.tool(
    "list_aws_group_types",
    "List all available AWS architecture group types",
    {},
    async () => {
      logger.debug("list_aws_group_types called");

      if (!engine.isLoaded) {
        // This doesn't require a loaded diagram, but we still check for consistency
        const result = engine.api?.cells?.getAwsGroupTypes?.();
        if (result?.success) {
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
      }

      const result = engine.api.cells.getAwsGroupTypes();

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

  logger.info("Registered group tools");
}
