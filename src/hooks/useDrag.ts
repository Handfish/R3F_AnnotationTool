//https://github.com/pmndrs/react-three-fiber/blob/99e2a590dd8dbbf4d787a9ab3103e4bea950cc4b/example/src/demos/Lines.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { useOrbitSpeedStore } from '../stores/stores';


export function useDrag(onDrag: any, onEnd: any) {
  const [active, setActive] = useState(false)

  const down = useCallback(
    (e) => {
      setActive(true)
      useOrbitSpeedStore.setState({ 
        speed: 0.0,
      });
      e.stopPropagation()
      e.target.setPointerCapture(e.pointerId)
    },
    [],
  )

  const up = useCallback(
    (e) => {
      setActive(false)
      useOrbitSpeedStore.setState({ 
        speed: 0.5,
      });
      e.stopPropagation()
      e.target.releasePointerCapture(e.pointerId)
      if (onEnd) onEnd()
    },
    [onEnd],
  )

  const activeRef = useRef<any>()

  useEffect(() => void (activeRef.current = active))
  const move = useCallback(
    (event) => {
      if (activeRef.current) {
        event.stopPropagation()
        onDrag(event.point);
      }
    },
    [onDrag],
  )

  const [bind] = useState(() => ({ onPointerDown: down, onPointerUp: up, onPointerMove: move }))
  return bind
}
