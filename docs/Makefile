# Documentation Makefile

# Load .env file if it exists (values override defaults below)
-include .env

PORT?=8000

.PHONY: help install docs build clean rebuild dev validate serve-strict ghpages

# Default target
help:
	@echo "Documentation"
	@echo ""
	@echo "Usage:"
	@echo "  make install       Install Python dependencies"
	@echo "  make docs          Start local development server (http://127.0.0.1:8000)"
	@echo "  make build         Build static documentation site"
	@echo "  make clean         Remove generated site directory"
	@echo "  make rebuild       Clean and rebuild the site"
	@echo "  make validate      Build with strict mode and check for warnings"
	@echo "  make serve-strict  Serve with strict mode (fails on warnings)"
	@echo "  make ghpages       Deploy documentation to GitHub Pages"
	@echo ""

# Install dependencies
install:
	pip install -r requirements.txt

# Start development server
docs:
	python3 -m mkdocs serve --livereload -a 127.0.0.1:$(PORT)

# Alias for docs
dev: docs

# Build static site
build:
	python3 -m mkdocs build

# Clean generated files
clean:
	rm -rf site/

# Clean and rebuild from scratch
rebuild: clean build

# Validate the documentation build
validate: build
	@echo "Checking for broken links and warnings..."
	python3 -m mkdocs build --strict 2>&1 | grep -E "(WARNING|ERROR)" || echo "No warnings or errors found!"

# Serve with strict mode (fails on warnings)
serve-strict:
	python3 -m mkdocs serve --strict

# Deploy to GitHub Pages
ghpages:
	python3 -m mkdocs gh-deploy --force
