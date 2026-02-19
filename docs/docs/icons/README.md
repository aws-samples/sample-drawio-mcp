---
title: Overview
---

# Icon System Overview

The drawio-mcp system provides programmatic access to shape libraries (AWS, Azure, GCP, Kubernetes, and basic shapes) through both the JSAPI SDK and MCP server.

## Architecture

### Two-Layer System

1. **JSAPI SDK** (`jsapi/src/stencils/`)
   - Core JavaScript library for creating diagrams
   - Contains hardcoded style definitions for supported icon libraries
   - Provides builder functions for generating draw.io style strings
   - Example: `AWS4Styles.ts` contains ~200+ AWS service icon definitions

2. **MCP Server** (`mcp/src/catalogs/`)
   - AI assistant interface layer built on top of JSAPI
   - Uses JSON catalog files that mirror JSAPI stencil definitions
   - Provides tools like `insert_library_shape`, `list_shapes`, `search_shapes`
   - Catalogs: `aws4.json`, `azure.json`, `gcp.json`, `kubernetes.json`, `basic.json`

### How Icons Work

Icons in draw.io are defined by **style strings** that reference built-in stencils. For example:

```
shape=mxgraph.aws4.ec2;fillColor=#ED7100;strokeColor=#ffffff
```

This references the `ec2` stencil from the `mxgraph.aws4` library that's built into draw.io.

## Current Limitations

### Self-Contained Implementation

The icon system is **entirely self-contained** and limited to pre-defined icons:

- Icons must be manually added to both JSAPI stencils and MCP catalogs
- No automatic discovery of new draw.io stencils
- No runtime fetching of icon definitions
- Adding a new icon requires code changes in two places:
  1. `jsapi/src/stencils/<library>/` - Add style definition
  2. `mcp/src/catalogs/<library>.json` - Add catalog entry

### Why This Design?

- **Predictability**: Known set of icons with validated styles
- **Performance**: No runtime lookups or external dependencies
- **Offline**: Works without internet connection
- **Type Safety**: Icons are defined with TypeScript interfaces

## Adding Custom Icons

While the system doesn't auto-discover icons, you can add custom shapes using three approaches:

### 1. Using Built-in draw.io Shapes

Insert a generic vertex with a draw.io shape style:

```javascript
// JSAPI
engine.api.cells.insertVertex({
  geometry: { x: 100, y: 100, width: 60, height: 60 },
  label: "Custom Shape",
  style: "shape=cylinder;fillColor=#dae8fc;strokeColor=#6c8ebf",
});
```

```javascript
// MCP Tool
insert_vertex({
  geometry: { x: 100, y: 100, width: 60, height: 60 },
  label: "Custom Shape",
  style: "shape=cylinder;fillColor=#dae8fc;strokeColor=#6c8ebf",
});
```

Available built-in shapes: `rectangle`, `ellipse`, `rhombus`, `triangle`, `cylinder`, `hexagon`, `cloud`, `actor`, `umlLifeline`, etc.

### 2. Using External Images

Reference an external image URL:

```javascript
// JSAPI
engine.api.cells.insertVertex({
  geometry: { x: 100, y: 100, width: 80, height: 80 },
  label: "My Icon",
  style: "shape=image;image=https://example.com/icon.png;aspect=fixed",
});
```

```javascript
// MCP Tool
insert_vertex({
  geometry: { x: 100, y: 100, width: 80, height: 80 },
  label: "My Icon",
  style: "shape=image;image=https://example.com/icon.png;aspect=fixed",
});
```

**Note**: Images must be accessible when the diagram is opened in draw.io.

### 3. Using Embedded Images (Data URI)

Embed SVG or PNG images directly as data URIs for self-contained diagrams.

#### SVG Images (Recommended)

```javascript
// JSAPI - Helper method
const svgContent =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="30" fill="#FF0000"/></svg>';
const dataUri = engine.api.cells.createSvgDataUri(svgContent);

engine.api.cells.insertImageVertex({
  geometry: { x: 100, y: 100, width: 100, height: 100 },
  label: "SVG Icon",
  imageDataUri: dataUri,
});
```

```javascript
// MCP Tool
insert_image_vertex({
  geometry: { x: 100, y: 100, width: 100, height: 100 },
  label: "SVG Icon",
  svg_content:
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="30" fill="#FF0000"/></svg>',
});
```

#### PNG/JPG Images

```javascript
// JSAPI - Helper method
const fs = require("fs");
const imageBuffer = fs.readFileSync("icon.png");
const dataUri = engine.api.cells.createImageDataUri(imageBuffer, "image/png");

engine.api.cells.insertImageVertex({
  geometry: { x: 100, y: 100, width: 100, height: 100 },
  label: "PNG Icon",
  imageDataUri: dataUri,
});
```

```javascript
// MCP Tool
insert_image_vertex({
  geometry: { x: 100, y: 100, width: 100, height: 100 },
  label: "PNG Icon",
  image_data_uri: "data:image/png,iVBORw0KG...;base64,iVBORw0KG...",
});
```

**Image Format Requirements:**

- SVG: URL-encoded format `data:image/svg+xml,<url-encoded-svg>`
- PNG/JPG: Duplicate base64 format `data:image/png,<base64>;base64,<base64>`
- Minimum 100x100 pixels recommended to avoid rasterization
- Use `insertImageVertex()` helper for correct formatting

**See Example:** [jsapi/examples/custom-icon/](../../jsapi/examples/custom-icon/) demonstrates 6 methods of adding custom icons

### 4. Adding to the Library (Permanent)

To permanently add an icon to the system:

**Step 1: Add to JSAPI Stencils**

Edit `jsapi/src/stencils/<library>/<Library>Styles.ts`:

```typescript
export const MY_LIBRARY_ICONS = {
  myCategory: {
    myIcon: {
      name: "My Icon",
      icon: "my_icon", // Stencil name in draw.io
      fillColor: "#FF6B6B",
      width: 78,
      height: 78,
    },
  },
};
```

**Step 2: Add to MCP Catalog**

Edit `mcp/src/catalogs/<library>.json`:

```json
{
  "categories": {
    "myCategory": {
      "name": "My Category",
      "shapes": [
        {
          "id": "myIcon",
          "name": "My Icon",
          "description": "Description of my icon",
          "defaultWidth": 78,
          "defaultHeight": 78
        }
      ]
    }
  }
}
```

**Step 3: Rebuild**

```bash
cd jsapi && npm run build
cd ../mcp && npm run build
```

## Style String Reference

Common style properties for custom icons:

- `shape=<type>` - Shape type (image, rectangle, ellipse, etc.)
- `image=<url>` - Image URL or data URI
- `fillColor=<color>` - Fill color (hex)
- `strokeColor=<color>` - Border color (hex)
- `strokeWidth=<number>` - Border width
- `aspect=fixed` - Maintain aspect ratio
- `html=1` - Enable HTML rendering
- `fontSize=<number>` - Label font size
- `fontColor=<color>` - Label color
- `verticalAlign=<top|middle|bottom>` - Vertical alignment
- `align=<left|center|right>` - Horizontal alignment

## See Also

- [AWS Icons](AWS.md) - AWS service icon catalog
- [Kubernetes Icons](K8s.md) - Kubernetes resource icon catalog
- [JSAPI Examples](../../jsapi/examples/) - Working code examples
