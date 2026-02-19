# DrawIO JSAPI

A JavaScript library for programmatically creating and manipulating draw.io diagrams without requiring a browser or the draw.io application.

## Overview

The DrawIO JSAPI provides a clean, type-safe API for generating draw.io XML diagrams in Node.js or browser environments. It enables developers to build diagram generation tools, automate architecture documentation, and integrate diagramming capabilities into applications.

## What It's For

The library supports several use cases:

- **Automated diagram generation** - Create architecture diagrams from infrastructure-as-code or configuration files
- **Documentation tooling** - Generate technical diagrams as part of documentation pipelines
- **Diagram manipulation** - Programmatically modify existing draw.io files
- **AI-assisted diagramming** - Provide diagram creation capabilities to AI assistants through APIs
- **Custom diagramming applications** - Build specialized diagramming tools without implementing XML serialization

## Architecture

The library consists of three main layers:

### 1. Mock Layer (`src/mocks/`)

Provides lightweight implementations of mxGraph objects (the underlying library used by draw.io) that work without browser DOM dependencies. The mocks implement the minimal interface needed for diagram operations:

- **MockModel** - Manages the cell hierarchy and relationships
- **MockGraph** - Handles cell insertion, removal, and geometry operations
- **globalMocks** - Provides global mxGraph constants and utilities for Node.js

This layer allows the library to operate in Node.js environments where the full mxGraph library and browser APIs are unavailable.

### 2. Manager Layer (`src/`)

Organized into specialized managers that handle different aspects of diagram manipulation:

- **CellManager** - Creates and modifies vertices (shapes) and edges (connections)
- **StyleManager** - Manages cell styling and appearance
- **DiagramManager** - Handles diagram-level operations like clearing and statistics
- **IOManager** - Imports and exports XML
- **LibraryManager** - Provides access to shape libraries (AWS, Azure, etc.)

Each manager operates on the mock graph and model, providing a clean API that abstracts mxGraph implementation details.

### 3. Engine Layer (`src/engine/`)

Handles XML serialization and high-level diagram lifecycle:

- **DiagramEngine** - Orchestrates diagram creation, loading, and saving
- **XmlSerializer** - Converts the mock model to draw.io XML format
- **XmlParser** - Parses draw.io XML into the mock model

The engine layer provides the highest-level API, managing the complete workflow from diagram creation to file output.

## Design Goals

The library was designed with several principles:

**No Browser Dependencies** - Operates in Node.js without requiring jsdom or headless browsers. The mock layer provides just enough mxGraph compatibility to generate valid draw.io XML.

**Type Safety** - Written in TypeScript with comprehensive type definitions for all operations. Developers get autocomplete and compile-time validation.

**Layered API** - Offers both high-level convenience (DiagramEngine) and low-level control (DrawioAPI with managers). Users can choose the appropriate abstraction level.

**Extensible Shape Libraries** - Pre-built stencils for AWS, Azure, GCP, and Kubernetes icons, with a structure that supports adding custom libraries.

**Minimal Dependencies** - Relies only on XML parsing libraries, avoiding heavy dependencies that would limit deployment scenarios.

**Compatibility** - Generates XML that is fully compatible with draw.io web, desktop, and VS Code extension. Diagrams can be created programmatically and edited visually.

## Implementation Approach

The library takes a pragmatic approach to mxGraph compatibility. Rather than implementing the full mxGraph API (which is tightly coupled to browser DOM), it provides mock objects that implement only the methods needed for diagram generation. This reduces complexity while maintaining compatibility with draw.io's XML format.

Style information for shapes is encoded as draw.io style strings (e.g., `shape=rectangle;fillColor=#ffffff`), which the library generates from JavaScript objects. The stencils directory contains pre-built style definitions for cloud provider icons, eliminating the need to manually construct complex style strings.

The XML serialization layer handles the specifics of draw.io's format, including compression, encoding, and the multi-page diagram structure. This complexity is hidden from users, who work with simple JavaScript objects and method calls.

## Getting Started

See the [Examples](EXAMPLES.md) documentation for working code samples demonstrating common use cases.
