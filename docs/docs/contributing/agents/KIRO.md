# Kiro / Kiro-CLI Support

This repository includes steering files for Kiro and Kiro-CLI to provide context-aware assistance when working with the codebase.

## Steering Files

Steering files are located in:

```
.kiro/steering/
```

These files provide Kiro with information about:

- Project structure and directory layout
- Technology stack and dependencies
- Code conventions and patterns
- Testing standards
- Deployment workflows

## Using Steering

Kiro automatically reads steering files from `.kiro/steering/` when working in the repository. No additional configuration is required.

## Extending Steering

To add new steering guidance:

1. Create a new `.md` file in `.kiro/steering/`
2. Document the relevant conventions, patterns, or context
3. Keep content concise and actionable

!!! tip "Steering Best Practices" - Focus on information that helps Kiro generate correct code - Document patterns that are specific to this repository - Avoid duplicating information already in README files

## Updating Steering

Update steering files when:

- New conventions or patterns are established
- Technology stack changes
- Directory structure is reorganized

Review steering files periodically to ensure they remain accurate and useful.
