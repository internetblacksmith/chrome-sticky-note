document.addEventListener('DOMContentLoaded', () => {
  const createButton = document.getElementById('createNote');
  
  createButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'createNote' }, (response) => {
        if (chrome.runtime.lastError) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
          }, () => {
            if (chrome.runtime.lastError) {
            } else {
              setTimeout(() => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'createNote' }, (response) => {
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