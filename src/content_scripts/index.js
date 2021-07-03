import ConvertChinese from 'chinese-s2t';
import { openDB } from 'idb';

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
    const converted = ConvertChinese.s2t(leaf.innerHTML);
    if (converted !== leaf.innerHTML) {
      leaf.innerHTML = addHoverToText(converted);
      addHoverListeners(leaf);
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
      const simplified = ConvertChinese.t2s(textarea.value)
      if (textarea.value !== simplified) {
        textarea.value = simplified;
      }
    });
  }
}

// Converts Chinese characters to spans. Then attaches event listener to these spans which open a dictionary.
function addHoverToText(text) {
  let newHtml = '';
  for (let i = 0; i < text.length; i++) {
    if (isChineseChar(text[i])) {
      newHtml += textToSpan(text[i]);        
    }
  }
  return newHtml;
}

function isChineseChar(c) {
  return c.match(/[\u2E80-\u2FD5\u3190-\u319f\u3400-\u4DBF\u4E00-\u9FCC\uF900-\uFAAD]/g);
}

function textToSpan(c) {
  const span = document.createElement('span');
  span.className = 'chinese-character';
  span.textContent = c;
  return span.outerHTML;
}

function addHoverListeners(node) {
  const spans = node.querySelectorAll('span');
  for (let i = 0; i < spans.length; i++) {
    spans[i].onmouseover = onHover;
  }
}

function onHover(e) {
  console.log('hovered!', e);
  chrome.runtime.sendMessage({ type: 'query', payload: e.target.textContent }, (res) => {
    console.log(res); 
  });
}
