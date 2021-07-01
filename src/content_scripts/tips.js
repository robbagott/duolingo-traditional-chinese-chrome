import Chinese from 'chinese-s2t';

(() => {
  // Don't run extension if it's already running. The extension must be injected by background service
  // when the user click the back button in the browser.
  console.log("Injected. Am I running?: ", window.duolingoTraditionalChineseExtensionTipsRunning);
  if (!window.duolingoTraditionalChineseExtensionTipsRunning) {
    window.duolingoTraditionalChineseExtensionTipsRunning = true;
    runExtension();
  }

  console.log('tips injected');
  runExtension();

  function runExtension() {
    console.log('tips running');

    setInterval(() => {
      replaceSimplifiedChars(document.body);
    }, 1000);
  };

  function replaceSimplifiedChars(node) {
    const spans = node.querySelectorAll('span, div');
    spans.forEach((node) => {
      if (node.children.length === 0) {
        node.innerHTML = Chinese.s2t(node.innerHTML);
      }
    });
  }
})();
