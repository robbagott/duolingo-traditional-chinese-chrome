import React, { useEffect, useState } from 'react';

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


  const styles = {
    display: characterData ? 'block' : 'none',
    background: '#fff',
    border: '0.06rem solid #aaa',
    borderRadius: '0.3rem',
    left: `calc(${position.left}px - 5rem)`,
    bottom: position.bottom,
    width: '10rem',
    height: '10rem',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '1rem',
    position: 'absolute'
  };
  return (
    <div style={styles}>
      {characterData
        ? JSON.stringify(characterData)
        : null
      }
    </div>
  );
};

export default CharacterInfo;
