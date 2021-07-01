import Chinese from 'chinese-s2t';

(() => {
  setInterval(replaceSimplifiedChars, 1000);	
  
  function replaceSimplifiedChars() {
    const spans = document.querySelectorAll('span, div');

    spans.forEach((node) => {
      if (node.children.length === 0) {
        node.innerHTML = Chinese.s2t(node.innerHTML);
      }
    });
  }
})();
