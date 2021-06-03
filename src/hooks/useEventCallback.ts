import { useCallback, useRef, useEffect } from 'react';

export default function useEventCallback(fn: any, dependencies: any) {
  // const ref = useRef(() => {
  //   throw new Error('Cannot call an event handler while rendering.');
  // });

  // useEffect(() => {
  //   ref.current = fn;
  // }, [fn, ...dependencies]);

  // return useCallback(() => {
  //   const fn = ref.current;
  //   return fn();
  // }, [ref]);
  
  return null;
}
