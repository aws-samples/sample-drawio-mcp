#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
/**
 * @file index.js - MCP Server entry point
 * @description Entry point for the draw.io MCP server.
 */

import { startServer } from "./server.js";
import { setLogLevel } from "./utils/logger.js";

// Configure log level from environment variable
const logLevel = process.env.DRAWIO_MCP_LOG_LEVEL || "INFO";
setLogLevel(logLevel);

// Start the server
startServer().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
