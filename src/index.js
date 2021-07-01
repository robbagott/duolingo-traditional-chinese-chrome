import "@babel/polyfill";
import Chinese from 'chinese-s2t';

// Don't run extension if it's already running. The extension must be injected by background service
// when the user click the back button in the browser.
if (!window.duolingoTraditionalChineseExtensionRunning) {
  window.duolingoTraditionalChineseExtensionRunning = true;
  runExtension();
}

async function runExtension() {
  // Run immediately before observing.
  const challengeDiv = await awaitChallengeDiv(); 
  const challengeParent = challengeDiv.parentNode.parentNode;
  replaceSimplifiedChars(challengeParent);

  resetMutationObserver();

  async function resetMutationObserver() {
    const challengeDiv = await awaitChallengeDiv(); 
    const challengeParent = challengeDiv.parentNode.parentNode;

    const observer = new MutationObserver(async (mutations, observer) => {
      const nodesAdded = mutations.some(mutation => mutation.addedNodes.length > 0);
      if (nodesAdded) {
        observer.disconnect();
        observer.takeRecords();
        replaceSimplifiedChars(challengeParent);
        observe(observer, challengeParent);
      }
    });

    observe(observer, challengeParent);
  }

  function observe(observer, node) {
    observer.observe(node, {
      subtree: true,
      childList: true,
    });
  }

  async function awaitChallengeDiv() {
    return new Promise(resolve => {
      const challengeDiv = getChallengeDiv();
      if (challengeDiv) {
        resolve(challengeDiv);
      } else {
        let interval = setInterval(() => {
          const challengeDiv = getChallengeDiv();
          if (challengeDiv) {
            clearInterval(interval);
            resolve(challengeDiv);
          }
        }, 10);
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
};
