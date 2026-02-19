# Releasing

This guide covers how to create a release of the `@drawio-mcp/server` MCP server package.

## How It Works

Releases are driven by git tags. When a tag matching `vX.Y.Z` is pushed to GitHub, a GitHub Actions workflow automatically:

1. Builds the `drawio-jsapi` SDK from TypeScript source
2. Vendors the built SDK into the MCP server package
3. Runs `npm pack` to produce a distributable tarball
4. Creates a GitHub Release with the tarball attached

The tarball is the same artifact that would be published to npmjs.com. Users install it directly via `npx`.

## Prerequisites

- Push access to the repository
- Python 3 installed (for the tagging script)
- All changes committed and pushed to `main`

## Creating a Release

### 1. Update the version

Edit the `version` field in `mcp/package.json`:

```json
{
  "name": "@drawio-mcp/server",
  "version": "0.1.0"
}
```

Commit the change:

```bash
git add mcp/package.json
git commit -m "chore: bump mcp server to 0.1.0"
git push origin main
```

### 2. Tag and push

Run the tagging script via Make:

```bash
make tag
```

This reads the version from `mcp/package.json`, creates a `v0.1.0` tag, and pushes it to GitHub. The output looks like:

```
✓ Created tag: v0.1.0
✓ Pushed tag: v0.1.0

GitHub Actions will now build and release mcp@0.1.0
  → https://github.com/aws-samples/sample-drawio-mcp/releases/tag/v0.1.0
```

### 3. Verify the release

After a few minutes, check the [Releases page](https://github.com/aws-samples/sample-drawio-mcp/releases) to confirm:

- The release was created with auto-generated release notes
- Two tarballs are attached: `drawio-mcp-server-0.1.0.tgz` and `drawio-mcp-server-latest.tgz`

Test the install:

```bash
npx -y https://github.com/aws-samples/sample-drawio-mcp/releases/latest/download/drawio-mcp-server-latest.tgz
```

## Testing a Release Before Tagging

The release workflow can be triggered manually against any branch to validate the build without creating a release.

1. Push the branch to GitHub
2. Go to **Actions** → **Release MCP Server** → **Run workflow**
3. Select the branch and click **Run workflow**
4. Once complete, download the tarball from the **Artifacts** section of the workflow run
5. Test locally:

```bash
# Unzip the downloaded artifact, then:
npx -y ./drawio-mcp-server-0.0.1.tgz
```

!!! note
    Manual workflow runs upload the tarball as a workflow artifact. They do not create a GitHub Release.

## Versioning

The project uses [semantic versioning](https://semver.org/). The version in `mcp/package.json` is the single source of truth.

| Change type | Version bump | Example |
|---|---|---|
| Bug fixes, minor tweaks | Patch | `0.0.1` → `0.0.2` |
| New tools, features | Minor | `0.0.2` → `0.1.0` |
| Breaking changes | Major | `0.1.0` → `1.0.0` |

!!! warning
    The `jsapi/package.json` version is managed separately. Bump it independently when the SDK itself changes.

## Troubleshooting

**Tag already exists** — If the tag for the current version already exists, either bump the version in `mcp/package.json` or delete the existing tag:

```bash
git tag -d v0.0.1
git push origin :refs/tags/v0.0.1
```

**Workflow failed** — Check the [Actions tab](https://github.com/aws-samples/sample-drawio-mcp/actions/workflows/release.yml) for build logs. Common causes are jsapi build failures or missing dependencies.

**Tarball missing from release** — Verify the `files` field in `mcp/package.json` includes `"src"` and `"vendor"`. Run `npm pack --dry-run` locally in the `mcp/` directory to inspect what would be included.
