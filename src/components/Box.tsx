import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, Vector3 } from 'three';

import Hotspot from './Hotspot';
import HotspotSvg from './HotspotSvg';

import SvgEye from '../icons/Eye'
import SvgLightbulb from '../icons/Lightbulb'
import SvgQuestionCircle from '../icons/QuestionCircle'

import type { MeshProps, HotspotSvgProps } from '../@types/custom-typings';

export default function Box(props: MeshProps & HotspotSvgProps) {
  // This reference will give us direct access to the mesh
  const group = useRef<Group>(null!);
  const mesh = useRef<Mesh>(null!);
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const positionArr = useMemo(() => new Vector3().fromArray(props.position as number[]), [props]);

  const { position, ...otherProps } = props;

  // Rotate mesh every frame, SpriteMaterial, this is outside of React without overhead
  useFrame(() => {
    // mesh.current.rotation.x = mesh.current.rotation.y += 0.0005
    group.current.rotation.x = group.current.rotation.y += 0.003
  })
  return (
    <group
      ref={group}
      position={positionArr}
    >
      <mesh
        {...otherProps}
        ref={mesh}
        scale={active ? 1.5 : 1}
        onPointerDown={() => {
          // e.stopPropagation()
          setActive(!active)
        }}
        onPointerOver={() => {
          // e.stopPropagation()
          setHover(true)
        }}
        onPointerOut={() => {
          // e.stopPropagation()
          setHover(false)
        }}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      </mesh>
      <Hotspot position={new Vector3(-0.5, -0.5, 0.5)}></Hotspot>
      <HotspotSvg position={new Vector3(-0.5, -0.5, -0.5)} svg={SvgLightbulb} />
      <HotspotSvg position={new Vector3(-0.5, 0.5, -0.5)} svg={SvgQuestionCircle} />
      <HotspotSvg position={new Vector3(-0.5, 0.5, 0.5)} svg={SvgEye} />
    </group>
  )
}
