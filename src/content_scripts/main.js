import Chinese from 'chinese-s2t';

console.log("experiment injected. Am I running?: ", window.duolingoTraditionalChineseExtensionLessonRunning);

// Don't run extension if it's already running. The extension must be injected by background service
// when the user click the back button in the browser.
if (!window.duolingoTraditionalChineseExtensionRunning) {
  window.duolingoTraditionalChineseExtensionRunning = true;
  runExtension();
}

function runExtension() {
  // Run immediately before observing.
  replaceSimplifiedChars(document.body);
  setMutationObserver();

};

function setMutationObserver() {
  const observer = new MutationObserver((mutations, observer) => {
    mutations.forEach(mut => {
      if (mut.addedNodes) {
        for (let i = 0; i < mut.addedNodes.length; i++) {
          replaceSimplifiedChars(mut.addedNodes[i]);
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

function replaceSimplifiedChars(node) {
  const elements = getLeafNodes(node);
  elements.forEach((elem) => {
    if (!elem.children || elem.children.length === 0) {
      const converted = Chinese.s2t(elem.innerHTML);
      if (converted !== elem.innerHTML) {
        elem.innerHTML = converted;
      }
    }
  });
}

function getLeafNodes(node) {
  if (node.tagName === 'script') {
    return [];
  }
  if (!node.children || !node.children.length) {
    return [node];
  } else {
    let leaves = [];
    for (let i = 0; i < node.children.length; i++) { 
      leaves = leaves.concat(getLeafNodes(node.children[i]));
    };
    return leaves;
  }
}
