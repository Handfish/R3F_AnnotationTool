import FuseHighlight from './FuseHighlight';
import { useFuse } from './useFuse';
import { useEffect, useRef, useState } from 'react';
import { useOBJsStore } from '../../stores/stores';

/**
 * API Endpoint search Organ Names
 */
const compoundOrganNames = async () => {
  const data = await fetch('http://localhost:8000/PartOfCompoundOrganNames')
    .then(response => response.json())

  return data;
}

/**
 * API Endpoint to load OBJ URI locations and color data
 */
const getElementFileIds = async (name: string) => {
  const data = await fetch(`http://localhost:8000/PartOfGetElementIds?name=${encodeURIComponent(name)}`)
    .then(response => response.json())

  return data;
}

/**
 * React Element for searching and loading data on clicking results
 */
const MySearch = () => {
  const objProps = useOBJsStore(state => state.objProps);
  const setObjProps = useOBJsStore(state => state.setObjProps);

  const inputEl = useRef<HTMLInputElement>(null);
  const [list, setList] = useState([])
  const { hits, query, onSearchKeyUp, onSearchChange, setQuery } = useFuse(list, {
    shouldSort: true,
    keys: ['name'],
    includeMatches: true,
    limit: 60
  });


  const onClickHit = async (item: string) => {
    const newObjProps = await getElementFileIds(item);

    setQuery('');
    inputEl.current!.value = '';

    setObjProps([...objProps, ...newObjProps])
  }

  useEffect(() => {
    (async function() {
      setList(await compoundOrganNames());
    })();
  }, [setList]);

  return (
    <>
      <input
        ref={inputEl}
        name="search"
        type="search"
        placeholder="Search..."
        autoComplete="off"
        onKeyUp={onSearchKeyUp}
        onChange={onSearchChange} // handles "clear search" click
      />
      <p>Results for "{query}":</p>
      <ol>
        {hits.map(hit => (
          <li
            key={hit.refIndex}
            onClick={() => onClickHit(hit.item)}
            style={{ cursor: 'pointer' }}
          >
            <FuseHighlight
              hit={hit}
              attribute="name"
            />
          </li>
        ))}
      </ol>
    </>
  );
};

export default MySearch;
