# drawio-mcp

MCP (Model Context Protocol) server for creating and manipulating draw.io diagrams with AI assistants like Claude.

## Install via npx

Run the MCP server directly:

```bash
npx -y https://github.com/aws-samples/sample-drawio-mcp/releases/latest/download/drawio-mcp-server-latest.tgz
```

Or configure your MCP client (Claude Desktop, Claude Code, Kiro):

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": [
        "-y",
        "https://github.com/aws-samples/sample-drawio-mcp/releases/latest/download/drawio-mcp-server-latest.tgz"
      ]
    }
  }
}
```

## Quick Start

```bash
# Install dependencies
cd mcp
npm install

# Start the server
npm start
```

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "drawio": {
      "command": "node",
      "args": ["/absolute/path/to/drawio-jsapi/mcp/src/index.js"],
      "env": {
        "DRAWIO_MCP_LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### Claude Code

Add to your Claude Code MCP settings (`.claude/settings.json` or via Claude Code settings):

```json
{
  "mcpServers": {
    "drawio": {
      "command": "node",
      "args": ["/absolute/path/to/drawio-jsapi/mcp/src/index.js"]
    }
  }
}
```

### Environment Variables

| Variable               | Description                                 | Default |
| ---------------------- | ------------------------------------------- | ------- |
| `DRAWIO_MCP_LOG_LEVEL` | Log level: `DEBUG`, `INFO`, `WARN`, `ERROR` | `INFO`  |

## Available Tools

### Diagram Management

| Tool                    | Description                          |
| ----------------------- | ------------------------------------ |
| `create_diagram`        | Create a new empty diagram           |
| `load_diagram`          | Load a diagram from a `.drawio` file |
| `load_diagram_from_xml` | Load a diagram from XML string       |
| `save_diagram`          | Save the current diagram to a file   |
| `get_diagram_xml`       | Get the diagram as XML string        |
| `get_diagram_info`      | Get diagram statistics (cell counts) |
| `clear_diagram`         | Remove all cells from the diagram    |

### Cell Operations

| Tool             | Description                                     |
| ---------------- | ----------------------------------------------- |
| `insert_vertex`  | Insert a new shape (vertex)                     |
| `insert_edge`    | Connect two shapes with an edge                 |
| `update_cell`    | Update cell properties (label, geometry, style) |
| `remove_cell`    | Remove a cell from the diagram                  |
| `get_cell`       | Get information about a specific cell           |
| `get_cells`      | Get all cells (optionally filter by type)       |
| `set_cell_style` | Set or update style properties                  |
| `move_cell`      | Move a cell to a new position                   |
| `resize_cell`    | Resize a cell                                   |

### Shape Libraries

| Tool                   | Description                        |
| ---------------------- | ---------------------------------- |
| `list_libraries`       | List all available shape libraries |
| `list_categories`      | List categories in a library       |
| `list_shapes`          | List shapes in a category          |
| `search_shapes`        | Search shapes by name/keyword      |
| `get_shape_style`      | Get the style string for a shape   |
| `insert_library_shape` | Insert a shape from a library      |

### Grouping & Containers

| Tool                   | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `create_group`         | Group multiple cells into a container                        |
| `ungroup_cells`        | Dissolve a group, releasing children                         |
| `get_parent`           | Get the parent container of a cell                           |
| `get_children`         | Get all direct children of a container                       |
| `set_parent`           | Move a cell into a parent container                          |
| `insert_aws_group`     | Insert an AWS architecture group (VPC, Region, Subnet, etc.) |
| `insert_aws_icon`      | Insert an AWS service icon (EC2, Lambda, S3, etc.)           |
| `list_aws_group_types` | List available AWS group types                               |

### Batch Operations

| Tool                    | Description                               |
| ----------------------- | ----------------------------------------- |
| `batch_insert_vertices` | Insert multiple vertices in one operation |
| `batch_insert_edges`    | Insert multiple edges in one operation    |
| `batch_update_cells`    | Update multiple cells in one operation    |
| `batch_remove_cells`    | Remove multiple cells in one operation    |

### Connection Tools

| Tool                  | Description                                 |
| --------------------- | ------------------------------------------- |
| `get_connected_cells` | Get all cells connected via edges           |
| `set_edge_waypoints`  | Set intermediate waypoints for edge routing |
| `get_edge_waypoints`  | Get waypoints for an edge                   |

### Validation

| Tool                     | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `validate_diagram`       | Run validation checks (orphan edges, overlaps, etc.) |
| `find_overlapping_cells` | Find all overlapping cell pairs                      |

### Metadata

| Tool               | Description                            |
| ------------------ | -------------------------------------- |
| `set_cell_data`    | Set custom data attributes on a cell   |
| `get_cell_data`    | Get custom data attributes from a cell |
| `set_cell_tooltip` | Set tooltip text for a cell            |
| `set_cell_link`    | Set a clickable URL link on a cell     |
| `get_cell_link`    | Get the link URL from a cell           |

### Bounds & Positioning

| Tool                  | Description                               |
| --------------------- | ----------------------------------------- |
| `get_bounds`          | Get bounding box of one or more cells     |
| `get_diagram_bounds`  | Get overall diagram bounding box          |
| `center_diagram`      | Center all cells at a specified origin    |
| `fit_cells_to_bounds` | Scale/position cells to fit within bounds |

## Shape Libraries

The server includes pre-built catalogs for:

| Library      | Description                              | Icon Count |
| ------------ | ---------------------------------------- | ---------- |
| `aws4`       | AWS Architecture Icons                   | 200+       |
| `azure`      | Microsoft Azure Icons                    | 150+       |
| `gcp`        | Google Cloud Icons                       | 100+       |
| `kubernetes` | Kubernetes Icons                         | 50+        |
| `basic`      | Basic shapes (rectangles, circles, etc.) | 20+        |

## Workflow Examples

### Creating an AWS Architecture Diagram

```
User: Create an AWS architecture diagram with a VPC containing an EC2 instance connected to RDS

