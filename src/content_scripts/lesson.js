import {observe, awaitElement, replaceSimplifiedChars, monitorObserverHealth} from './util.js';

console.log("Lesson injected. Am I running?: ", window.duolingoTraditionalChineseExtensionLessonRunning);

// Don't run extension if it's already running. The extension must be injected by background service
// when the user click the back button in the browser.
if (!window.duolingoTraditionalChineseExtensionLessonRunning) {
  window.duolingoTraditionalChineseExtensionLessonRunning = true;
  runExtension();
}

function runExtension() {
  // Run immediately before observing.
  awaitElement('[data-test~=challenge]').then(challengeDiv => {
    const challengeParent = challengeDiv.parentNode.parentNode;
    replaceSimplifiedChars(challengeParent);

    setMutationObserver();
  }); 

  function setMutationObserver() {
    console.log('resetting observer');
    const challengeDiv = awaitElement('[data-test~=challenge]').then(challengeDiv => {
      const challengeParent = challengeDiv.parentNode.parentNode;

      const observer = new MutationObserver((mutations, observer) => {
        const nodesAdded = mutations.some(mutation => mutation.addedNodes.length > 0);
        if (nodesAdded) {
          observer.disconnect();
          observer.takeRecords();
          replaceSimplifiedChars(challengeParent);
          observe(observer, challengeParent);
        }
      });

      observe(observer, challengeParent);
      monitorObserverHealth(challengeParent).catch(err => runExtension());
    }); 
  }
};
