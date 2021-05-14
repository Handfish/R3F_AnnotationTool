//https://github.com/pmndrs/react-three-fiber/blob/99e2a590dd8dbbf4d787a9ab3103e4bea950cc4b/example/src/demos/Lines.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { useOrbitSpeedStore } from '../stores/stores';
import { Vector3 } from 'three';

export function useDrag(onDrag: any, onEnd: any) {
  const [active, setActive] = useState(false);
  const [point, setPoint] = useState<Vector3>(new Vector3());
  const [originPoint, setOriginPoint] = useState<Vector3>(new Vector3());

  const originPointRef = useRef<any>();
  useEffect(() => void (originPointRef.current = originPoint));

  const activeRef = useRef<any>();
  useEffect(() => void (activeRef.current = active));

  const pointRef = useRef<any>();
  useEffect(() => void (pointRef.current = point));

  const down = useCallback(
    (e) => {
      setActive(true);
      setOriginPoint(e.point);
      // console.log(e.point, originPoint, originPointRef.current);

      useOrbitSpeedStore.setState({ 
        speed: 0.0,
      });
      e.stopPropagation();
      e.target.setPointerCapture(e.pointerId);
    },
    [],
  );

  const up = useCallback(
    (e) => {
      setActive(false);
      useOrbitSpeedStore.setState({ 
        speed: 0.5,
      });
      e.stopPropagation();
      e.target.releasePointerCapture(e.pointerId);
      if (onEnd) onEnd();
    },
    [onEnd],
  );

  const move = useCallback(
    (event) => {
      if (activeRef.current) {
        event.stopPropagation();

        // console.log(event);

        //TODO 
        //return tuple of no normal added point and normal added point
        // snap curve to position on mouse up
        //
        // Add ability to close curve
        
        if(!pointRef.current.equals(event.point) && !originPointRef.current.equals(event.point)) 
        {
          onDrag(event.point.add(event.face.normal));
          setPoint(event.point);
        }

        // onDrag(event.point);
      }
    },
    [onDrag],
  );

  const [bind] = useState(() => ({ onPointerDown: down, onPointerUp: up, onPointerMove: move }))
  return bind
}
