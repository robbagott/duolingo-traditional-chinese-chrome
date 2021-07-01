chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(changeInfo);
  if (changeInfo.status === 'loading' && tab.url.includes('.duolingo.com')) {
    chrome.scripting.executeScript({
      target: { tabId: tabId }, 
      files: ["main.js"] 
    });
  }
});
