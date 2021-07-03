import React, { useEffect, useState } from 'react';

const containerStyles = {
  background: '#fff',
  border: '0.125rem solid #e5e5e5',
  borderRadius: '0.75rem',
  color: '#3c3c3c',
  height: '15rem',
  lineHeight: 'initial',
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '1rem',
  position: 'absolute',
  width: '15rem',
  zIndex: '1000'
};

const characterStyles = {
  fontSize: '5rem',
  textAlign: 'center'
};

const definitionStyles = {
  paddingTop: '1rem'
};

const pronunciationStyles = {
  fontWeight: 'bold' 
};

const listStyles = {
  listStyleType: 'decimal',
  marginLeft: '2rem',
};

const CharacterInfo = () => {
  const [characterData, setCharacterData] = useState(null);
  const [position, setPosition] = useState({ bottom: 0, left: 0 });

  useEffect(() => {
    const openListener = document.body.addEventListener('opencharacterinfo', (e) => {
      setCharacterData(e.detail.characterData);
      setPosition({
        bottom: -e.detail.top + 10,
        left: e.detail.left
      });
    });

    const closeListener = document.body.addEventListener('closecharacterinfo', (e) => {
      setCharacterData(null);
    });

    return () => {
      document.body.removeEventListener('opencharacterinfo', openListener);
      document.body.removeEventListener('closecharacterinfo', closeListener);
    };
  }, []);



  if (!characterData) {
    return null;
  }

  const newContainerStyles = {
    display: characterData ? 'block' : 'none',
    left: `calc(${position.left}px - 7.5rem)`,
    bottom: position.bottom,
    ...containerStyles
  };

  const character = characterData[0].traditional;
  const definitions = [];
  characterData.forEach(pronunciation => {
    definitions.push(<div style={pronunciationStyles}>{pronunciation.pinyin}</div>);
    definitions.push(
      <ol style={listStyles}>
        {pronunciation.definitions.map(def => <li>{def}</li>)}
      </ol>
    );
  });

  return (
    <div style={newContainerStyles}>
      <div style={characterStyles}>
        {characterData[0].traditional}
      </div>
      <div style={definitionStyles}>
        {definitions}
      </div>
    </div>
  );
};

export default CharacterInfo;
