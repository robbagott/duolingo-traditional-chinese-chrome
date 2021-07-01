import Chinese from 'chinese-s2t';

export {
  observe,
  getElement,
  awaitElement,
  replaceSimplifiedChars,
  monitorObserverHealth
};

//function setMutationObserver(selector) {
//  console.log('resetting observer');
//  awaitElement('[data-test~=challenge]').then(elem => {
//    const challengeParent = elem.parentNode.parentNode;
//
//    const observer = new MutationObserver((mutations, observer) => {
//      const nodesAdded = mutations.some(mutation => mutation.addedNodes.length > 0);
//      if (nodesAdded) {
//        observer.disconnect();
//        observer.takeRecords();
//        replaceSimplifiedChars(challengeParent);
//        observe(observer, challengeParent);
//      }
//    });
//
//    observe(observer, challengeParent);
//    monitorObserverHealth(challengeParent).catch(err => runExtension());
//  }); 
//}

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
  const elements = node.querySelectorAll('span, div');
  elements.forEach((elem) => {
    if (elem.children.length === 0) {
      elem.innerHTML = Chinese.s2t(elem.innerHTML);
    }
  });
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
