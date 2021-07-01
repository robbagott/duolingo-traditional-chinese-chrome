chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(changeInfo);
  if (changeInfo.status === 'loading' && tab.url.includes('.duolingo.com')) {
    if (tab.url.includes('tips')) {
      chrome.scripting.executeScript({
        target: { tabId: tabId }, 
        files: ["tips.js"] 
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tabId }, 
        files: ["lesson.js"] 
      });
    }
  }
});
