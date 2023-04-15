import { useRef, useEffect, useState } from 'react'
import Curve from './Curve';
import { useDrag } from '../hooks/useDrag';
import type { Vertices } from '../@types/custom-typings';
import { Vector3 } from 'three';

interface DrawCurveToolCollisionProps {
  children: React.ReactNode;
}

/**
  * High Order Component which applies Mouse Drag Events across scene components (component children) to allow the user
  * to drave curves in the 3d space.
  */
export default function DrawCurveToolCollision(props: DrawCurveToolCollisionProps) {
  // const [,forceUpdate] = useState();

  const [vertices, setVertices] = useState<Vertices>([]);
  const [curves, setCurves] = useState<Vertices[]>([]);

  //https://stackoverflow.com/a/58877875
  const verticesRef = useRef<Vertices>([]);
  useEffect(() => void (verticesRef.current = vertices));
  const curvesRef = useRef<Vertices>([]);
  useEffect(() => void (curvesRef.current = curves));

  const onDrag = (v: Vector3) => {
    const haveNewVerticesBeenDrawn = !vertices?.[vertices.length - 1]?.equals(v)

    if (vertices.length > 0 && haveNewVerticesBeenDrawn)
      setVertices([...verticesRef.current, v]);
    else if (vertices.length === 0)
      setVertices([...verticesRef.current, v]);
  };

  const onEnd = () => {
    setCurves([...(curvesRef.current.filter((array: Vertices) => array.length > 0)), verticesRef.current]);
  };

  useEffect(() => {
    setVertices([]);
  }, [curves]);

  const curvesMap = curves.map((_, i) =>
    (<Curve key={i} vertices={curves[i]} hoverable={true} />)
  );

  const bindDrag = useDrag(onDrag, onEnd);

  return (
    < >
      <Curve vertices={vertices} hoverable={false} />
      {curvesMap}
      <group {...bindDrag} >
        {props.children}
      </group>
    </>
  );
}
