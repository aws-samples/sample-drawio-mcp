# drawio-jsapi

JavaScript SDK for creating and manipulating draw.io diagrams programmatically.

## Installation

```bash
npm install drawio-jsapi
```

## Usage

### Basic Usage with DiagramEngine

```javascript
import { DiagramEngine } from "drawio-jsapi";
import "drawio-jsapi/mocks/globalMocks.js";

// Create a new diagram
const engine = new DiagramEngine();
engine.create({ name: "My Diagram" });

// Add shapes
engine.api.cells.insertVertex({
  id: "box1",
  label: "Hello World",
  geometry: { x: 100, y: 100, width: 120, height: 60 },
  style: { fillColor: "#dae8fc", strokeColor: "#6c8ebf" },
});

// Save to file
engine.saveToFile("diagram.drawio");
```

### Using DrawioAPI Directly

```javascript
import { createDrawioAPI } from "drawio-jsapi";
import { MockGraph, MockModel } from "drawio-jsapi/mocks";
import "drawio-jsapi/mocks/globalMocks.js";

const model = new MockModel();
const graph = new MockGraph(model);
const api = createDrawioAPI({ graph, model });

// Insert a vertex
const result = api.cells.insertVertex({
  id: "rect1",
  label: "Rectangle",
  geometry: { x: 50, y: 50, width: 100, height: 60 },
  style: { rounded: 1, fillColor: "#fff2cc" },
});

// Insert an edge
api.cells.insertEdge({
  sourceId: "rect1",
  targetId: "rect2",
  label: "connects",
});

// Export to XML
const xml = api.io.toXml();
```

### AWS Architecture Diagrams

```javascript
import { DiagramEngine, buildResourceIconStyle } from "drawio-jsapi";
import "drawio-jsapi/mocks/globalMocks.js";

const engine = new DiagramEngine();
engine.create({ name: "AWS Architecture" });

// Insert AWS icons using the cells manager
engine.api.cells.insertAwsIcon({
  id: "ec2",
  icon: "ec2",
  category: "compute",
  label: "EC2 Instance",
  geometry: { x: 100, y: 100, width: 78, height: 78 },
});

// Insert AWS groups
engine.api.cells.insertAwsGroup({
  id: "vpc",
  groupType: "vpc",
  label: "VPC",
  geometry: { x: 50, y: 50, width: 400, height: 300 },
});

engine.saveToFile("aws-diagram.drawio");
```

## API Reference

### DiagramEngine

High-level wrapper for diagram operations.

- `create(options)` - Create a new diagram
- `loadFromFile(path)` - Load from .drawio file
- `loadFromXml(xml)` - Load from XML string
- `saveToFile(path)` - Save to .drawio file
- `toXml()` - Export to XML string
- `getInfo()` - Get diagram statistics
- `clear()` - Clear all cells

### DrawioAPI

Main API class providing access to managers.

- `api.cells` - CellManager for vertex/edge operations
- `api.styles` - StyleManager for style operations
- `api.diagram` - DiagramManager for diagram-level operations
- `api.io` - IOManager for import/export

### CellManager

- `insertVertex(options)` - Insert a vertex (shape)
- `insertEdge(options)` - Insert an edge (connection)
- `insertAwsIcon(options)` - Insert AWS icon
- `insertAwsGroup(options)` - Insert AWS group container
- `getCell(id)` - Get cell by ID
- `updateCell(id, updates)` - Update cell properties
- `removeCell(id)` - Remove a cell
- `moveCell(id, x, y)` - Move cell to position
- `resizeCell(id, width, height)` - Resize cell

### StyleManager

- `getStyle(id)` - Get cell style as object
- `setStyle(id, style)` - Replace entire style
- `updateStyle(id, style)` - Merge style updates

## Building

```bash
npm run build        # Build all formats (ESM, CJS, UMD)
npm run build:watch  # Watch mode for development
```

## Running Tests

The SDK uses [Vitest](https://vitest.dev/) for testing.

```bash
npm test             # Run all tests
npm run test:watch   # Watch mode - re-runs on file changes
npm run test:coverage # Generate coverage report
```

### Test Structure

```
test/
├── CellManager.test.js   # Cell operations tests
├── DrawioAPI.test.js     # API tests
└── engine.test.js        # XML engine tests
```

## Output Formats

The build produces three output formats in `dist/`:

- **ESM** (`drawio-jsapi.esm.js`) - ES Modules for modern bundlers and Node.js
- **CJS** (`drawio-jsapi.cjs.js`) - CommonJS for older Node.js environments
- **UMD** (`drawio-jsapi.min.js`) - Minified for browser use

## License

MIT-0
