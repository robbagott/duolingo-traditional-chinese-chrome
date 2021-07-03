import React from 'react';
import ReactDom from 'react-dom';
import CharacterInfo from './CharacterInfo';

console.log('injected...');

const App = () => {
  return (
    <CharacterInfo/>
  );
};

export default App;

// Create React root element for character popup info.
const reactRoot = document.createElement('div');
reactRoot.className = 'character-info-app';
document.body.appendChild(reactRoot); 
ReactDom.render(<App />, reactRoot);
  
