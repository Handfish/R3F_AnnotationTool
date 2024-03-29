import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Sprite, Vector3, sRGBEncoding, TextureLoader } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { useMouseEvents } from '../hooks/useMouseEvents';

import type { MeshProps } from '../@types/custom-typings';

/**
* Save memory by reusing Objects
* https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#re-using-geometries-and-materials
*/
const scaleVector = new Vector3();
const emptyVector = new Vector3();

/**
* Expandable Icons derived from Sprites which display / scale to a uniform size during camera zoom
*/
export default function Hotspot(props: MeshProps) {
  const uuid = useMemo(() => uuidv4(), []);
  const { onPointerOver, onPointerOut } = useMouseEvents(uuid);

  const spriteFront = useRef<Sprite>(null!);
  const spriteBack = useRef<Sprite>(null!);

  const map = useLoader(TextureLoader, "https://i.imgur.com/EZynrrA.png");
  map.encoding = sRGBEncoding;

  useFrame(({ camera }) => {
    const HEIGHT_WIDTH_PX = 60;
    const CONTAINING_DIV_HEIGHT = 576;

    const subVector = scaleVector.subVectors(spriteFront.current.getWorldPosition(emptyVector), camera.position);
    const scale = HEIGHT_WIDTH_PX / CONTAINING_DIV_HEIGHT * subVector.length();

    spriteFront.current.scale.set(scale, scale, 1);
    spriteBack.current.scale.set(scale, scale, 1);
  })

  return (
    <group
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <sprite
        ref={spriteFront}
        position={props.position}
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
