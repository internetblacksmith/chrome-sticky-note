# Permission Justifications

Text to paste into the Chrome Web Store Developer Dashboard fields.

## Single Purpose

Allows users to create and manage sticky notes on any webpage.

## Permission Justifications

### activeTab

Required to inject the sticky note UI into the current page when the user clicks the extension icon.

### storage

Saves note content, positions, and pin state locally on the user's device. Without this permission notes would not persist across page reloads. No data is transmitted externally.

### scripting

Injects the content script into pages the user is already viewing when they click the extension icon, without requiring a page reload.

### tabs

Detects tab close events to clean up unpinned notes from storage, preventing orphaned data from accumulating.

### Content Scripts on All URLs (`<all_urls>`)

The content script runs on all URLs so saved notes load automatically when the user revisits a page. The script only renders UI when notes exist for the current URL. No data is collected or transmitted.

## Store Listing Privacy Summary

Tab Sticky Notes stores all data locally on your device using Chrome's local storage API. No data is collected, transmitted, or shared. Notes are automatically deleted when you close tabs.
