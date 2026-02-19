# Development

This guide covers the development workflow for the drawio-mcp project.

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- Git

## Repository Structure

The project is organized as a monorepo:

- `jsapi/` - Core JavaScript SDK for creating draw.io diagrams
- `mcp/` - MCP server that exposes the SDK via Model Context Protocol
- `jsapi/examples/` - Example implementations
- `docs/` - MkDocs documentation

## Initial Setup

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd drawio-mcp

# Install root dependencies (Prettier, ESLint)
npm install

# Install jsapi dependencies
cd jsapi
npm install

# Install mcp dependencies and set up vendor directory
cd ../mcp
npm run prepublishOnly
npm install
```

The `prepublishOnly` script builds the jsapi library and copies it to the `mcp/vendor` directory. This step is required for local development since the MCP server depends on the built jsapi artifacts.

### Editor Setup

#### VSCode (Recommended)

Copy the example settings to enable format-on-save and linting:

```bash
# Settings are already configured in .vscode/settings.json
# For reference, see .vscode/settings.example.json
```

Install recommended extensions when prompted, or manually install:

- Prettier - Code formatter (`esbenp.prettier-vscode`)
- ESLint (`dbaeumer.vscode-eslint`)
- EditorConfig (`editorconfig.editorconfig`)

The workspace is configured to:

- Format files on save using Prettier
- Auto-fix ESLint issues on save
- Use LF line endings
- Insert final newline
- Trim trailing whitespace (except in Markdown)

#### Other Editors

The project includes `.editorconfig` for cross-editor consistency. Most modern editors support EditorConfig natively or via plugins.

## Development Workflow

### Code Formatting and Linting

The project uses Prettier for formatting and ESLint for linting. All code must pass formatting and linting checks before merging.

```bash
# From repository root

# Format and fix all issues
npm run lint
# or
make lint

# Check formatting and linting (CI mode - fails on violations)
npm run lint:ci
# or
make lint-ci

# Format only (no linting)
npm run format

# Check format only (no fixing)
npm run format:check
```

You can also run these commands from individual packages (`jsapi/` or `mcp/`).

**Note:** The CI pipeline automatically runs `lint:ci` and will fail if there are any formatting or linting violations.

### Working on JSAPI

```bash
cd jsapi

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the library
npm run build

# Build in watch mode
npm run build:watch
```

### Working on MCP Server

```bash
cd mcp

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Start the server
npm start
```

### Updating JSAPI in MCP

When changes are made to the jsapi library, update the vendored copy in the MCP server:

```bash
cd mcp
npm run prepublishOnly
```

This rebuilds jsapi and copies the updated artifacts to the vendor directory.

## Testing

Run tests for both packages:

```bash
# From repository root
(cd jsapi && npm test) && (cd mcp && npm test)
```

Both packages use Vitest for testing. Test files are located in the `test/` directory of each package.

## Code Style

The project uses automated formatting and linting:

- **Prettier** - Code formatting with default settings (2 spaces, LF line endings)
- **ESLint** - Linting with TypeScript support
- **EditorConfig** - Cross-editor consistency

### Style Guidelines

- Use ES modules (`import`/`export`)
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for public APIs
- Prefix intentionally unused parameters with underscore (`_param`)

### Configuration Files

- `.prettierrc.json` - Prettier configuration (minimal, uses defaults)
- `eslint.config.js` - ESLint flat config (ESLint 9+)
- `.editorconfig` - Editor settings
- `.vscode/settings.json` - VSCode workspace settings
- `.vscode/settings.example.json` - Reference settings for team members

## Debugging

### MCP Server

Set the log level to see detailed output:

```bash
export DRAWIO_MCP_LOG_LEVEL=DEBUG
npm start
```

Available log levels: `DEBUG`, `INFO`, `WARN`, `ERROR`

### JSAPI

The jsapi library includes mock DOM objects for testing without a browser. See `jsapi/src/mocks/` for implementation details.

## Documentation

Documentation is built with MkDocs:

```bash
cd docs
pip install -r requirements.txt
mkdocs serve
```

The documentation site is available at `http://localhost:8000`.
