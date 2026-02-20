# Installation

## Quick Install (npx from GitHub Release)

Run the MCP server directly without installing:

```bash
npx -y https://github.com/aws-samples/sample-drawio-mcp/releases/latest/download/drawio-mcp-server-latest.tgz --no-cache
```

The `--no-cache` flag ensures you always get the latest version without using a cached copy.

## MCP Client Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": [
        "-y",
        "https://github.com/aws-samples/sample-drawio-mcp/releases/latest/download/drawio-mcp-server-latest.tgz",
        "--no-cache"
      ],
      "type": "stdio"
    }
  }
}
```

### Claude Code / Kiro

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": [
        "-y",
        "https://github.com/aws-samples/sample-drawio-mcp/releases/latest/download/drawio-mcp-server-latest.tgz",
        "--no-cache"
      ],
      "type": "stdio"
    }
  }
}
```

### Pin to a Specific Version

Replace `latest/download` with the version tag and use the versioned filename:

```bash
npx -y https://github.com/aws-samples/sample-drawio-mcp/releases/download/v0.0.1/drawio-mcp-server-0.0.1.tgz
```

## From Source (Development)

```bash
git clone https://github.com/aws-samples/sample-drawio-mcp.git
cd sample-drawio-mcp/jsapi && npm ci && npm run build
cd ../mcp && npm run prepublishOnly && npm install
npm start
```
