import React, { useCallback, useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import { usePopper } from 'react-popper';
import { stripIdsChars } from '../util.js';

const styles = {
  container: {
    background: '#fff',
    border: '0.125rem solid #e5e5e5',
    borderRadius: '0.75rem',
    color: '#3c3c3c',
    fontWeight: 'initial',
    fontSize: 'initial',
    height: '20rem',
    lineHeight: 'initial',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '1rem',
    width: '20rem',
    zIndex: '1000'
  },
  character: {
    fontSize: '5rem',
    textAlign: 'center'
  },
  definitions: {
    paddingTop: '1rem'
  },
  section: {
    fontWeight: 'bold' 
  },
  list: {
    listStyleType: 'decimal',
    marginLeft: '2rem',
  },
  separator: {
    borderBottom: '0.06rem solid #e5e5e5',
    margin: '1rem'
  },
  compSection: {
    marginLeft: '1rem'
  }
};

function fetchCharacter (character, setCharacterData) {
  chrome.runtime.sendMessage({ type: 'query', payload: character}, (res) => {
    console.log(res);
    setCharacterData(res);
  });
}

const CharacterInfo = ({character}) => {
  const [data, setData] = useState(null);
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
    clearTimeout(showDelayTimeout);
    const newShowDelayTimeout = setTimeout(() => {
      setShowing(true);
    }, 1000);
    setShowDelayTimeout(newShowDelayTimeout);

    if (!data) {
      fetchCharacter(character, setData)
    }
    if (hideDelayTimeout) {
      clearTimeout(hideDelayTimeout);
      setHideDelayTimeout(null);
    }
  }, [hideDelayTimeout, showDelayTimeout]);

  // Rendering logic
  let definitions = [];
  let comp = [];
  if (data) {
    definitions = (
      data.definitions.map(pronunciation => (
        <>
          <div style={styles.section}>{pronunciation.pinyin}</div>
          <ol style={styles.list}>
            {pronunciation.definitions.map(def => <li>{def}</li>)}
          </ol>
        </>
      ))
    );

    if (data.extended) {
      comp.push(<div style={styles.separator}></div>);
      const eData = data.extended.etymology;
      comp.push(<div style={styles.section}>Composition</div>);

      const decompStr = stripIdsChars(data.extended.decomposition);
      let chars = decompStr.split('');
      const compSection = (
        <div style={styles.compSection}>
          {
            chars.map(c => (
              <>
                {eData && eData.semantic === c ? <div>{c} (semantic)</div> : null} 
                {eData && eData.phonetic === c ? <div>{c} (phonetic)</div> : null} 
                {!eData || (eData.phonetic !== c && eData.semantic !== c) ? <div>{c}</div> : null} 
              </>
            ))
          }
        </div>
      );
      comp.push(compSection);
    }
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
            <div style={styles.separator}></div>
              {definitions}
            </div>
            {comp}
          </div>
          <div ref={setArrowElem} style={popper.styles.arrow} />
        </div>,
        document.body
      )}
    </>
  ); 
};

export default CharacterInfo;
