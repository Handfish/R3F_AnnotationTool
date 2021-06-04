import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Sprite, Vector2, Vector3, Vector4 } from 'three';
import Annotation from './Annotation';
import { v4 as uuidv4 } from 'uuid';
import { useMouseEvents } from '../hooks/useMouseEvents';

import type { HotspotSvgProps } from '../@types/custom-typings';

function drawIcon({paths, viewport} : { paths: Path2D[], viewport: Vector4 }, iconFillColor: string, size: Vector2) {
  const canvas = document.createElement('canvas');

  const STROKE_SIZE = 3;

  const { width, height } = size;
  const widthA = width - (STROKE_SIZE * 2);
  const heightA = height - (STROKE_SIZE * 2);
  const minSize = Math.min(width, height);

  canvas.width = parseInt(`${width}`);
  canvas.height = parseInt(`${height}`);

  const iconRatio = viewport.width / viewport.height;
  const canvasRatio = width / height;
  const scale = canvasRatio > iconRatio ? heightA / viewport.height : widthA / viewport.width;
  // const scale = canvasRatio > iconRatio ? height / viewport.height : width / viewport.width;

  const context = canvas.getContext('2d')!;
  context.save();

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fill();
  context.beginPath();
  context.fillStyle = 'rgba(255, 255, 255, 0.8)';

  context.shadowBlur = STROKE_SIZE;
  context.shadowColor = iconFillColor;
  // context.shadowColor = 'black';

  // context.strokeStyle = "black"
  // context.lineWidth = 2;
  // context.stroke();

  context.arc((minSize / 2) + STROKE_SIZE, (minSize / 2) + STROKE_SIZE, (minSize / 2) - (STROKE_SIZE * 2), 0, 2 * Math.PI);
  // context.arc(minSize / 2, minSize / 2, minSize / 2, 0, 2 * Math.PI);
  context.fillStyle = 'white';
  context.fill();

  context.shadowBlur = 0;

  // context.translate(width / 2, height / 2);
  context.translate((width / 2) + STROKE_SIZE, (height / 2) + STROKE_SIZE);

  // context.scale(scale, scale);
  context.scale(scale * .85, scale * .85);

  context.translate(-viewport.x - viewport.width / 2, - viewport.y - viewport.height / 2);

  for(let x = 0; x < paths.length; x++) {
    context.beginPath();
    context.fillStyle = iconFillColor;
    context.fill(new Path2D(paths[x]));
  }

  context.restore();
  return canvas;
}


export default function HotspotSvg(props: HotspotSvgProps) {
  const uuid = useMemo(() => uuidv4(), []);
  const [active, setActive] = useState(false);
  const {onPointerOver, onPointerOut} = useMouseEvents(uuid);

  const spriteFront = useRef<Sprite>(null!);
  const spriteBack = useRef<Sprite>(null!);


  const map = useMemo(() => {
    const paths = props.svg.paths.map((path: string) => new Path2D(path));
    const viewport = new Vector4(...props.svg.viewBox.split(' ').map((ele: string) => parseInt(ele)));
    const map = new CanvasTexture(drawIcon({paths, viewport}, !active ? 'black' : 'teal', new Vector2(128, 128)));
    return map;
  }, [props, active]);

  useFrame(({ camera }) => {
    const scaleVector = new Vector3();
    // const subVector = scaleVector.subVectors(props.position! as Vector3, camera.position);
    const subVector = scaleVector.subVectors(spriteFront.current.getWorldPosition(new Vector3())! as Vector3, camera.position);
    const scale = 60/window.innerHeight * subVector.length(); 

    spriteFront.current.scale.set(scale, scale, 1);
    spriteBack.current.scale.set(scale, scale, 1);
  })

  return (
    <group
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={(e) => {
        e.stopPropagation()
        setActive(!active)
      }}
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

      <Annotation position={props.position} active={active}></Annotation>
    </group>
  )
}
