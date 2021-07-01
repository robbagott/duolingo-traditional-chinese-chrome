import Chinese from 'chinese-s2t';

(() => {
  setInterval(replaceSimplifiedChars, 1000);	
  
  function replaceSimplifiedChars() {
    const wordBankButtons = document.querySelectorAll('[data-test="challenge-tap-token"]');

    wordBankButtons.forEach((node) => {
      node.innerHTML = Chinese.s2t(node.innerHTML);
    });

    const wordBankCards = document.querySelectorAll('[data-test="challenge-choice-card"]');

    wordBankCards.forEach((node) => {
      getLeafNodes(node).forEach((leaf) => {
        leaf.innerHTML = Chinese.s2t(leaf.innerHTML);
      });
    });

    const prompts = document.querySelectorAll('[data-test="challenge-translate-prompt"]');

    prompts.forEach((node) => {
      getLeafNodes(node).forEach((leaf) => {
        leaf.innerHTML = Chinese.s2t(leaf.innerHTML);
      });
    });
  }

  function getLeafNodes(node) {
    let leaves = [];
    if (node.children.length) {
      for (let i = 0; i < node.children.length; i++) {
        leaves = leaves.concat(getLeafNodes(node.children[i]));
      }
    } else {
      // Node is a leaf.
      return [node];
    }
    return leaves;
  }
})();
