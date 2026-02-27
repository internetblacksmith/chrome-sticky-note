class StickyNoteManager {
  constructor() {
    this.notes = new Map();
    this.noteCounter = 0;
    this._saveTimers = new Map();
    this._syncingFromStorage = false;
    this.tabId = this.generateTabId();
    if (!this.tabId) return;
    this.maxNotes = 50;
    this._shadowStyles = null;
    this.loadNotes();
    this.init();
  }

  generateTabId() {
    try {
      if (!window.location || !window.location.hostname) {
        return null;
      }
      const urlObj = new URL(window.location.href);
      return `sticky_notes_${urlObj.origin}${urlObj.pathname}`;
    } catch (error) {
      console.warn('[TabStickyNotes] Failed to generate storage key:', error);
      return null;
    }
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.loadPinnedNotes();
      });
    } else {
      this.loadPinnedNotes();
    }
    this.setupMessageListener();
    this._setupStorageSync();
  }

  _debouncedSave(noteId, text, x, y, isPinned) {
    const existing = this._saveTimers.get(noteId);
    if (existing) clearTimeout(existing);
    this._saveTimers.set(noteId, setTimeout(() => {
      this._saveTimers.delete(noteId);
      this.saveNote(noteId, text, x, y, isPinned);
    }, 300));
  }

  _getShadowStyles() {
    if (this._shadowStyles) return this._shadowStyles;

    this._shadowStyles = `
      :host {
        all: initial !important;
        display: block !important;
        position: fixed !important;
        z-index: 2147483647 !important;
        contain: layout style !important;
      }

      .sticky-note {
        all: initial !important;
        display: block !important;
        position: relative !important;
        width: 200px !important;
        min-width: 200px !important;
        min-height: 150px !important;
        background: #ffeb3b !important;
        border: 1px solid #fbc02d !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        font-family: Arial, sans-serif !important;
        font-size: 14px !important;
        line-height: normal !important;
        resize: both !important;
        overflow: hidden !important;
        color: #333 !important;
        direction: ltr !important;
        box-sizing: border-box !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        backface-visibility: hidden !important;
        -webkit-backface-visibility: hidden !important;
        transform-origin: center !important;
      }

      .sticky-note * {
        all: unset !important;
        font-family: Arial, sans-serif !important;
        box-sizing: border-box !important;
      }

      .sticky-note textarea {
        display: block !important;
        width: 100% !important;
        height: 120px !important;
        padding: 10px !important;
        font-family: Arial, sans-serif !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
        color: #333 !important;
        background: transparent !important;
        border: none !important;
        user-select: text !important;
        -webkit-user-select: text !important;
        resize: none !important;
        overflow-wrap: break-word !important;
        word-wrap: break-word !important;
        white-space: pre-wrap !important;
        text-align: left !important;
        cursor: text !important;
      }

      .sticky-note textarea:focus {
        outline: 2px solid #fbc02d !important;
        outline-offset: -2px !important;
      }

      .sticky-note-header {
        display: flex !important;
        padding: 8px !important;
        background: #fbc02d !important;
        cursor: move !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        touch-action: none !important;
        justify-content: space-between !important;
        align-items: center !important;
        border-radius: 8px 8px 0 0 !important;
        font-size: 12px !important;
        font-weight: bold !important;
        color: #333 !important;
        gap: 4px !important;
      }

      .sticky-note-header span {
        display: block !important;
        font-size: 12px !important;
        font-weight: bold !important;
        color: #333 !important;
        line-height: 20px !important;
        text-align: left !important;
        flex-grow: 1 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .sticky-note-header button {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 20px !important;
        height: 20px !important;
        padding: 0 !important;
        margin: 0 !important;
        background: none !important;
        border: none !important;
        cursor: pointer !important;
        font-size: 14px !important;
        color: #333 !important;
        line-height: 1 !important;
        transition: background-color 0.2s ease !important;
        border-radius: 50% !important;
        flex-shrink: 0 !important;
      }

      .sticky-note-header button:hover {
        background: rgba(0,0,0,0.1) !important;
      }

      .sticky-note-close {
        font-size: 16px !important;
      }

      .sticky-note textarea:focus,
      .sticky-note-header button:focus {
        outline: 2px solid #fbc02d !important;
        outline-offset: 2px !important;
      }

      @media (max-width: 768px) {
        .sticky-note {
          min-width: 150px !important;
          max-width: 300px !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .sticky-note,
        .sticky-note-header button {
          transition: none !important;
        }
      }
    `;
    return this._shadowStyles;
  }

  _showToast(message) {
    const host = document.createElement('div');
    host.setAttribute('data-sticky-note-toast', '');
    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial !important;
        display: block !important;
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        z-index: 2147483647 !important;
      }
      .toast {
        background: #333 !important;
        color: #fff !important;
        padding: 12px 20px !important;
        border-radius: 8px !important;
        font-size: 14px !important;
        font-family: Arial, sans-serif !important;
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
      }
      .toast.visible {
        opacity: 1 !important;
      }
    `;
    shadow.appendChild(style);

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    shadow.appendChild(toast);

    document.body.appendChild(host);
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => host.remove(), 300);
    }, 3000);
  }

  createStickyNote(x = 100, y = 100, text = '', id = null, isPinned = false) {
    try {
      if (this.notes.size >= this.maxNotes) {
        this._showToast('Maximum number of sticky notes reached (50). Please delete some notes first.');
        return null;
      }

      const noteId = id || `note_${this.noteCounter++}`;
      if (id) {
        const match = id.match(/^note_(\d+)$/);
        if (match) {
          this.noteCounter = Math.max(this.noteCounter, parseInt(match[1]) + 1);
        }
      }

      // Shadow DOM host element
      const host = document.createElement('div');
      host.setAttribute('data-sticky-note-id', noteId);
      host.style.setProperty('position', 'fixed', 'important');
      host.style.setProperty('left', x + 'px', 'important');
      host.style.setProperty('top', y + 'px', 'important');
      host.style.setProperty('z-index', '2147483647', 'important');

      const shadow = host.attachShadow({ mode: 'closed' });

      const style = document.createElement('style');
      style.textContent = this._getShadowStyles();
      shadow.appendChild(style);

      const noteContainer = document.createElement('div');
      noteContainer.className = 'sticky-note';

      const header = document.createElement('div');
      header.className = 'sticky-note-header';

      const title = document.createElement('span');
      title.textContent = 'Sticky Note';

      const pinButton = document.createElement('button');
      pinButton.className = 'sticky-note-pin';
      pinButton.textContent = isPinned ? '\u{1F4CC}' : '\u{1F4CD}';
      pinButton.title = isPinned ? 'Unpin note' : 'Pin note';
      pinButton.style.setProperty('opacity', isPinned ? '1' : '0.5', 'important');

      pinButton.addEventListener('click', () => {
        const note = this.notes.get(noteId);
        if (note) {
          const newPinStatus = !note.isPinned;
          note.isPinned = newPinStatus;
          pinButton.textContent = newPinStatus ? '\u{1F4CC}' : '\u{1F4CD}';
          pinButton.title = newPinStatus ? 'Unpin note' : 'Pin note';
          pinButton.style.setProperty('opacity', newPinStatus ? '1' : '0.5', 'important');
          this.saveNote(noteId, note.text, note.x, note.y, newPinStatus);

          if (newPinStatus) {
            this.savePinnedNoteGlobally({
              id: noteId,
              text: note.text,
              x: note.x,
              y: note.y,
              url: window.location.href
            });
          } else {
            this.removePinnedNoteGlobally(noteId);
          }
        }
      });

      const closeButton = document.createElement('button');
      closeButton.className = 'sticky-note-close';
      closeButton.textContent = '\u00D7';

      closeButton.addEventListener('click', () => {
        this.deleteNote(noteId);
      });

      header.appendChild(title);
      header.appendChild(pinButton);
      header.appendChild(closeButton);

      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.maxLength = 5000;

      textarea.addEventListener('input', () => {
        const note = this.notes.get(noteId);
        if (note) note.text = textarea.value;
        this._debouncedSave(
          noteId,
          textarea.value,
          parseInt(host.style.left),
          parseInt(host.style.top),
          note ? note.isPinned : false
        );
      });

      noteContainer.appendChild(header);
      noteContainer.appendChild(textarea);
      shadow.appendChild(noteContainer);

      const cleanupDrag = this.makeDraggable(host, header, noteId);

      document.body.appendChild(host);
      textarea.focus();

      this.notes.set(noteId, {
        text: text,
        x: x,
        y: y,
        host: host,
        shadow: shadow,
        element: noteContainer,
        pinButton: pinButton,
        textarea: textarea,
        isPinned: isPinned,
        cleanupDrag: cleanupDrag,
        timestamp: Date.now()
      });

      this.saveNote(noteId, text, x, y, isPinned);

      return host;
    } catch (error) {
      console.warn('[TabStickyNotes] Failed to create note:', error);
      return null;
    }
  }

  makeDraggable(hostElement, handle, noteId) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onDown = (e) => {
      if (e.target === handle || handle.contains(e.target)) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = hostElement.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        e.preventDefault();
      }
    };

    const onMove = (e) => {
      if (isDragging) {
        e.preventDefault();

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        hostElement.style.setProperty('left', (initialLeft + deltaX) + 'px', 'important');
        hostElement.style.setProperty('top', (initialTop + deltaY) + 'px', 'important');
      }
    };

    const onUp = () => {
      if (isDragging) {
        isDragging = false;
        const note = this.notes.get(noteId);
        if (note) {
          const finalLeft = parseInt(hostElement.style.left);
          const finalTop = parseInt(hostElement.style.top);
          note.x = finalLeft;
          note.y = finalTop;
          this.saveNote(noteId, note.textarea.value, finalLeft, finalTop, note.isPinned);
        }
      }
    };

    // mousedown must be on the shadow DOM handle, captured via the host
    handle.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    return () => {
      handle.removeEventListener('mousedown', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }

  saveNote(noteId, text, x, y, isPinned = false) {
    if (this._syncingFromStorage) return;

    if (!noteId || typeof text !== 'string') {
      return;
    }

    const note = this.notes.get(noteId);
    const currentPinStatus = note ? note.isPinned : false;

    const now = Date.now();
    if (note) note.timestamp = now;

    const noteData = {
      id: noteId,
      text: text.substring(0, 5000),
      x: Math.max(0, Math.min(parseInt(x) || 0, window.innerWidth - 200)),
      y: Math.max(0, Math.min(parseInt(y) || 0, window.innerHeight - 150)),
      timestamp: now,
      isPinned: isPinned !== undefined ? isPinned : currentPinStatus,
      url: window.location.href
    };

    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([this.tabId], (result) => {
        if (chrome.runtime.lastError) {
          return;
        }
        const notes = result[this.tabId] || {};
        notes[noteId] = noteData;
        chrome.storage.local.set({ [this.tabId]: notes });
      });
    }
  }

  loadNotes() {
    if (!chrome.storage || !chrome.storage.local) {
      return;
    }

    chrome.storage.local.get([this.tabId], (result) => {
      if (chrome.runtime.lastError) {
        return;
      }

      const notes = result[this.tabId] || {};
      const notesList = Object.values(notes).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      notesList.forEach(note => {
        if (note && note.id && this.notes.size < this.maxNotes) {
          this.createStickyNote(note.x, note.y, note.text, note.id, note.isPinned || false);
        }
      });
    });
  }

  deleteNote(noteId) {
    const note = this.notes.get(noteId);
    if (note) {
      if (note.cleanupDrag) note.cleanupDrag();
      if (note.host) note.host.remove();
      this.notes.delete(noteId);

      if (note.isPinned) {
        this.removePinnedNoteGlobally(noteId);
      }
    }

    if (this._syncingFromStorage) return;

    chrome.storage.local.get([this.tabId], (result) => {
      const notes = result[this.tabId] || {};
      delete notes[noteId];
      chrome.storage.local.set({ [this.tabId]: notes });
    });
  }

  savePinnedNoteGlobally(noteData) {
    chrome.storage.local.get(['pinnedNotes'], (result) => {
      const pinnedNotes = result.pinnedNotes || {};
      pinnedNotes[noteData.id] = noteData;
      chrome.storage.local.set({ pinnedNotes: pinnedNotes });
    });
  }

  removePinnedNoteGlobally(noteId) {
    chrome.storage.local.get(['pinnedNotes'], (result) => {
      const pinnedNotes = result.pinnedNotes || {};
      delete pinnedNotes[noteId];
      chrome.storage.local.set({ pinnedNotes: pinnedNotes });
    });
  }

  loadPinnedNotes() {
    chrome.storage.local.get(['pinnedNotes'], (result) => {
      const pinnedNotes = result.pinnedNotes || {};
      const currentUrl = window.location.href;

      Object.values(pinnedNotes).forEach(pinnedNote => {
        if (pinnedNote.url === currentUrl && !this.notes.has(pinnedNote.id)) {
          this.createStickyNote(pinnedNote.x, pinnedNote.y, pinnedNote.text, pinnedNote.id, true);
        }
      });
    });
  }

  _setupStorageSync() {
    if (!chrome.storage || !chrome.storage.onChanged) return;

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes[this.tabId]) return;

      const storageNotes = changes[this.tabId].newValue || {};
      const storageIds = new Set(Object.keys(storageNotes));

      this._syncingFromStorage = true;
      try {
        for (const [id, data] of Object.entries(storageNotes)) {
          if (!this.notes.has(id)) {
            this.createStickyNote(data.x, data.y, data.text, data.id, data.isPinned);
          } else {
            const local = this.notes.get(id);
            if (data.timestamp > (local.timestamp || 0)) {
              this._updateNote(id, data);
            }
          }
        }

        for (const noteId of [...this.notes.keys()]) {
          if (!storageIds.has(noteId)) {
            this.deleteNote(noteId);
          }
        }
      } finally {
        this._syncingFromStorage = false;
      }
    });
  }

  _updateNote(noteId, noteData) {
    const note = this.notes.get(noteId);
    if (!note || !note.host) return;

    if (note.textarea && note.textarea.value !== noteData.text) {
      note.textarea.value = noteData.text;
    }
    note.text = noteData.text;
    note.timestamp = noteData.timestamp;

    note.host.style.setProperty('left', noteData.x + 'px', 'important');
    note.host.style.setProperty('top', noteData.y + 'px', 'important');
    note.x = noteData.x;
    note.y = noteData.y;

    if (note.isPinned !== noteData.isPinned) {
      note.isPinned = noteData.isPinned;
      if (note.pinButton) {
        note.pinButton.textContent = noteData.isPinned ? '\u{1F4CC}' : '\u{1F4CD}';
        note.pinButton.title = noteData.isPinned ? 'Unpin note' : 'Pin note';
        note.pinButton.style.setProperty('opacity', noteData.isPinned ? '1' : '0.5', 'important');
      }
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (sender.id !== chrome.runtime.id) return;
      if (request.action === 'createNote') {
        this.createStickyNote();
        sendResponse({ success: true });
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new StickyNoteManager();
  });
} else {
  new StickyNoteManager();
}
