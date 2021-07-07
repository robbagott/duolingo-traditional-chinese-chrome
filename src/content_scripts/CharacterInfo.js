import React, { useCallback, useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import { usePopper } from 'react-popper';
import { fetchCharacter, stripIdsChars } from '../util.js';

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
  tabbed: {
    marginLeft: '1rem'
  }
};



const CharacterInfo = ({character}) => {
  // State
  const [data, setData] = useState(null);
  const [decomp, setDecomp] = useState(null);
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

  // Callbacks
  const fetchData = () => {
    return fetchCharacter(character).then(res => {
      setData(res);
      return res;
    }).catch(err => console.error(err));
  }

  const fetchDecompData = (newData) => {
    // Retrieve decomposition character data.
    const decomp = newData?.extended?.decomposition;
    if (decomp) {
      const decompChars = stripIdsChars(decomp).split(''); 
      let fetches = decompChars.map(c => fetchCharacter(c));
      Promise.all(fetches).then(results => {
        let decompData = {};
        results.forEach((res, i) => {
          decompData[decompChars[i]] = res;
        });
        setDecomp(decompData);
      }).catch(err => {console.log(err); fetchDecompData(newData);});
    }
  }

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
      fetchData().then(res => fetchDecompData(res));
    }
    if (hideDelayTimeout) {
      clearTimeout(hideDelayTimeout);
      setHideDelayTimeout(null);
    }
  }, [hideDelayTimeout, showDelayTimeout]);

  // Render logic
  const renderDefinitions = () => {
    if (data) {
      if (data.definitions?.length) {
        return (
          data.definitions.map(pronunciation => (
            <>
              <div style={styles.section}>{pronunciation.pinyin}</div>
              <ol style={styles.list}>
                {pronunciation.definitions.map(def => <li>{def}</li>)}
              </ol>
            </>
          ))
        );
      }
      if (data.extended) {
        const definitions = data.extended.definition.split(';');
        return (
          <>
            <div style={styles.section}>{data.extended.pinyin[0]}</div>
            <ol style={styles.list}>
              {definitions ? definitions.map(def => <li>{def}</li>) : null}
            </ol>
          </>
        );
      }
    }
    return null;
  };

  const renderComp = () => {
    let comp = [];
    if (data?.extended) {
      comp.push(<div style={styles.separator}></div>);
      const eData = data.extended.etymology;
      comp.push(<div style={styles.section}>Composition</div>);

      const decompStr = stripIdsChars(data.extended.decomposition);
      let chars = decompStr.split('');
      const compSection = (
        <div style={styles.tabbed}>
          {
            chars.map(c => {
              let type = '';
              if (eData?.semantic === c) {
                type = ' (semantic)';
              } else if (eData?.phonetic === c) {
                type = ' (phonetic)';
              } else {
                type = '';
              }

              const details = decomp ? decomp[c] : null;
              let pinyin = details?.definitions?.length ? details.definitions[0]?.pinyin : null;
              pinyin = pinyin || details?.extended?.pinyin[0];
              let definition = details?.definitions?.length ? details.definitions[0].definitions[0] : null;
              definition = definition || details?.extended?.definition;
              return <div>{`${c}${type}: ${pinyin} ${definition}`}</div>;
            })
          }
        </div>
      );
      comp.push(compSection);
    }
    return comp;
  };

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
              {renderDefinitions()}
            </div>
            {renderComp()}
          </div>
          <div ref={setArrowElem} style={popper.styles.arrow} />
        </div>,
        document.body
      )}
    </>
  ); 
};

export default CharacterInfo;
