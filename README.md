# sample-drawio-mcp

JavaScript SDK and MCP server for creating and manipulating draw.io diagrams programmatically.

## Overview

This monorepo contains tools for programmatic draw.io diagram creation:

- **jsapi/** - Core JavaScript SDK for creating draw.io diagrams
- **mcp/** - MCP (Model Context Protocol) server for AI-assisted diagram creation

## Directory Structure

```
drawio-mcp/
├── jsapi/                    # Core JavaScript SDK
│   ├── src/                  # Source code
│   │   ├── engine/           # XML processing and diagram engine
│   │   ├── mocks/            # Mock objects for testing (no browser DOM)
│   │   └── stencils/         # Pre-built shape styles (AWS4, etc.)
│   ├── dist/                 # Built output (ESM, CJS, UMD)
│   ├── test/                 # Test suite (Vitest)
│   └── examples/             # Working examples
│       ├── hello-drawio/     # Basic flowchart example
│       └── hello-aws4/       # AWS architecture example
│
├── mcp/                      # MCP Server for AI assistants
│   ├── src/
│   │   ├── tools/            # MCP tool implementations
│   │   ├── catalogs/         # Shape library catalogs (JSON)
│   │   └── utils/            # Utilities
│   └── test/                 # Test suite (Vitest)
│
└── docs/                     # MkDocs documentation
    └── docs/Plans/           # Planning documents
```

## Quick Start

### Using the JSAPI SDK

```bash
cd jsapi
npm install
npm run build
```

See [jsapi/README.md](jsapi/README.md) for detailed usage and API reference.

### Using the MCP Server

```bash
cd mcp
npm install
npm start
```

See [mcp/README.md](mcp/README.md) for configuration and available tools.

## Running Tests

### JSAPI Tests

```bash
cd jsapi
npm install
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### MCP Server Tests

```bash
cd mcp
npm install
npm test                 # Run all tests
npm run test:watch       # Watch mode
```

### Run All Tests

From the repository root:

```bash
# Install dependencies for both packages
(cd jsapi && npm install) && (cd mcp && npm install)

# Run all tests
(cd jsapi && npm test) && (cd mcp && npm test)
```

---

## A note for AI Coding assistants:

- Read and follow all instructions in AGENTS.md
- Look for and follow instructions in hierarchically nested AGENTS.md and README.md files when working with code files in subdirectories.
