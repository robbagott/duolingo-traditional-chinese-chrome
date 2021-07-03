import React, { useEffect, useState } from 'react';

const CharacterInfo = () => {
  const [characterData, setCharacterData] = useState(null);
  const [position, setPosition] = useState([0, 0]);

  useEffect(() => {
    const openListener = document.body.addEventListener('opencharacterinfo', (e) => {
      setCharacterData(e.detail.characterData);
      setPosition([e.detail.top, e.detail.left]);
    });
    const closeListener = document.body.addEventListener('closecharacterinfo', (e) => {
      setCharacterData(null);
    });

    return () => {
      document.body.removeEventListener('opencharacterinfo', openListener);
      document.body.removeEventListener('closecharacterinfo', closeListener);
    }
  }, []);


  const styles = `
    left: ${position[0]}
    top: ${position[1]};
  `;
  const characterInfo = JSON.stringify(characterData);
  return (
    <div style={styles}>
      {characterData
        ? characterInfo 
        : null
      }
    </div>
  );
};

export default CharacterInfo;
