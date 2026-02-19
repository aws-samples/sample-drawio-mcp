// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file server.js - MCP Server setup
 * @description Sets up the MCP server with stdio transport and registers all tools.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DiagramEngine, setupGlobalMocks } from "drawio-jsapi";
import { registerDiagramTools } from "./tools/diagramTools.js";
import { registerCellTools } from "./tools/cellTools.js";
import { registerLibraryTools } from "./tools/libraryTools.js";
import { registerGroupTools } from "./tools/groupTools.js";
import { registerBatchTools } from "./tools/batchTools.js";
import { registerLayoutTools } from "./tools/layoutTools.js";
import { registerConnectionTools } from "./tools/connectionTools.js";
import { registerValidationTools } from "./tools/validationTools.js";
import { registerMetadataTools } from "./tools/metadataTools.js";
import { registerExportTools } from "./tools/exportTools.js";
import * as logger from "./utils/logger.js";

// Setup global mocks for Node.js environment
setupGlobalMocks();

/**
 * Create and configure the MCP server.
 * @returns {Object} Server and engine instances
 */
export function createServer() {
  // Create the diagram engine (shared state)
  const engine = new DiagramEngine();

  // Create MCP server
  const server = new McpServer({
    name: "drawio-mcp",
    version: "1.0.0",
  });

  // Register all tools
  registerDiagramTools(server, engine);
  registerCellTools(server, engine);
  registerLibraryTools(server, engine);
  registerGroupTools(server, engine);
  registerBatchTools(server, engine);
  registerLayoutTools(server, engine);
  registerConnectionTools(server, engine);
  registerValidationTools(server, engine);
  registerMetadataTools(server, engine);
  registerExportTools(server, engine);

  logger.info("MCP server created", {
    name: "drawio-mcp",
    version: "1.0.0",
  });

  return { server, engine };
}

/**
 * Start the MCP server with stdio transport.
 * @returns {Promise<void>}
 */
export async function startServer() {
  const { server } = createServer();

  // Create stdio transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  logger.info("MCP server started with stdio transport");
}
