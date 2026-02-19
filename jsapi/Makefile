# ==============================================================================
# drawio-jsapi Build System
# ==============================================================================
#
# This Makefile provides build automation for the drawio-jsapi TypeScript SDK.
#
# Usage:
#   make              - Show available targets (default)
#   make build        - Build all distribution bundles
#   make test         - Run test suite
#   make clean        - Remove build artifacts
#
# Output:
#   dist/drawio-jsapi.esm.js   - ES Module for Node.js and bundlers
#   dist/drawio-jsapi.cjs.js   - CommonJS for older Node.js
#   dist/drawio-jsapi.min.js   - Minified UMD for browsers
#   dist/drawio-jsapi.d.ts     - TypeScript declarations
#
# ==============================================================================

.PHONY: help build build-watch test test-watch test-coverage typecheck clean install

# Default target - show help
help:
	@echo "drawio-jsapi Build System"
	@echo ""
	@echo "Usage:"
	@echo "  make install        Install dependencies"
	@echo "  make build          Build all distribution bundles"
	@echo "  make build-watch    Build in watch mode"
	@echo "  make test           Run test suite"
	@echo "  make test-watch     Run tests in watch mode"
	@echo "  make test-coverage  Run tests with coverage report"
	@echo "  make typecheck      Run TypeScript type checking"
	@echo "  make clean          Remove build artifacts"
	@echo ""

# ------------------------------------------------------------------------------
# Dependencies
# ------------------------------------------------------------------------------

## Install all npm dependencies
install:
	npm install

# ------------------------------------------------------------------------------
# Build Targets
# ------------------------------------------------------------------------------

## Build all distribution bundles (ESM, CJS, UMD, declarations)
build:
	npm run build

## Build in watch mode for development
build-watch:
	npm run build:watch

# ------------------------------------------------------------------------------
# Test Targets
# ------------------------------------------------------------------------------

## Run the test suite
test:
	npm test

## Run tests in watch mode
test-watch:
	npm run test:watch

## Run tests with coverage report
test-coverage:
	npm run test:coverage

# ------------------------------------------------------------------------------
# Type Checking
# ------------------------------------------------------------------------------

## Run TypeScript compiler in check-only mode
typecheck:
	npm run typecheck

# ------------------------------------------------------------------------------
# Cleanup
# ------------------------------------------------------------------------------

## Remove build artifacts and generated files
clean:
	rm -rf dist/
	rm -rf node_modules/.cache/
