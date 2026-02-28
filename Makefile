.DEFAULT_GOAL := menu

EXTENSION_DIR := $(shell pwd)
ZIP_NAME := tab-sticky-notes.zip

menu:
	@echo "╔══════════════════════════════════════════════════════╗"
	@echo "║        Tab Sticky Notes - Command Menu              ║"
	@echo "╚══════════════════════════════════════════════════════╝"
	@echo ""
	@echo "  === Development ==="
	@echo "  1) Validate manifest"
	@echo "  2) Check JS syntax"
	@echo ""
	@echo "  === Packaging ==="
	@echo "  3) Build zip for Chrome Web Store"
	@echo "  4) Clean build artifacts"
	@echo ""
	@echo "  === Info ==="
	@echo "  5) Show extension version"
	@echo "  6) List extension files"
	@echo ""
	@read -p "Enter choice: " choice; \
	case $$choice in \
		1) $(MAKE) validate ;; \
		2) $(MAKE) lint ;; \
		3) $(MAKE) build ;; \
		4) $(MAKE) clean ;; \
		5) $(MAKE) version ;; \
		6) $(MAKE) files ;; \
		*) echo "Invalid choice" ;; \
	esac

validate: ## Validate manifest.json is valid JSON
	@echo "Validating manifest.json..."
	@python3 -c "import json; json.load(open('manifest.json')); print('manifest.json is valid')"

lint: ## Check JS files for syntax errors
	@echo "Checking JavaScript syntax..."
	@for f in *.js; do \
		node --check "$$f" && echo "  $$f: OK" || echo "  $$f: ERROR"; \
	done

build: clean ## Build zip for Chrome Web Store submission
	@echo "Building extension zip..."
	@zip -r $(ZIP_NAME) \
		manifest.json \
		content.js \
		background.js \
		popup.html \
		popup.js \
		icon16.png \
		icon48.png \
		icon128.png \
		-x ".*"
	@echo "Built: $(ZIP_NAME)"

clean: ## Remove build artifacts
	@rm -f $(ZIP_NAME)
	@echo "Cleaned build artifacts"

version: ## Show current extension version
	@python3 -c "import json; print(json.load(open('manifest.json'))['version'])"

files: ## List all extension files
	@echo "Extension files:"
	@ls -la *.js *.json *.html *.png 2>/dev/null

help: ## Show all commands with descriptions
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  make %-12s - %s\n", $$1, $$2}'

list: ## Quick reference of all targets
	@grep -E '^[a-zA-Z_-]+:' $(MAKEFILE_LIST) | cut -d: -f1 | sort

.PHONY: menu validate lint build clean version files help list
