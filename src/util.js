export {
  fetchCharacter,
  getAbsoluteOffset,
  getLeafNodes,
  includesChinese,
  stripIdsChars
};

function getAbsoluteOffset(element) {
    let top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};

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

function includesChinese(str) {
  return str.match(/[\u2E80-\u2FD5\u3190-\u319f\u3400-\u4DBF\u4E00-\u9FCC\uF900-\uFAAD]/g);
}

function stripIdsChars(input) {
  return input.replace(/[⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻]/g, '');
}

function fetchCharacter (character) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'query', payload: character}, res => {
      if (res) {
        resolve(res);
      } else {
        reject(chrome.runtime.lastError);
      }
    });
  });
}
