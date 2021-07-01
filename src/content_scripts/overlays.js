import {observe, awaitElement, replaceSimplifiedChars, monitorObserverHealth} from './util.js';

console.log("Lesson injected. Am I running?: ", window.duolingoTraditionalChineseExtensionOverlaysRunning);

// Don't run extension if it's already running. The extension must be injected by background service
// when the user click the back button in the browser.
if (!window.duolingoTraditionalChineseExtensionOverlaysRunning) {
  window.duolingoTraditionalChineseExtensionOverlaysRunning = true;
  runExtension();
}

function runExtension() {
  // Run immediately before observing.
  awaitElement('#overlays').then(overlaysDiv => {
    replaceSimplifiedChars(overlaysDiv);

    setMutationObserver();
  }); 

  function setMutationObserver() {
    console.log('resetting overlays observer');
    const overlaysDiv = awaitElement('#overlays').then(overlaysDiv => {
      const observer = new MutationObserver((mutations, observer) => {
        const nodesAdded = mutations.some(mutation => mutation.addedNodes.length > 0);
        if (nodesAdded) {
          observer.disconnect();
          observer.takeRecords();
          replaceSimplifiedChars(overlaysDiv);
          observe(observer, overlaysDiv);
        }
      });

      observe(observer, overlaysDiv);
      monitorObserverHealth(overlaysDiv).catch(err => runExtension());
    }); 
  }
};
