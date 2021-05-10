import { useEffect, useRef, useState} from 'react';
import { extend, useThree, ReactThreeFiber } from '@react-three/fiber'
import camContext from './CameraContext';
// @ts-ignore
import { OrbitControls } from 'three-stdlib';
extend({ OrbitControls })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Node<OrbitControls, typeof OrbitControls>
    }
  }
}

export default function Controls({ children }: any) {
    const { gl, camera, invalidate } = useThree()
    const api = useState(true)
    const ref = useRef<OrbitControls>(null!)
    useEffect(() => {
          const current = ref.current
          current.addEventListener('change', invalidate)
          return () => current.removeEventListener('change', invalidate)
        }, [invalidate])

    return (
          <>
            <orbitControls ref={ref} args={[camera, gl.domElement]} enableDamping enabled={api[0]} />
            <camContext.Provider value={api as any}>{children}</camContext.Provider>
          </>
        )
}