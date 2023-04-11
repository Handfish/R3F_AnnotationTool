//https://github.com/pmndrs/drei/blob/master/src/core/OrbitControls.tsx

import { useEffect, useRef, useState } from 'react';
import { extend, useThree, ReactThreeFiber } from '@react-three/fiber'
import { OrbitControls } from 'three-stdlib';
extend({ OrbitControls })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Node<OrbitControls, typeof OrbitControls>
    }
  }
}

// export default function Controls({ children }: any) {
export default function Controls() {
  const { gl, camera, invalidate } = useThree()
  const api = useState(true)
  const ref = useRef<OrbitControls>(null!)
  useEffect(() => {
    const current = ref.current
    const onChange = () => invalidate()

    current.addEventListener('change', onChange)
    return () => current.removeEventListener('change', onChange)
  }, [invalidate])

  return (
    <>
      <orbitControls ref={ref} args={[camera, gl.domElement]} enableDamping enabled={api[0]} />
      {/* <camContext.Provider value={api as any}>{children}</camContext.Provider> */}
    </>
  )
}
