import Chinese from 'chinese-s2t';
import { replaceSimplifiedChars } from './util.js';

// Don't run extension if it's already running. The extension must be injected by background service
// when the user click the back button in the browser.
console.log("Tips injected. Am I running?: ", window.duolingoTraditionalChineseExtensionTipsRunning);
if (!window.duolingoTraditionalChineseExtensionTipsRunning) {
  window.duolingoTraditionalChineseExtensionTipsRunning = true;
  runExtension();
}

function runExtension() {
  console.log('tips running');

  setInterval(() => {
    replaceSimplifiedChars(document.body);
  }, 1000);
};

