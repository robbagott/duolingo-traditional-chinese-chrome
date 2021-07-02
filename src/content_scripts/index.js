import Chinese from 'chinese-s2t';

// Don't run extension if it's already running. The extension must be injected by background service
// when the user clicks the back button in the browser.
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
          attachNextButtonListener(mut.addedNodes[i]);
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
  const leaves = getLeafNodes(node);
  leaves.forEach((leaf) => {
    const converted = Chinese.s2t(leaf.innerHTML);
    if (converted !== leaf.innerHTML) {
      
      leaf.innerHTML = converted;
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

// Attaches a listener to the next button, which translates any text input into simplified Chinese before the answer is submitted.
function attachNextButtonListener(node) {
  if (node.tagName === 'button' && node['data-test'] === 'player-next') {
    node.addEventListener('mouseup', () => {
      const textarea = document.querySelector('textarea[data-test=challenge-translate-input]');
      
      const simplified = Chinese.t2s(textarea.value)
      if (textarea.value !== simplified) {
        textarea.value = simplified;
      }
    });
  }
}

// Converts Chinese characters in node to spans. Then attaches event listener to these spans which open a dictionary.
function attachHoverDictionary(node) {
  const leaves = getLeafNodes(node);
  leaves.forEach(leaf => {
    for (let i = 0; i < leaf.innerHTML.length; i++) {
      let newHtml = '';
      if (isChineseChar(leaf.innerHTML[i])) {
        newHtml += createHoverDictionarySpan(c);        
      }
    }
    leaf.innerHTML = newHtml;
  });
}

function isChineseChar(c) {
  return c.match(/[\u3400-\u9FBF]/);
}

function createHoverDictionarySpan(c) {
  const span = document.createElement('span');
  span.className = 'chinese-character';
  return span.outerHTML;
}
