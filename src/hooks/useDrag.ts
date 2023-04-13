import { useCallback, useEffect, useRef, useState } from 'react'
import { useOrbitSpeedStore } from '../stores/stores';
import { Vector3 } from 'three';
import { ThreeEvent } from '@react-three/fiber';

// Derived from the following code:
// https://github.com/pmndrs/react-three-fiber/blob/99e2a590dd8dbbf4d787a9ab3103e4bea950cc4b/example/src/demos/Lines.tsx
/**
 * Custom Hook to capture 3d space data from a raycaster from camera to collision on scene component implementing hook functions
 *
 *  Drag down, and up disable camera rotation
 *  Move returns collision data and normal data from collision object for usage in implementations
 */
export function useDrag(onDrag: (v: Vector3) => void, onEnd: () => void) {
  const [active, setActive] = useState(false);
  const [point, setPoint] = useState<Vector3>(new Vector3());
  const [originPoint, setOriginPoint] = useState<Vector3>(new Vector3());

  const originPointRef = useRef<Vector3>();
  useEffect(() => void (originPointRef.current = originPoint));

  const activeRef = useRef<boolean>();
  useEffect(() => void (activeRef.current = active));

  const pointRef = useRef<Vector3 | undefined>();
  useEffect(() => void (pointRef.current = point));

  const down = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      setActive(true);
      setOriginPoint(e.point);
      // console.log(e.point, originPoint, originPointRef.current);

      useOrbitSpeedStore.setState({
        speed: 0.0,
      });
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const up = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      setActive(false);
      useOrbitSpeedStore.setState({
        speed: 0.5,
      });
      e.stopPropagation();
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      if (onEnd) onEnd();
    },
    [onEnd],
  );

  const move = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (activeRef.current) {
        event.stopPropagation();

        // console.log(event);

        //TODO
        // return tuple of no normal added point and normal added point
        //  snap curve to position on mouse up
        //
        // Add ability to close curve

        if (!pointRef.current?.equals(event.point) && !originPointRef.current?.equals(event.point)) {
          onDrag(event.point.add(event.face!.normal));
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
