class TabCleanupManager {
  constructor() {
    this.activeTabs = new Map();
    this.init();
  }

  init() {
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
      this.cleanupTabNotes(tabId);
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.url) {
        this.handleTabUrlChange(tabId, changeInfo.url, tab);
      }
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.trackActiveTab(activeInfo.tabId);
    });

    this.trackExistingTabs();
  }

  async trackExistingTabs() {
    try {
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
          const storageKey = this.generateStorageKey(tab.url);
          this.activeTabs.set(tab.id, {
            url: tab.url,
            storageKey: storageKey
          });
        }
      });
    } catch (error) {
    }
  }

  trackActiveTab(tabId) {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) return;
      
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        const storageKey = this.generateStorageKey(tab.url);
        this.activeTabs.set(tabId, {
          url: tab.url,
          storageKey: storageKey
        });
      }
    });
  }

  handleTabUrlChange(tabId, newUrl, tab) {
    const oldTabInfo = this.activeTabs.get(tabId);
    
    if (oldTabInfo && oldTabInfo.url !== newUrl) {
      this.cleanupTabNotes(tabId, oldTabInfo.storageKey);
    }

    if (newUrl && !newUrl.startsWith('chrome://') && !newUrl.startsWith('chrome-extension://')) {
      const storageKey = this.generateStorageKey(newUrl);
      this.activeTabs.set(tabId, {
        url: newUrl,
        storageKey: storageKey
      });
    }
  }

  generateStorageKey(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace(/[^a-zA-Z0-9.-]/g, '');
      const pathname = urlObj.pathname.replace(/[^a-zA-Z0-9/.-]/g, '');
      return `sticky_notes_${hostname}_${pathname}`;
    } catch (error) {
      return null;
    }
  }

  cleanupTabNotes(tabId, storageKey = null) {
    const tabInfo = this.activeTabs.get(tabId);
    const keyToClean = storageKey || (tabInfo ? tabInfo.storageKey : null);
    
    if (keyToClean) {
      chrome.storage.local.get([keyToClean, 'pinnedNotes'], (result) => {
        if (result[keyToClean]) {
          const notes = result[keyToClean];
          const pinnedNotes = result.pinnedNotes || {};
          
          // Filter out pinned notes from cleanup
          const notesToClean = {};
          let unpinnedCount = 0;
          
          Object.keys(notes).forEach(noteId => {
            if (!pinnedNotes[noteId]) {
              notesToClean[noteId] = notes[noteId];
              unpinnedCount++;
            }
          });
          
          // Only keep pinned notes in storage
          const pinnedNotesForTab = {};
          Object.keys(notes).forEach(noteId => {
            if (pinnedNotes[noteId]) {
              pinnedNotesForTab[noteId] = notes[noteId];
            }
          });
          
          if (Object.keys(pinnedNotesForTab).length > 0) {
            // Keep pinned notes
            chrome.storage.local.set({ [keyToClean]: pinnedNotesForTab }, () => {
              if (unpinnedCount > 0) {
              }
            });
          } else {
            // No pinned notes, remove the key entirely
            chrome.storage.local.remove([keyToClean], () => {
              if (unpinnedCount > 0) {
              }
            });
          }
        }
      });
    }
    
    this.activeTabs.delete(tabId);
  }

  async cleanupOrphanedNotes() {
    try {
      const allStorage = await chrome.storage.local.get();
      const activeTabs = await chrome.tabs.query({});
      
      const activeStorageKeys = new Set();
      activeTabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
          const storageKey = this.generateStorageKey(tab.url);
          if (storageKey) {
            activeStorageKeys.add(storageKey);
          }
        }
      });

      const pinnedNotes = allStorage.pinnedNotes || {};
      const orphanedKeys = [];
      const keysToUpdate = {};
      
      Object.keys(allStorage).forEach(key => {
        if (key.startsWith('sticky_notes_') && !activeStorageKeys.has(key)) {
          const notes = allStorage[key];
          const pinnedNotesForKey = {};
          
          // Check if this key has any pinned notes
          Object.keys(notes).forEach(noteId => {
            if (pinnedNotes[noteId]) {
              pinnedNotesForKey[noteId] = notes[noteId];
            }
          });
          
          if (Object.keys(pinnedNotesForKey).length > 0) {
            // Keep the key but only with pinned notes
            keysToUpdate[key] = pinnedNotesForKey;
          } else {
            // No pinned notes, mark for removal
            orphanedKeys.push(key);
          }
        }
      });

      // Update keys with only pinned notes
      if (Object.keys(keysToUpdate).length > 0) {
        chrome.storage.local.set(keysToUpdate);
      }

      if (orphanedKeys.length > 0) {
        chrome.storage.local.remove(orphanedKeys, () => {
        });
      }
    } catch (error) {
    }
  }
}

// Create single instance of cleanup manager
const cleanupManager = new TabCleanupManager();

chrome.runtime.onStartup.addListener(() => {
  cleanupManager.cleanupOrphanedNotes();
});

chrome.runtime.onInstalled.addListener(() => {
  cleanupManager.cleanupOrphanedNotes();
});

// Periodic cleanup every 5 minutes
setInterval(() => {
  cleanupManager.cleanupOrphanedNotes();
}, 300000);