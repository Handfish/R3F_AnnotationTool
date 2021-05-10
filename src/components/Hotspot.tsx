import { useEffect, useRef, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Sprite, Vector3, sRGBEncoding, TextureLoader } from 'three';

import type { MeshProps } from '../@types/custom-typings';

export default function Hotspot(props: MeshProps) {
  const [hovered, setHovered] = useState(false)

  const spriteFront = useRef<Sprite>(null!);
  const spriteBack = useRef<Sprite>(null!);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])

  const map = useLoader(TextureLoader, "https://i.imgur.com/EZynrrA.png");
  map.encoding = sRGBEncoding;

  useFrame(({ camera }) => {
    const scaleVector = new Vector3();
    const scaleFactor = 20;
    const subVector = scaleVector.subVectors(spriteFront.current.getWorldPosition(new Vector3())! as Vector3, camera.position);
    const scale = subVector.length() / scaleFactor;
    spriteFront.current.scale.set(scale, scale, 1);
    spriteBack.current.scale.set(scale, scale, 1);
  })

  return (
    <>
      <sprite
        ref={spriteFront}
        position={props.position}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
        }}
      >
        <spriteMaterial attach="material" map={map} />
      </sprite>

      <sprite
        ref={spriteBack}
        position={props.position}
      >
        <spriteMaterial attach="material" map={map} opacity={0.3} transparent={true} depthTest={false} />
      </sprite>
    </>
  )
}
