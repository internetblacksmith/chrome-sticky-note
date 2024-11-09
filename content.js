class StickyNoteManager {
  constructor() {
    try {
      this.notes = new Map();
      this.noteCounter = 0;
      this.tabId = this.generateTabId();
      this.maxNotes = 50;
      this.loadNotes();
      this.init();
    } catch (error) {
    }
  }

  generateTabId() {
    try {
      if (!window.location || !window.location.hostname) {
        return 'sticky_notes_default';
      }
      const hostname = window.location.hostname.replace(/[^a-zA-Z0-9.-]/g, '');
      const pathname = window.location.pathname.replace(/[^a-zA-Z0-9/.-]/g, '');
      return `sticky_notes_${hostname}_${pathname}`;
    } catch (error) {
      return 'sticky_notes_default';
    }
  }

  init() {
    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.loadPinnedNotes();
        });
      } else {
        this.loadPinnedNotes();
      }
      this.setupMessageListener();
    } catch (error) {
    }
  }


  createStickyNote(x = 100, y = 100, text = '', id = null, isPinned = false) {
    try {
      if (this.notes.size >= this.maxNotes) {
        alert('Maximum number of sticky notes reached (50). Please delete some notes first.');
        return null;
      }
      
      const noteId = id || `note_${this.noteCounter++}`;
      
      const noteContainer = document.createElement('div');
    noteContainer.id = noteId;
    noteContainer.className = 'sticky-note';
    noteContainer.style.cssText = `
      position: fixed !important;
      left: ${x}px !important;
      top: ${y}px !important;
      width: 200px !important;
      min-height: 150px !important;
      background: #ffeb3b !important;
      border: 1px solid #fbc02d !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
      z-index: 2147483647 !important;
      font-family: Arial, sans-serif !important;
      font-size: 14px !important;
      line-height: normal !important;
      resize: both !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
      transform: none !important;
      transition: none !important;
      text-align: left !important;
      direction: ltr !important;
      color: #333 !important;
      font-weight: normal !important;
      text-decoration: none !important;
      letter-spacing: normal !important;
      word-spacing: normal !important;
      text-transform: none !important;
      text-indent: 0 !important;
      white-space: normal !important;
      max-width: none !important;
      min-width: 200px !important;
      float: none !important;
      clear: none !important;
    `;

    const header = document.createElement('div');
    header.className = 'sticky-note-header';
    header.style.cssText = `
      background: #fbc02d !important;
      padding: 8px !important;
      cursor: move !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      font-size: 12px !important;
      font-weight: bold !important;
      margin: 0 !important;
      border: none !important;
      box-sizing: border-box !important;
      height: auto !important;
      width: 100% !important;
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
      line-height: normal !important;
      text-align: left !important;
      color: #333 !important;
      border-radius: 8px 8px 0 0 !important;
      flex-shrink: 0 !important;
      flex-grow: 0 !important;
      flex-wrap: nowrap !important;
      gap: 4px !important;
    `;

    const title = document.createElement('span');
    title.textContent = 'Sticky Note';
    title.style.cssText = `
      font-size: 12px !important;
      font-weight: bold !important;
      color: #333 !important;
      margin: 0 !important;
      padding: 0 !important;
      line-height: 20px !important;
      font-family: Arial, sans-serif !important;
      text-decoration: none !important;
      text-transform: none !important;
      letter-spacing: normal !important;
      display: block !important;
      flex-grow: 1 !important;
      text-align: left !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    `;
    
    const pinButton = document.createElement('button');
    pinButton.innerHTML = isPinned ? '📌' : '📍';
    pinButton.title = isPinned ? 'Unpin note' : 'Pin note';
    pinButton.style.cssText = `
      background: none !important;
      border: none !important;
      font-size: 14px !important;
      cursor: pointer !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 20px !important;
      height: 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      opacity: ${isPinned ? '1' : '0.5'} !important;
      color: inherit !important;
      line-height: 1 !important;
      font-family: inherit !important;
      text-decoration: none !important;
      box-shadow: none !important;
      outline: none !important;
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
      transform: none !important;
      transition: opacity 0.2s ease !important;
      flex-shrink: 0 !important;
      text-align: center !important;
      vertical-align: middle !important;
      float: none !important;
      z-index: auto !important;
      box-sizing: content-box !important;
    `;
    
    pinButton.addEventListener('click', () => {
      const note = this.notes.get(noteId);
      if (note) {
        const newPinStatus = !note.isPinned;
        note.isPinned = newPinStatus;
        pinButton.innerHTML = newPinStatus ? '📌' : '📍';
        pinButton.title = newPinStatus ? 'Unpin note' : 'Pin note';
        pinButton.style.opacity = newPinStatus ? '1' : '0.5';
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
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none !important;
      border: none !important;
      font-size: 16px !important;
      cursor: pointer !important;
      color: #333 !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 20px !important;
      height: 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
      font-family: Arial, sans-serif !important;
      font-weight: normal !important;
      text-decoration: none !important;
      box-shadow: none !important;
      outline: none !important;
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
      transform: none !important;
      transition: background-color 0.2s ease !important;
      flex-shrink: 0 !important;
      text-align: center !important;
      vertical-align: middle !important;
      float: none !important;
      z-index: auto !important;
      box-sizing: content-box !important;
      opacity: 1 !important;
    `;
    
    closeButton.addEventListener('click', () => {
      this.deleteNote(noteId);
    });

    header.appendChild(title);
    header.appendChild(pinButton);
    header.appendChild(closeButton);

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = `
      width: 100% !important;
      height: 120px !important;
      border: none !important;
      background: transparent !important;
      padding: 10px !important;
      margin: 0 !important;
      font-size: 14px !important;
      font-family: Arial, sans-serif !important;
      font-weight: normal !important;
      resize: none !important;
      outline: none !important;
      box-sizing: border-box !important;
      display: block !important;
      line-height: 1.5 !important;
      color: #333 !important;
      text-align: left !important;
      text-decoration: none !important;
      text-transform: none !important;
      letter-spacing: normal !important;
      word-spacing: normal !important;
      text-indent: 0 !important;
      white-space: pre-wrap !important;
      overflow-wrap: break-word !important;
      word-wrap: break-word !important;
      overflow: auto !important;
      direction: ltr !important;
      opacity: 1 !important;
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
      transform: none !important;
      transition: none !important;
      z-index: auto !important;
      float: none !important;
      clear: none !important;
      vertical-align: top !important;
      min-height: 120px !important;
      max-height: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
    `;
    
    textarea.addEventListener('input', () => {
      const note = this.notes.get(noteId);
      this.saveNote(noteId, textarea.value, noteContainer.style.left, noteContainer.style.top, note ? note.isPinned : false);
    });

    noteContainer.appendChild(header);
    noteContainer.appendChild(textarea);

    this.makeDraggable(noteContainer, header, noteId);
    
    document.body.appendChild(noteContainer);
    textarea.focus();

    this.notes.set(noteId, {
      text: text,
      x: x,
      y: y,
      element: noteContainer,
      isPinned: isPinned
    });

    this.saveNote(noteId, text, x, y, isPinned);
    
    return noteContainer;
    } catch (error) {
      return null;
    }
  }

  makeDraggable(element, handle, noteId) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    handle.addEventListener('mousedown', (e) => {
      if (e.target === handle || handle.contains(e.target)) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        // Get the current position of the element
        const rect = element.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        
        // Prevent text selection while dragging
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        
        // Calculate the distance moved
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Apply the movement to the initial position
        const newLeft = initialLeft + deltaX;
        const newTop = initialTop + deltaY;
        
        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        const note = this.notes.get(noteId);
        if (note) {
          const textarea = element.querySelector('textarea');
          const finalLeft = parseInt(element.style.left);
          const finalTop = parseInt(element.style.top);
          this.saveNote(noteId, textarea.value, finalLeft, finalTop, note.isPinned);
        }
      }
    });
  }

  saveNote(noteId, text, x, y, isPinned = false) {
    try {
      if (!noteId || typeof text !== 'string') {
        return;
      }
      
      const note = this.notes.get(noteId);
      const currentPinStatus = note ? note.isPinned : false;
      
      const noteData = {
        id: noteId,
        text: text.substring(0, 5000),
        x: Math.max(0, Math.min(parseInt(x) || 0, window.innerWidth - 200)),
        y: Math.max(0, Math.min(parseInt(y) || 0, window.innerHeight - 150)),
        timestamp: Date.now(),
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
          chrome.storage.local.set({ [this.tabId]: notes }, () => {
            if (chrome.runtime.lastError) {
            }
          });
        });
      }
    } catch (error) {
    }
  }

  loadNotes() {
    try {
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
    } catch (error) {
    }
  }

  deleteNote(noteId) {
    const note = this.notes.get(noteId);
    if (note && note.element) {
      note.element.remove();
      this.notes.delete(noteId);
      
      // If the note was pinned, remove it from global pinned notes
      if (note.isPinned) {
        this.removePinnedNoteGlobally(noteId);
      }
    }

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

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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