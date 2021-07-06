import React, { useCallback, useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import { usePopper } from 'react-popper';

const styles = {
  container: {
    background: '#fff',
    border: '0.125rem solid #e5e5e5',
    borderRadius: '0.75rem',
    color: '#3c3c3c',
    fontWeight: 'initial',
    fontSize: 'initial',
    height: '15rem',
    lineHeight: 'initial',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '1rem',
    width: '15rem',
    zIndex: '1000'
  },
  character: {
    fontSize: '5rem',
    textAlign: 'center'
  },
  definitions: {
    paddingTop: '1rem'
  },
  pronunciation: {
    fontWeight: 'bold' 
  },
  list: {
    listStyleType: 'decimal',
    marginLeft: '2rem',
  }
};

function fetchCharacter (character, setCharacterData) {
  chrome.runtime.sendMessage({ type: 'query', payload: character}, (res) => {
    console.log(res);
    setCharacterData(res);
  });
}

const CharacterInfo = ({character}) => {
  const [characterData, setCharacterData] = useState(null);
  const [hideDelayTimeout, setHideDelayTimeout] = useState(null);
  const [showDelayTimeout, setShowDelayTimeout] = useState(null);
  const [showing, setShowing] = useState(false);
  const [refElem, setRefElem] = useState(null);
  const [popperElem, setPopperElem] = useState(null);
  const [arrowElem, setArrowElem] = useState(null);

  const popper = usePopper(refElem, popperElem, {
    modifiers: [{ name: 'arrow', options: { element: arrowElem } }],
    placement: 'top'
  });

  const onMouseLeave = useCallback(() => {
    const hideDelayTimeout = setTimeout(() => {
      setShowing(false);
    }, 250);
    setHideDelayTimeout(hideDelayTimeout);

    if (showDelayTimeout) {
      clearTimeout(showDelayTimeout);
      setShowDelayTimeout(null);
    }
  }, [showDelayTimeout]);

  const onMouseOver = useCallback(() => {
    const showDelayTimeout = setTimeout(() => {
      setShowing(true);
    }, 1000);
    setShowDelayTimeout(showDelayTimeout);

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
    characterData.definitions.forEach(pronunciation => {
      definitions.push(<div style={styles.pronunciation}>{pronunciation.pinyin}</div>);
      definitions.push(
        <ol style={styles.list}>
          {pronunciation.definitions.map(def => <li>{def}</li>)}
        </ol>
      );
    });
  }

  const newPopperStyles = {
    ...popper.styles.popper,
    visibility: showing ? 'visible' : 'hidden',
    pointerEvents: showing ? 'auto' : 'hidden',
    opacity: showing ? '1' : '0',
    transition: showing ? 'opacity 0.3s' : 'opacity 0.3s, visibility 0s 0.3s',
    zIndex: '1000'
  };

  return (
    <>
      <span 
        onMouseOver={onMouseOver} 
        onMouseLeave={onMouseLeave}
        className={'character-info'} 
        ref={setRefElem}>
        {character}
      </span>
      {ReactDom.createPortal(
        <div 
          onMouseOver={onMouseOver} 
          onMouseLeave={onMouseLeave}
          ref={setPopperElem} 
          style={newPopperStyles}
          {...popper.attributes}>
          <div style={styles.container}>
            <div className={'character-info'} style={styles.character}>
              {character}
            </div>
            <div style={styles.definition}>
              {definitions}
            </div>
          </div>
          <div ref={setArrowElem} style={popper.styles.arrow} />
        </div>,
        document.body
      )}
    </>
  ); 
};

export default CharacterInfo;
