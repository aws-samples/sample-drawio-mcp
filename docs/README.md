# Documentation

MkDocs-based documentation for the drawio-mcp project.

## Structure

```
docs/
├── mkdocs.yml           # MkDocs configuration
├── requirements.txt     # Python dependencies
├── Makefile             # Build commands
└── docs/
    └── Plans/           # Planning and design documents
        └── 01-DRAFT/    # Draft plans for features
```

## Building Documentation

### Prerequisites

```bash
pip install -r requirements.txt
```

### Commands

```bash
make serve    # Start local dev server
make build    # Build static site
```

## Plans Directory

The `Plans/` directory contains design documents for planned features:

- `api/` - API design proposals
- `docs/` - Documentation improvements
- `icons/` - Icon library plans
- `mcp/` - MCP server features
