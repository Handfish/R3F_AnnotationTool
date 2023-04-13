import { useRef, useEffect, useState } from 'react'
import OBJ from './OBJ'
import Curve from './Curve';
import { useDrag } from '../hooks/useDrag';
import { OBJProps, useOBJsStore } from '../stores/stores';
import type { Vertices } from '../@types/custom-typings';
import { Vector3 } from 'three';

/**
  * High Order Component which applies Mouse Drag Events across scene components (component children) to allow the user
  * to drave curves in the 3d space.
  */
export default function DrawCurveToolHOC() {
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

  // OBJ MAP
  const elementIds = useOBJsStore(state => state.objProps);
  console.log(elementIds);

  const OBJMap = elementIds.map((obj: OBJProps, i: number) =>
    (<OBJ key={i} objUrl={`http://localhost:8080/obj/isa_BP3D_4.0_obj_99/${obj[0]}.obj`} colorProp={obj[1]} />)
  );

  return (
    < >
      <Curve vertices={vertices} hoverable={false} />
      {curvesMap}
      <group {...bindDrag} >
        {OBJMap}
      </group>
    </>
  );
}
