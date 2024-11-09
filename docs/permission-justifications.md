# Permission Justifications for Chrome Web Store

## For Store Listing Description

### Why Tab Sticky Notes Needs These Permissions:

**"Read and change all your data on all websites"**
- This appears because the extension needs to add the sticky note interface to web pages
- Your notes are ONLY stored locally on your device
- We NEVER collect, transmit, or access your browsing data
- The extension only activates when you choose to create a note

**"Manage your apps, extensions, and themes"** (storage)
- Required to save your sticky notes locally on your computer
- All data stays on your device - nothing is sent to external servers
- Allows your notes to persist between browser sessions

**"View and manage your tabs"** (tabs)
- Used solely to clean up notes when you close a tab
- Prevents memory bloat by removing notes from closed pages
- Does NOT track your browsing history or tab activity

## Detailed Justifications (For Developer Dashboard)

### activeTab
**Justification:** This permission is essential for the extension's core functionality. When a user clicks the extension icon, we need to inject the sticky note interface into the current webpage. This permission is the least invasive way to add functionality to web pages, as it only grants access to the tab where the user explicitly invokes the extension.

### storage
**Justification:** Critical for saving sticky notes between page reloads and browser sessions. We use Chrome's local storage API to save note content, positions, and settings. All data is stored locally on the user's device with no external transmission. Without this permission, notes would disappear every time the page refreshes, making the extension unusable.

### scripting
**Justification:** Required to programmatically inject the sticky note functionality when users click the extension from the toolbar. This allows users to add notes to pages they're already viewing without having to reload. The scripting permission works in conjunction with activeTab to ensure we only modify pages where the user has explicitly requested sticky notes.

### tabs
**Justification:** This permission serves a single purpose: detecting when tabs are closed so we can clean up associated sticky notes from storage. This prevents the accumulation of orphaned data and keeps the extension's storage usage minimal. We only access tab lifecycle events (open/close/navigate) and do not read tab contents, history, or any other browsing data.

### Content Scripts on All URLs
**Justification:** The content script runs on all URLs so sticky notes load automatically when revisiting a page. The script is lightweight and only renders note UI when notes exist for the current URL. No data is collected or transmitted.

## Privacy-Focused Design

Emphasize in your listing:
- **100% Local Storage**: All notes stay on your device
- **No Data Collection**: We don't track, analyze, or transmit any information
- **No External Servers**: The extension works entirely offline
- **Automatic Cleanup**: Notes are deleted when tabs close, ensuring privacy

## Single Purpose Statement

"Tab Sticky Notes has a single, clear purpose: to let users add temporary sticky notes to web pages that persist only while the tab remains open. All features support this core functionality of creating, editing, and managing page-specific notes."

## For the Privacy Policy Field

Link to your hosted privacy policy and include this summary:
"Tab Sticky Notes stores all data locally on your device. We do not collect, transmit, or have access to any of your personal information, browsing data, or note contents. Notes are automatically deleted when you close tabs."

## Tips for Approval

1. **Be Specific**: Explain exactly what each permission does in your extension
2. **Emphasize Privacy**: Repeatedly mention local-only storage and no data collection
3. **Explain User Benefits**: Frame permissions in terms of features users want
4. **Be Transparent**: Don't hide or minimize permission requirements
5. **Keep it Simple**: Use plain language that non-technical users understand

## Example Store Description Section

```
PRIVACY & PERMISSIONS

Tab Sticky Notes requires a few permissions to work properly:

- Add notes to websites - We need to inject the note interface when you want to create a note
- Save your notes - Your notes are stored locally on your computer (never on our servers)
- Clean up closed tabs - We remove notes when you close tabs to keep your browser fast

Your privacy is our priority:
- All data stored locally on your device
- No tracking or analytics
- No external server connections
- Notes automatically deleted when tabs close
```
