import * as React from 'react'
import { TransformControls as TransformControlsImpl } from 'three-stdlib'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Box, OrbitControls, TransformControls } from '@react-three/drei'

export default function TransformControlsLockScene({ showX, showY, showZ }: { showX: boolean, showY: boolean, showZ: boolean}) {
  const orbitControls = React.useRef<OrbitControlsImpl>(null!)
  const transformControls = React.useRef<TransformControlsImpl>(null!)

  React.useEffect(() => {
    if (transformControls.current) {
      const { current: controls } = transformControls;
      const callback = (event: any) => (orbitControls.current.enabled = !event.value)
      controls.addEventListener('dragging-changed', callback)
      return () => controls.removeEventListener('dragging-changed', callback)
    }
  }, [orbitControls])

  return (
    <>
      {/*@ts-ignore*/}
      <TransformControls ref={transformControls} showX={showX} showY={showY} showZ={showZ}>
        <Box>
          <meshBasicMaterial attach="material" wireframe />
        </Box>
      </TransformControls>
      <OrbitControls ref={orbitControls} />
    </>
  )
}
