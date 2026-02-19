#!/usr/bin/env python3

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
Tag repository with version from mcp/package.json and push to remote.

This script automates the release process by:
1. Reading the version number from mcp/package.json
2. Creating a git tag with the format v{version} (e.g., v0.1.0)
3. Pushing the tag to the remote repository

The tag push triggers the GitLab CI pipeline to publish the npm package
to the GitLab package registry.

Usage:
    python3 scripts/tag_and_push.py
    # or
    make tag-release

Requirements:
    - Git repository with remote configured
    - mcp/package.json with valid version field
    - Appropriate git permissions to create and push tags
"""

import json
import subprocess  # nosec B404
import sys
from pathlib import Path


def main():
    """Create and push git tag based on mcp package version."""
    # Read version from mcp/package.json
    package_json = Path(__file__).parent.parent / "mcp" / "package.json"

    try:
        with open(package_json) as f:
            version = json.load(f)["version"]
    except FileNotFoundError:
        print(f"Error: {package_json} not found", file=sys.stderr)
        sys.exit(1)
    except KeyError:
        print("Error: 'version' field not found in package.json", file=sys.stderr)
        sys.exit(1)

    tag = f"v{version}"

    # Create and push tag
    try:
        subprocess.run(["git", "tag", tag], check=True)  # nosec B603 B607
        print(f"✓ Created tag: {tag}")

        subprocess.run(["git", "push", "origin", tag], check=True)  # nosec B603 B607
        print(f"✓ Pushed tag: {tag}")
        print(f"\nGitLab CI will now publish mcp@{version} to the package registry")
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
