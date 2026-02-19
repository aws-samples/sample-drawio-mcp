# Kubernetes Icons Catalog Example

This example generates a comprehensive visual catalog of all Kubernetes icons available in the DrawIO JSAPI.

## What It Does

The script creates a tall diagram (8.5" wide, variable height) that displays all Kubernetes resource icons organized by category. Each icon is labeled with its resource name, making it easy to browse available icons and their identifiers.

## Running the Example

```bash
npm install
npm start
```

The generated diagram will be saved to `output/k8s-icons-catalog.drawio`.

## Output

The diagram includes:

- All Kubernetes icon categories (Workloads, Networking, Storage, Config, RBAC, Cluster, Control Plane)
- Icons arranged in a grid layout with labels
- Category headers separating each section
- Approximately 39 Kubernetes resource icons

The diagram is designed to fit on 8.5" wide paper and extends vertically to accommodate all icons.

## Use Cases

This catalog is useful for:

- Discovering available Kubernetes icons and their identifiers
- Reference when building Kubernetes architecture diagrams
- Visual documentation of the icon library
- Selecting appropriate icons for your diagrams
