# hello-drawio

Basic example demonstrating how to create a simple flowchart diagram with the drawio-jsapi SDK.

## What It Creates

A flowchart with:

- Start/End nodes (green rounded rectangles)
- Process nodes (blue rectangles)
- Decision node (yellow diamond)
- Error node (red rectangle)
- Orthogonal edge connections with labels

## Running

```bash
npm install
npm start
```

Output: `output/hello-flowchart.drawio`

## Key Concepts Demonstrated

- Creating a `DiagramEngine` instance
- Inserting vertices with `api.cells.insertVertex()`
- Styling shapes with fill colors, stroke colors, and shapes
- Connecting shapes with `api.cells.insertEdge()`
- Saving diagrams with `engine.saveToFile()`
