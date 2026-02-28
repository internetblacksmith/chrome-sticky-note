# Tab Sticky Notes

A Chrome extension for adding persistent sticky notes to any webpage. Notes are saved per URL and automatically cleaned up when tabs are closed.

## Features

- Per-URL note persistence across page reloads
- Cross-tab sync — edits, moves, and deletes appear in all tabs on the same URL
- Drag-and-drop repositioning via note header
- Pin notes to keep them across tab close/reopen
- Auto-save while typing
- CSS isolation from host page styles
- Automatic cleanup of unpinned notes on tab close

## Installation

1. Download the latest `tab-sticky-notes.zip` from the [Releases page](https://github.com/internetblacksmith/chrome-sticky-note/releases)
2. Unzip the archive
3. Open `chrome://extensions/` in Chrome
4. Enable **Developer mode** (top-right toggle)
5. Click **Load unpacked** and select the unzipped folder

> **Note:** A Chrome Web Store listing is planned. Until then, the extension must be side-loaded using the steps above.

## Usage

Click the extension icon in the Chrome toolbar and select **Add Sticky Note**. A yellow note appears on the page — type to edit, drag the header to move, and click **x** to delete.

### Pin / Unpin

Click the pin icon on a note to pin it. Pinned notes survive tab close and reappear when you revisit the URL. Click the pin icon again to unpin.

### Note Limits

- Maximum 50 notes per URL
- 5 000 characters per note

## Permissions

| Permission | Why |
|-----------|-----|
| `activeTab` | Inject sticky note UI into the current page |
| `storage` | Save and load notes locally |
| `scripting` | Programmatically inject the content script |
| `tabs` | Detect tab close events for automatic cleanup |

All data is stored locally. No data leaves your browser.

## Technical Details

- **Manifest V3** with service worker background script
- **Storage**: Chrome local storage, keyed by `hostname + pathname`, synced across tabs via `storage.onChanged`
- **Limits**: 50 notes per URL, 5 000 characters per note
- **Minimum Chrome**: 88
- **Dependencies**: None (vanilla JavaScript)

## Privacy

All notes are stored locally on your device. The extension does not collect, transmit, or share any data. See [docs/privacy-policy.md](docs/privacy-policy.md) for the full privacy policy.

## Development

### Project Structure

```
chrome-sticky-note/
├── manifest.json       # Extension configuration (MV3)
├── content.js          # StickyNoteManager — note CRUD and persistence
├── background.js       # TabCleanupManager — tab lifecycle and orphan cleanup
├── popup.html/js       # Extension popup interface
├── test.html           # Manual test page
├── icon*.png / .svg    # Extension icons
└── docs/               # Privacy policy and permission docs
```

### Commands

```bash
make lint       # Check JS syntax
make validate   # Validate manifest.json
make build      # Package zip for Chrome Web Store
```

### Testing

Open `test.html` locally or load the unpacked extension and test on any webpage. See `test.html` for the full manual test checklist.

## License

[MIT](LICENSE)
