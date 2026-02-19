.PHONY: help tag-release lint lint-ci

help:
	@echo "Available targets:"
	@echo "  lint           Format and fix all linting issues"
	@echo "  lint-ci        Check formatting and linting (fails on violations)"
	@echo "  tag-release    Tag repository with mcp package version and push to remote"

# Format and fix all linting issues
lint:
	npm run lint

# Check formatting and linting without fixing (for CI)
lint-ci:
	npm run lint:ci

# Tag and push release based on mcp/package.json version
# This will trigger the GitLab CI pipeline to publish the npm package
tag:
	@python3 scripts/tag_and_push.py
