import { useState } from 'react';
import { useMouseOverStore } from '../stores/stores';
import type { MouseEventData } from '../@types/custom-typings';
import { ThreeEvent } from '@react-three/fiber';

/**
 * Custom Hook to make sure the cursor is set to the correct style
 *  Builds an array of presently moused over elements
 *  Only converts mouse back to pointer on exit of ALL elements
 */
export function useMouseEvents(uuid: string) {
  const setCursorPointer = (isPointerCursor: boolean) => {
    document.body.style.cursor = isPointerCursor ? 'pointer' : 'auto'
  }

  const addElement = useMouseOverStore(state => state.addElement);
  const removeElement = useMouseOverStore(state => state.removeElement);

  const onPointerOver = (e: ThreeEvent<PointerEvent> | MouseEventData) => {
    const data: MouseEventData = {
      distance: e.distance,
      point: e.point,
      uuid
    };
    addElement(data);

    const intersections = useMouseOverStore.getState().intersections;

    // console.log(Object.keys(intersections).length);

    if (Object.keys(intersections).length > 0)
      setCursorPointer(true);
    else
      setCursorPointer(false);

  };

  const onPointerOut = (e: ThreeEvent<PointerEvent> | MouseEventData) => {
    const data: MouseEventData = {
      distance: e.distance,
      point: e.point,
      uuid
    };
    removeElement(data.uuid);

    const intersections = useMouseOverStore.getState().intersections;

    // console.log(Object.keys(intersections).length);

    if (Object.keys(intersections).length > 0)
      setCursorPointer(true);
    else
      setCursorPointer(false);
  };

  const [bind] = useState(() => ({ onPointerOver, onPointerOut }));

  return bind;
}
