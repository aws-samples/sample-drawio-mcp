// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file diagramTools.js - Diagram management MCP tools
 * @description Tools for creating, loading, and saving diagrams.
 */

import { z } from "zod";
import * as logger from "../utils/logger.js";

/**
 * Register diagram management tools with the MCP server.
 * @param {Object} server - MCP server instance
 * @param {Object} engine - DiagramEngine instance
 */
export function registerDiagramTools(server, engine) {
  // create_diagram - Create a new empty diagram
  server.tool(
    "create_diagram",
    "Create a new empty diagram",
    {
      name: z
        .string()
        .optional()
        .describe('Name for the diagram page (default: "Page-1")'),
    },
    async ({ name }) => {
      logger.debug("create_diagram called", { name });

      const result = engine.create({ name });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Created new diagram "${result.data.name}"`,
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

  // load_diagram - Load a diagram from a file
  server.tool(
    "load_diagram",
    "Load a diagram from a .drawio file",
    {
      file_path: z.string().describe("Path to the .drawio file to load"),
    },
    async ({ file_path }) => {
      logger.debug("load_diagram called", { file_path });

      const result = engine.loadFromFile(file_path);

      if (result.success) {
        const info = engine.getInfo();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Loaded diagram from "${file_path}"`,
                  data: {
                    ...result.data,
                    ...info.data,
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

  // load_diagram_from_xml - Load a diagram from XML string
  server.tool(
    "load_diagram_from_xml",
    "Load a diagram from an XML string",
    {
      xml: z.string().describe("The .drawio XML content to load"),
    },
    async ({ xml }) => {
      logger.debug("load_diagram_from_xml called", { xmlLength: xml.length });

      const result = engine.loadFromXml(xml);

      if (result.success) {
        const info = engine.getInfo();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: "Loaded diagram from XML",
                  data: {
                    ...result.data,
                    ...info.data,
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

  // save_diagram - Save the current diagram to a file
  server.tool(
    "save_diagram",
    "Save the current diagram to a .drawio file",
    {
      file_path: z
        .string()
        .optional()
        .describe("Path to save to (uses loaded path if not specified)"),
      diagram_name: z.string().optional().describe("Override the diagram name"),
    },
    async ({ file_path, diagram_name }) => {
      logger.debug("save_diagram called", { file_path, diagram_name });

      const result = engine.saveToFile(file_path, {
        diagramName: diagram_name,
      });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Saved diagram to "${result.data.path}"`,
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

  // get_diagram_xml - Get the current diagram as XML
  server.tool(
    "get_diagram_xml",
    "Get the current diagram as XML string",
    {
      wrap_in_mxfile: z
        .boolean()
        .optional()
        .describe("Wrap in mxfile element (default: true)"),
    },
    async ({ wrap_in_mxfile }) => {
      logger.debug("get_diagram_xml called", { wrap_in_mxfile });

      const result = engine.toXml({ wrapInMxFile: wrap_in_mxfile });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: result.data,
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

  // get_diagram_info - Get information about the current diagram
  server.tool(
    "get_diagram_info",
    "Get information about the current diagram (cell counts, stats)",
    {},
    async () => {
      logger.debug("get_diagram_info called");

      const result = engine.getInfo();

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

  // clear_diagram - Clear all cells from the diagram
  server.tool(
    "clear_diagram",
    "Remove all cells from the current diagram",
    {},
    async () => {
      logger.debug("clear_diagram called");

      const result = engine.clear();

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: "Diagram cleared",
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

  logger.info("Registered diagram tools");
}
