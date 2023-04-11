import Fuse from 'fuse.js';
import { useCallback, useMemo, useState } from 'react';
import { debounce } from 'throttle-debounce';
import { KeyboardEvent } from 'react';

type Result = string;

/**
 * Fuse Search Hook for creating components with Fuse
 */
export const useFuse = (list: Result[], options: Fuse.IFuseOptions<Result> & Fuse.FuseSearchOptions) => {
  // defining our query state in there directly
  const [query, updateQuery] = useState('');

  // removing custom options from Fuse options object
  // NOTE: `limit` is actually a `fuse.search` option, but we merge all options for convenience
  const { limit, ...fuseOptions } = options;


  // memoize the fuse instance for performance
  const fuse = useMemo(
    () => new Fuse(list, fuseOptions),
    [list, fuseOptions]
  );

  // memoize results whenever the query or options change
  const hits = useMemo(
    () => fuse.search(query, { limit }),
    [fuse, limit, query]
  );

  // debounce updateQuery and rename it `setQuery` so it's transparent
  const setQuery = useMemo(
    () => debounce(100, updateQuery),
    [updateQuery]
  );


  // pass a handling helper to speed up implementation
  const onSearchKeyUp = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => setQuery((e.target as HTMLInputElement).value.trim()),
    [setQuery]
  );

  // pass a handling helper to speed up implementation
  const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value.trim()),
    [setQuery]
  );

  // still returning `setQuery` for custom handler implementations
  return {
    hits,
    onSearchKeyUp,
    onSearchChange,
    query,
    setQuery,
  };
};
