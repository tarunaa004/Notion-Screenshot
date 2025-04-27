// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getConfig') {
    // Get both Notion config and tags
    chrome.storage.sync.get(['notion_config', 'screenshot_tags'], (result) => {
      sendResponse({
        notionConfig: result.notion_config || null,
        tags: result.screenshot_tags || []
      });
    });
    return true; // Required for async response
  }
  
  if (request.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab(null, {}, (screenshot) => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        sendResponse({
          success: true,
          screenshot,
          title: tabs[0].title,
          url: tabs[0].url
        });
      });
    });
    return true;
  }
  
  if (request.action === 'captureFullPage') {
    // Existing full page capture logic...
    // This is a placeholder - keep your existing implementation
    return true;
  }
});