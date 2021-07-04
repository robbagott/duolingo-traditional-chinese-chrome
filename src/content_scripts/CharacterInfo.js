import React, { useCallback, useEffect, useState } from 'react';
import { usePopper } from 'react-popper';

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

function fetchCharacter (character, setCharacterData) {
  chrome.runtime.sendMessage({ type: 'query', payload: character}, (res) => {
    setCharacterData(res);
  });
}

const CharacterInfo = ({character}) => {
  const [characterData, setCharacterData] = useState(null);
  const [hideDelayTimeout, setHideDelayTimeout] = useState(null);
  const [showing, setShowing] = useState(false);
  const [refElem, setRefElem] = useState(null);
  const [popperElem, setPopperElem] = useState(null);
  const [arrowElem, setArrowElem] = useState(null);

  const { styles, attributes } = usePopper(refElem, popperElem, {
    modifiers: [{ name: 'arrow', options: { element: arrowElem } }],
    placement: 'top'
  });

  const onMouseLeave = useCallback(() => {
    const hideDelayTimeout = setTimeout(() => {
      setShowing(false);
    }, 500);
    setHideDelayTimeout(hideDelayTimeout);
  }, []);

  const onMouseOver = useCallback(() => {
    setShowing(true);
    if (!characterData) {
      fetchCharacter(character, setCharacterData)
    }
    if (hideDelayTimeout) {
      clearTimeout(hideDelayTimeout);
      setHideDelayTimeout(null);
    }
  }, [hideDelayTimeout]);

  // Rendering logic
  const definitions = [];
  if (characterData) {
    characterData.forEach(pronunciation => {
      definitions.push(<div style={pronunciationStyles}>{pronunciation.pinyin}</div>);
      definitions.push(
        <ol style={listStyles}>
          {pronunciation.definitions.map(def => <li>{def}</li>)}
        </ol>
      );
    });
  }

  const popperStyles = {
    ...styles.popper,
    visibility: showing ? 'visible' : 'hidden',
    pointerEvents: showing ? 'auto' : 'hidden',
    opacity: showing ? '1' : '0',
    transition: 'opacity .3s',
    zIndex: '1000'
  };

  return (
    <>
      <span 
        onMouseOver={onMouseOver} 
        onMouseLeave={onMouseLeave}
        className={'chinese-character'} 
        ref={setRefElem}>
        {character}
      </span>
      <div 
        onMouseOver={onMouseOver} 
        onMouseLeave={onMouseLeave}
        ref={setPopperElem} 
        style={popperStyles}
        {...attributes.popper}>
        <div style={containerStyles}>
          <div className="chinese-character" style={characterStyles}>
            {character}
          </div>
          <div style={definitionStyles}>
            {definitions}
          </div>
        </div>
        <div ref={setArrowElem} style={styles.arrow} />
      </div>
    </>
  ); 
};

export default CharacterInfo;
