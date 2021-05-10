//https://github.com/pmndrs/react-three-fiber/blob/99e2a590dd8dbbf4d787a9ab3103e4bea950cc4b/example/src/demos/Lines.tsx
import { useContext, useCallback, useEffect, useRef, useState } from 'react'
import camContext from '../components/camera/CameraContext';

export function useDrag(onDrag: any, onEnd: any) {
  const [active, setActive] = useState(false)
  //const [, toggle] = useContext(camContext) as any

  const [, toggle] = useContext(camContext) as any

  const down = useCallback(
    (e) => {
      setActive(true)
      toggle(false)
      e.stopPropagation()
      e.target.setPointerCapture(e.pointerId)
    },
    [toggle],
  )

  const up = useCallback(
    (e) => {
      setActive(false)
      toggle(true)
      e.stopPropagation()
      e.target.releasePointerCapture(e.pointerId)
      if (onEnd) onEnd()
    },
    [onEnd, toggle],
  )

  const activeRef = useRef<any>()
  useEffect(() => void (activeRef.current = active))
  const move = useCallback(
    (event) => {
      if (activeRef.current) {
        event.stopPropagation()
        onDrag(event.unprojectedPoint)
      }
    },
    [onDrag],
  )

  const [bind] = useState(() => ({ onPointerDown: down, onPointerUp: up, onPointerMove: move }))
  return bind
}
