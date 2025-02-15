# Tab Sticky Notes

Manifest V3 Chrome extension for per-page persistent sticky notes (vanilla JS, no dependencies).

## Build Commands

```bash
make lint       # Check JS syntax with node --check
make validate   # Validate manifest.json
make build      # Package zip for Chrome Web Store
```

## Critical Rules

- Vanilla JS only — no frameworks, no build step, no external dependencies
- CSS isolation: all note styles must use `!important` to override host page CSS
- Keep docs updated with every code or feature change
- Keep Makefile updated — add new tasks as project evolves
