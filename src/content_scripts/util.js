import Chinese from 'chinese-s2t';

export {
  observe,
  getElement,
  awaitElement,
  replaceSimplifiedChars,
  monitorObserverHealth
};

function observe(observer, node) {
  observer.observe(node, {
    subtree: true,
    childList: true,
  });
}

function awaitElement(selector) {
  return new Promise(resolve => {
    const elem = getElement(selector);
    if (elem) {
      console.log('waiting for element...')
      resolve(elem);
    } else {
      let interval = setInterval(() => {
      console.log('waiting for element...')
        const elem = getElement(selector);
        if (elem) {
          clearInterval(interval);
          resolve(elem);
        }
      }, 100);
    }
  });
}

function getElement(selector) {
  const elemQuery = document.querySelectorAll(selector);
  const elem = elemQuery.length ? elemQuery[0] : null; 
  return elem;
}

function replaceSimplifiedChars(node) {
  const elements = getLeafNodes(node);
  elements.forEach((elem) => {
    if (elem.children.length === 0) {
      elem.innerHTML = Chinese.s2t(elem.innerHTML);
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

function monitorObserverHealth(elem) {
  return new Promise((resolve, reject) => {
    let interval = setInterval(() => {
      console.log('monitoring observer...');
      if (!document.body.contains(elem)) {
        clearInterval(interval);
        reject();
      }
    }, 1000);
  });
}