Claude will:
1. create_diagram (name: "AWS Architecture")
2. search_shapes (query: "vpc", library: "aws4")
3. insert_library_shape (library: "aws4", shape_id: "vpc", ...)
4. insert_library_shape (library: "aws4", shape_id: "ec2", ...)
5. insert_library_shape (library: "aws4", shape_id: "rds", ...)
6. insert_edge (source_id: "ec2", target_id: "rds")
7. save_diagram (file_path: "aws-architecture.drawio")
```

### Modifying an Existing Diagram

```
User: Open my-diagram.drawio and change the color of all boxes to blue

Claude will:
1. load_diagram (file_path: "my-diagram.drawio")
2. get_cells (type: "vertices")
3. set_cell_style (id: "cell1", style: { fillColor: "#dae8fc" })
4. set_cell_style (id: "cell2", style: { fillColor: "#dae8fc" })
5. ...
6. save_diagram ()
```

### Creating a Simple Flowchart

```
User: Create a flowchart with Start -> Process -> Decision -> End

Claude will:
1. create_diagram (name: "Flowchart")
2. insert_vertex (id: "start", label: "Start", geometry: {x: 100, y: 50, width: 80, height: 40})
3. insert_vertex (id: "process", label: "Process", geometry: {x: 100, y: 130, width: 80, height: 40})
4. insert_vertex (id: "decision", label: "Decision?", geometry: {x: 100, y: 210, width: 80, height: 60}, style: {shape: "rhombus"})
5. insert_vertex (id: "end", label: "End", geometry: {x: 100, y: 310, width: 80, height: 40})
6. insert_edge (source_id: "start", target_id: "process")
7. insert_edge (source_id: "process", target_id: "decision")
8. insert_edge (source_id: "decision", target_id: "end", label: "Yes")
9. save_diagram (file_path: "flowchart.drawio")
```

## Tool Parameters Reference

### insert_vertex

```typescript
{
  id?: string,           // Unique ID (auto-generated if omitted)
  label?: string,        // Text label for the shape
  geometry: {
    x: number,           // X coordinate
    y: number,           // Y coordinate
    width?: number,      // Width (default: 100)
    height?: number      // Height (default: 50)
  },
  style?: string | {     // Style string or object
    fillColor?: string,
    strokeColor?: string,
    rounded?: number,
    shape?: string,      // e.g., "rhombus", "ellipse", "hexagon"
    // ... any draw.io style property
  },
  parent_id?: string     // Parent cell ID for grouping
}
```

### insert_edge

```typescript
{
  id?: string,           // Unique ID (auto-generated if omitted)
  label?: string,        // Text label for the edge
  source_id: string,     // Source vertex ID
  target_id: string,     // Target vertex ID
  style?: string | {
    edgeStyle?: string,  // e.g., "orthogonalEdgeStyle", "elbowEdgeStyle"
    strokeColor?: string,
    strokeWidth?: number,
    endArrow?: string,   // e.g., "classic", "block", "open"
    // ... any draw.io style property
  },
  waypoints?: Array<{x: number, y: number}>  // Intermediate points
}
```

### insert_library_shape

```typescript
{
  library: "aws4" | "azure" | "gcp" | "basic" | "kubernetes",
  shape_id: string,      // Shape ID from the library
  id?: string,           // Custom cell ID
  label?: string,        // Label for the shape
  x: number,             // X coordinate
  y: number,             // Y coordinate
  width?: number,        // Width (uses default if omitted)
  height?: number,       // Height (uses default if omitted)
  style_overrides?: {    // Override default style properties
    fillColor?: string,
    // ... any draw.io style property
  }
}
```

## Development

### Running Tests

```bash
npm test             # Run all tests
npm run test:watch   # Watch mode
```

### Source Structure

```
mcp/
├── src/
│   ├── index.js              # Entry point / CLI
│   ├── server.js             # MCP server setup
│   ├── tools/
│   │   ├── diagramTools.js   # Diagram CRUD operations
│   │   ├── cellTools.js      # Shape/edge manipulation
│   │   ├── libraryTools.js   # Shape library tools
│   │   ├── groupTools.js     # Grouping and container tools
│   │   ├── batchTools.js     # Batch operation tools
│   │   ├── connectionTools.js # Connection enhancement tools
│   │   ├── validationTools.js # Diagram validation tools
│   │   ├── metadataTools.js  # Cell metadata tools
│   │   └── exportTools.js    # Export and bounds tools
│   ├── catalogs/             # Shape library catalogs (JSON)
│   │   ├── aws4.json
│   │   ├── azure.json
│   │   ├── gcp.json
│   │   ├── kubernetes.json
│   │   └── basic.json
│   └── utils/
│       └── logger.js         # Logging utility
├── test/                     # Test suite
├── package.json
└── README.md
```

### Adding New Shape Libraries

1. Create a JSON catalog file in `src/catalogs/`:

```json
{
  "displayName": "My Library",
  "description": "Custom shapes for my project",
  "categories": {
    "category1": {
      "name": "Category Name",
      "description": "Category description",
      "shapes": [
        {
          "id": "shape1",
          "name": "Shape Name",
          "description": "Shape description",
          "style": "shape=rectangle;fillColor=#ffffff;strokeColor=#000000;",
          "defaultSize": { "width": 100, "height": 50 }
        }
      ]
    }
  }
}
```

2. Add the filename to the `catalogFiles` array in `src/tools/libraryTools.js`

## Troubleshooting

### Server Not Starting

- Ensure Node.js 18+ is installed
- Run `npm install` in the `mcp/` directory
- Check the path in your config is absolute and correct

### Tools Not Appearing in Claude

- Restart Claude Desktop/Code after config changes
- Check the MCP server logs for errors
- Verify the config JSON syntax is valid

### Diagram Not Saving

- Ensure the output directory exists
- Check file permissions
- Use absolute paths when possible

## License

MIT-0
