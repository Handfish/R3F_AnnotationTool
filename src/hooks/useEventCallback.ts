import { useCallback, useRef, useEffect } from 'react';

/*
 * DEPRECATED
 *
 * This hook was imported to try to deal with interesting react
 * lifecycle problems which have been handled without it
 *
 */
export default function useEventCallback(fn: any, dependencies: any) {
  const ref = useRef(() => {
    throw new Error('Cannot call an event handler while rendering.');
  });

  useEffect(() => {
    ref.current = fn;
  }, [fn, ...dependencies]);

  return useCallback(() => {
    const fn = ref.current;
    return fn();
  }, [ref]);

  // return null;
}
