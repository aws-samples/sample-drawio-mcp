# AWS Icon Update Script

This directory contains the maintenance script for updating AWS icons when new icon packages are released.

## Overview

AWS periodically releases updated icon packages. This script automates the process of extracting, processing, and integrating new icons into the jsapi library.

## Prerequisites

- Node.js 18+
- Icon package downloaded from AWS (Asset-Package_MMDDYYYY.hash format)
- Package placed in `.temp/` directory (gitignored)

## Usage

### Basic Update

```bash
cd jsapi
npm run update:icons -- /path/to/Asset-Package_MMDDYYYY.hash
```

### Example

```bash
# Download new icon package to .temp/
cd jsapi
npm run update:icons -- ../.temp/Asset-Package_01152026.abc123def456

# Output:
# Processing icons from: /path/to/Asset-Package_01152026.abc123def456
# ✓ Found 24 architecture categories
# ✓ Found 20 resource categories
# ✓ Found 25 category icons
# ✓ Processed 764 icons
# ✓ Generated TypeScript files
# ✓ Icon generation complete
```

## What the Script Does

1. **Validates Package Structure**
   - Checks for required directories
   - Verifies icon package format
   - Exits with error if invalid

2. **Extracts 48px SVGs**
   - Architecture Service Icons from `*/48/` directories
   - Resource Icons (already 48px)
   - Category Icons from `Arch-Category_48/`

3. **Processes Each Icon**
   - Converts SVG to base64 data URI
   - Extracts metadata (name, colors, dimensions)
   - Normalizes icon names

4. **Generates TypeScript Files**
   - Creates typed icon definition files
   - Organizes by category
   - Adds JSDoc comments

5. **Updates Exports**
   - Regenerates barrel exports
   - Updates icon registry

6. **Runs Validation**
   - Checks all icons have valid data URIs
   - Verifies consistent 48px dimensions
   - Reports any issues

## Directory Structure

```
jsapi/scripts/icon-update/
├── README.md                    # This file
├── update-icons.js              # Main CLI script
└── utils/
    ├── svg-to-datauri.js        # SVG → base64 converter
    ├── icon-metadata.js         # Metadata extractor
    └── validate-package.js      # Package validator
```

## Output Structure

Generated files are placed in `jsapi/src/stencils/aws4/icons/`:

```
icons/
├── architecture/
│   ├── analytics.ts
│   ├── compute.ts
│   ├── database.ts
│   └── ... (24 files)
├── resources/
│   ├── analytics.ts
│   ├── compute.ts
│   └── ... (20 files)
├── categories.ts
└── index.ts
```

## Icon Package Structure

Expected structure of AWS icon packages:

```
Asset-Package_MMDDYYYY.hash/
├── Architecture-Service-Icons_MMDDYYYY/
│   ├── Arch_Analytics/
│   │   ├── 16/
│   │   ├── 32/
│   │   ├── 48/          # ← Used by script
│   │   └── 64/
│   ├── Arch_Compute/
│   └── ... (24 categories)
├── Resource-Icons_MMDDYYYY/
│   ├── Res_Analytics/
│   │   └── *.svg        # ← Used by script (48px)
│   ├── Res_Compute/
│   └── ... (20 categories)
└── Category-Icons_MMDDYYYY/
    ├── Arch-Category_16/
    ├── Arch-Category_32/
    ├── Arch-Category_48/  # ← Used by script
    └── Arch-Category_64/
```

## Troubleshooting

### Error: "Invalid package structure"

**Cause:** Script cannot find expected directories.

**Solution:** Verify the package path and structure match the expected format.

### Error: "No SVG files found"

**Cause:** The 48px directories are empty or missing.

**Solution:** Check that the package includes 48px icons. Some older packages may only have 64px.

### Error: "SVG parsing failed"

**Cause:** Malformed SVG file.

**Solution:** Check the specific file mentioned in the error. May need to manually fix or exclude.

### Icons not appearing in build

**Cause:** TypeScript files generated but not imported.

**Solution:** Run `npm run build` to regenerate the full build with new icons.

## Updating the Script

If AWS changes their icon package structure:

1. Update `validate-package.js` with new structure
2. Modify path patterns in `update-icons.js`
3. Update this README with new structure
4. Test with new package format

## Testing

After running the update script:

```bash
# Run icon validation tests
npm test -- aws4-icons.test.ts

# Build and verify
npm run build

# Check bundle size
ls -lh dist/
```

## Version Control

**Do NOT commit:**

- `.temp/` directory (icon packages)
- Large icon package files

**Do commit:**

- Generated TypeScript files in `src/stencils/aws4/icons/`
- Updated exports and barrel files
- This README if structure changes

## Maintenance Schedule

AWS typically releases icon updates:

- Quarterly for minor updates
- As needed for new services
- Annually for major redesigns

Check for updates: https://aws.amazon.com/architecture/icons/

## Support

For issues with:

- **Script errors:** Check this README and troubleshooting section
- **Icon rendering:** Test in draw.io, check SVG validity
- **Missing icons:** Verify they exist in the source package
- **Build failures:** Check TypeScript compilation errors

## Related Documentation

- [AWS Icon Update Plan](../../../docs/docs/plans/aws-icon-update.md)
- [AWS4Styles Documentation](../../src/stencils/aws4/README.md)
- [Icon Integration Guide](../../../docs/icon-integration.md)
