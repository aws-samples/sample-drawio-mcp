# custom-icon

Example demonstrating how to use custom images (SVG and PNG) in draw.io diagrams.

## What It Creates

A diagram showcasing six different methods for adding custom icons:

1. **SVG with insertImageVertex** - Using the convenience helper with SVG content
2. **PNG with insertImageVertex** - Using the convenience helper with PNG data
3. **SVG with insertVertex** - Manual style object approach
4. **PNG with insertVertex** - Manual style string approach
5. **Styled SVG** - Custom styling with shadow and opacity
6. **Stretched PNG** - Without aspect ratio constraint

## Running

```bash
npm install
npm start
```

Output: `output/custom-icons.drawio`

## Key Concepts Demonstrated

### Helper Functions

The example uses three new helper functions added to the JSAPI:

- **`createSvgDataUri(svgContent)`** - Converts SVG string to base64 data URI
- **`createImageDataUri(imageData, mimeType)`** - Converts image buffer/base64 to data URI
- **`insertImageVertex(options)`** - Convenience method for inserting image vertices

### Method 1: SVG with insertImageVertex (Recommended)

```javascript
const svgContent = readFileSync("red-dot.svg", "utf8");
const svgDataUri = api.createSvgDataUri(svgContent);

api.insertImageVertex({
  geometry: { x: 50, y: 50, width: 100, height: 100 },
  label: "My Icon",
  imageDataUri: svgDataUri,
});
```

**Advantages:**

- Clean, readable code
- Automatic aspect ratio preservation
- Built-in style defaults

### Method 2: PNG with createImageDataUri

```javascript
const pngBuffer = readFileSync("icon.png");
const pngDataUri = api.createImageDataUri(pngBuffer, "image/png");

api.insertImageVertex({
  geometry: { x: 200, y: 50, width: 100, height: 100 },
  label: "PNG Icon",
  imageDataUri: pngDataUri,
});
```

**Advantages:**

- Works with any raster format (PNG, JPG, GIF)
- Handles Buffer or base64 string input
- Automatic MIME type handling

### Method 3: Manual Style Object

```javascript
api.insertVertex({
  geometry: { x: 350, y: 50, width: 100, height: 100 },
  label: "Manual Style",
  style: {
    shape: "image",
    image: svgDataUri,
    aspect: "fixed",
  },
});
```

**Use when:**

- You need fine-grained control over all style properties
- Integrating with existing vertex creation code

### Method 4: Style String

```javascript
api.insertVertex({
  geometry: { x: 500, y: 50, width: 100, height: 100 },
  label: "Style String",
  style: `shape=image;image=${pngDataUri};aspect=fixed`,
});
```

**Use when:**

- Working with pre-existing style strings
- Copying styles from draw.io UI

### Custom Styling

Add shadows, opacity, and other effects:

```javascript
api.insertImageVertex({
  geometry: { x: 125, y: 200, width: 100, height: 100 },
  label: "Styled",
  imageDataUri: svgDataUri,
  styleOverrides: {
    shadow: "1",
    opacity: "80",
    strokeColor: "#0000FF",
    strokeWidth: "2",
  },
});
```

### Aspect Ratio Control

Disable aspect ratio preservation to stretch images:

```javascript
api.insertImageVertex({
  geometry: { x: 275, y: 200, width: 150, height: 80 },
  label: "Stretched",
  imageDataUri: pngDataUri,
  maintainAspect: false, // Allow stretching
});
```

## Image Files

### red-dot.svg

A simple red circle (64x64px). This demonstrates:

- Basic SVG with a single shape
- How SVG content is base64-encoded for embedding
- Scalability of vector graphics

**Base64 encoding process:**

```javascript
const svgContent = "<svg>...</svg>";
const base64 = Buffer.from(svgContent).toString("base64");
const dataUri = `data:image/svg+xml;base64,${base64}`;
```

### blue-dot.png

A simple blue circle (64x64px). This demonstrates:

- PNG image embedding
- Binary data handling
- Raster vs vector trade-offs

**Base64 encoding process:**

```javascript
const pngBuffer = readFileSync("icon.png");
const base64 = pngBuffer.toString("base64");
const dataUri = `data:image/png;base64,${base64}`;
```

## Data URI Format

Both methods produce data URIs in this format:

```
data:[MIME-type];base64,[base64-encoded-data]
```

Examples:

- `data:image/svg+xml;base64,PHN2ZyB4bWxucz0i...`
- `data:image/png;base64,iVBORw0KGgoAAAANSUhEU...`

These URIs are embedded directly in the diagram XML, making the diagram file self-contained and portable.

## MCP Tool Usage

The same functionality is available through the MCP server:

```javascript
// Using insert_image_vertex tool
{
  "tool": "insert_image_vertex",
  "arguments": {
    "geometry": { "x": 100, "y": 100, "width": 80, "height": 80 },
    "label": "Custom Icon",
    "svg_content": "<svg>...</svg>",
    "maintain_aspect": true
  }
}
```

Or with a pre-encoded data URI:

```javascript
{
  "tool": "insert_image_vertex",
  "arguments": {
    "geometry": { "x": 100, "y": 100, "width": 80, "height": 80 },
    "label": "Custom Icon",
    "image_data_uri": "data:image/png;base64,iVBORw0KG...",
    "style_overrides": { "shadow": "1" }
  }
}
```

## Best Practices

1. **Use SVG for icons and logos** - Better scalability and smaller file size
2. **Use PNG for photos or complex raster images** - Better rendering quality
3. **Optimize images before embedding** - Smaller images = smaller diagram files
4. **Use insertImageVertex for simple cases** - Cleaner code
5. **Use insertVertex for complex styling** - More control
6. **Set maintainAspect=true for icons** - Prevents distortion
7. **Consider file size** - Large embedded images increase diagram file size

## Limitations

- Embedded images increase diagram file size
- Very large images may impact draw.io performance
- External image URLs are not supported (images must be embedded)
- Some SVG features may not render identically in all contexts

## See Also

- [hello-drawio](../hello-drawio/) - Basic shapes and connections
- [hello-aws4](../hello-aws4/) - AWS architecture diagrams
- [Icon System Documentation](../../../docs/docs/icons/README.md) - Detailed icon system overview
