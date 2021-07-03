import React from 'react';
import ReactDom from 'react-dom';
import CharacterInfo from './CharacterInfo';

const App = () => {
  return (
    <CharacterInfo/>
  );
};

export default App;

// The extension can sometimes be injected multiple times. This acts as a guard.
if (!document.querySelector('character-info-app')) {
  // Create React root element for character popup info.
  const reactRoot = document.createElement('div');

  const styles = `
    box-sizing: border-box;
    left: 0;
    position: absolute;
    top: 0;
  `;
  reactRoot.className = 'character-info-app';
  reactRoot.style = styles;
  document.body.appendChild(reactRoot); 
  ReactDom.render(<App />, reactRoot);
}
  
