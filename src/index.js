import "@babel/polyfill";
import Chinese from 'chinese-s2t';

(async () => {
  resetMutationObserver();

  async function resetMutationObserver() {
    const challengeDiv = await awaitChallenge(); 
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

  async function awaitChallenge() {
    return new Promise(resolve => {
      const challengeDiv = getChallenge();
      if (challengeDiv) {
        resolve(challengeDiv);
      } else {
        let interval = setInterval(() => {
          const challengeDiv = getChallenge();
          if (challengeDiv) {
            clearInterval(interval);
            resolve(challengeDiv);
          }
        }, 10);
      }
    });
  }

  function getChallenge() {
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
})();
