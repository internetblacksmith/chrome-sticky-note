document.addEventListener('DOMContentLoaded', () => {
  const createButton = document.getElementById('createNote');
  const statusEl = document.getElementById('status');

  function showStatus(msg) {
    statusEl.textContent = msg;
    statusEl.className = 'status';
  }

  function showError(msg) {
    statusEl.textContent = msg;
    statusEl.className = 'status error';
  }

  function generateStorageKey(url) {
    try {
      const urlObj = new URL(url);
      return `sticky_notes_${urlObj.origin}${urlObj.pathname}`;
    } catch (error) {
      return null;
    }
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) return;
    const tab = tabs[0];
    const key = generateStorageKey(tab.url);
    if (!key) return;

    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) return;
      const notes = result[key] || {};
      const count = Object.keys(notes).length;
      if (count > 0) {
        showStatus(count + (count === 1 ? ' note' : ' notes') + ' on this page');
      }
    });
  });

  createButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) {
        showError('No active tab found');
        return;
      }

      const tab = tabs[0];

      chrome.tabs.sendMessage(tab.id, { action: 'createNote' }, (response) => {
        if (chrome.runtime.lastError) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }, () => {
            if (chrome.runtime.lastError) {
              showError('Cannot add notes to this page');
            } else {
              setTimeout(() => {
                chrome.tabs.sendMessage(tab.id, { action: 'createNote' }, (response) => {
                  if (response && response.success) {
                    window.close();
                  }
                });
              }, 100);
            }
          });
        } else if (response && response.success) {
          window.close();
        }
      });
    });
  });
});
