import ConvertChinese from 'chinese-s2t';
import { openDB } from 'idb';
import { getLeafNodes, includesChinese, getAbsoluteOffset } from '../util.js';
import React from 'react';
import ReactDom from 'react-dom';
import CharacterInfo from './CharacterInfo';

// Don't run extension if it's already running. The extension must be injected by background service
// when the user clicks the back button in the browser.
if (!window.duolingoTraditionalChineseExtensionRunning) {
  window.duolingoTraditionalChineseExtensionRunning = true;
  runExtension();
}

function runExtension() {
  // Run immediately before observing. Then observe and react to changes.
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
    if (!leaf.innerHTML) return;

    // Convert any simplified text to traditional, only making DOM changes if necessary (avoid MutationObserver chain reactions).
    const converted = ConvertChinese.s2t(leaf.innerHTML);
    if (converted !== leaf.innerHTML) {
      leaf.innerHTML = textToSpans(converted);
    }

    // If the current span isn't processed, add hover functionality.
    if (typeof leaf.className === 'string' && !leaf.className.includes('character-info')) {
      const newHtml = textToSpans(leaf.innerHTML)
      if (leaf.innerHTML !== newHtml) {
        leaf.innerHTML = newHtml;
        const newCharInfos = leaf.querySelectorAll('.add-character-info');
        for (let i = 0; i < newCharInfos.length; i++) {
          addCharacterInfo(newCharInfos[i]);
        }
      }
    }
  });
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
function textToSpans(text) {
  let newHtml = '';
  for (let i = 0; i < text.length; i++) {
    if (includesChinese(text[i])) {
      newHtml += textToSpan(text[i]);        
    } else {
      newHtml += text[i];
    }
  }
  return newHtml;
}

function textToSpan(c) {
  const span = document.createElement('span');
  span.className = 'add-character-info'; // Mark span for later processing.
  span.textContent = c;
  return span.outerHTML;
}

function addCharacterInfo(node) {
  ReactDom.render(<CharacterInfo character={node.textContent} />, node);
}

