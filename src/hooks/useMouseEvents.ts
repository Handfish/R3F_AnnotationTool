import { useState } from 'react';
import { useMouseOverStore } from '../stores/stores';
import type { MouseEventData } from '../@types/custom-typings';

export function useMouseEvents(uuid: string) {
  const setCursorPointer = (isPointerCursor: boolean) => {
    document.body.style.cursor = isPointerCursor ? 'pointer' : 'auto'
  }

  const addElement = useMouseOverStore(state => state.addElement);
  const removeElement = useMouseOverStore(state => state.removeElement);

  const onPointerOver = (e: any) => {
    const data: MouseEventData = {
      distance: e.distance,
      point: e.point,
      uuid
    };
    addElement(data);

    const intersections = useMouseOverStore.getState().intersections;

    console.log(Object.keys(intersections).length);
    if(Object.keys(intersections).length > 0)
      setCursorPointer(true);
    else
      setCursorPointer(false);

  };

  const onPointerOut = (e: any) => {
    const data: MouseEventData = {
      distance: e.distance,
      point: e.point,
      uuid
    };
    removeElement(data);

    const intersections = useMouseOverStore.getState().intersections;

    console.log(Object.keys(intersections).length);
    if(Object.keys(intersections).length > 0)
      setCursorPointer(true);
    else
      setCursorPointer(false);
  };

  const [bind] = useState(() => ({ onPointerOver, onPointerOut }));

  return bind;
}
