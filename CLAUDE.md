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
- DOM isolation: all note UI must live inside a closed Shadow DOM — never inject into the host page DOM directly
- Keep docs updated with every code or feature change
- Keep Makefile updated — add new tasks as project evolves
