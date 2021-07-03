import React, { useEffect, useState } from 'react';

const CharacterInfo = () => {
  const [characterData, setCharacterData] = useState(null);

  useEffect(() => {
    console.log('listening...');
    const openListener = document.body.addEventListener('opencharacterinfo', (e) => {
      console.log('received event', e);
      setCharacterData(e.detail)
    });
    const closeListener = document.body.addEventListener('closecharacterinfo', (e) => {
      console.log('received event', e);
      setCharacterData(null);
    });

    return () => {
      document.body.removeEventListener('opencharacterinfo', openListener);
      document.body.removeEventListener('closecharacterinfo', closeListener);
    }
  }, []);

  if (characterData !== null) {

  } else {

  }
  return (
    <div>
      {JSON.stringify(characterData)}
    </div>
  )
};

export default CharacterInfo;
