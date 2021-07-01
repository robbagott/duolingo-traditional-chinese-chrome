import Chinese from 'chinese-s2t';

// Don't run extension if it's already running. The extension must be injected by background service
// when the user click the back button in the browser.
console.log("Injected. Am I running?: ", window.duolingoTraditionalChineseExtensionRunning);
if (!window.duolingoTraditionalChineseExtensionRunning) {
  window.duolingoTraditionalChineseExtensionRunning = true;
  runExtension();
}

function runExtension() {
  // Run immediately before observing.
  awaitChallengeDiv().then(challengeDiv => {
    const challengeParent = challengeDiv.parentNode.parentNode;
    replaceSimplifiedChars(challengeParent);

    resetMutationObserver();
  }); 

  function resetMutationObserver() {
    console.log('resetting observer');
    const challengeDiv = awaitChallengeDiv().then(challengeDiv => {
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

  function observe(observer, node) {
    observer.observe(node, {
      subtree: true,
      childList: true,
    });
  }

  function awaitChallengeDiv() {
    return new Promise(resolve => {
      const challengeDiv = getChallengeDiv();
      if (challengeDiv) {
        console.log('waiting for challenge...')
        resolve(challengeDiv);
      } else {
        let interval = setInterval(() => {
        console.log('waiting for challenge...')
          const challengeDiv = getChallengeDiv();
          if (challengeDiv) {
            clearInterval(interval);
            resolve(challengeDiv);
          }
        }, 100);
      }
    });
  }

  function getChallengeDiv() {
    const challengeQuery = document.querySelectorAll('[data-test~=challenge]');
    const challengeDiv = challengeQuery.length ? challengeQuery[0] : null; 
    return challengeDiv;
  }

  function replaceSimplifiedChars(node) {
    const spans = node.querySelectorAll('span, div');
    spans.forEach((node) => {
      if (node.children.length === 0) {
        node.innerHTML = Chinese.s2t(node.innerHTML);
      }
    });
  }

  function monitorObserverHealth(node) {
    return new Promise((resolve, reject) => {
      let interval = setInterval(() => {
        console.log('monitoring observer...');
        if (!document.body.contains(node)) {
          clearInterval(interval);
          reject();
        }
      }, 1000);
    });
  }
};
