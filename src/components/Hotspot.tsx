import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Sprite, Vector3, sRGBEncoding, TextureLoader } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { useMouseEvents } from '../hooks/useMouseEvents';

import type { MeshProps } from '../@types/custom-typings';

export default function Hotspot(props: MeshProps) {
  const uuid = useMemo(() => uuidv4(), []);
  const {onPointerOver, onPointerOut} = useMouseEvents(uuid);

  const spriteFront = useRef<Sprite>(null!);
  const spriteBack = useRef<Sprite>(null!);

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
    <group>
      <sprite
        ref={spriteFront}
        position={props.position}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <spriteMaterial attach="material" map={map} />
      </sprite>

      <sprite
        ref={spriteBack}
        position={props.position}
      >
        <spriteMaterial attach="material" map={map} opacity={0.3} transparent={true} depthTest={false} />
      </sprite>
    </group>
  )
}
