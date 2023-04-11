import { useMemo, useRef, useEffect, useState } from 'react'
import Annotation from './Annotation'

import type { Vertices } from '../@types/custom-typings';

import { Box3, CatmullRomCurve3, Color, Object3D, Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

import { useMouseEvents } from '../hooks/useMouseEvents';
import { v4 as uuidv4 } from 'uuid';


export default function Curve(props: { vertices: Vertices, hoverable: boolean }) {
  const [active, setActive] = useState(false);
  const lineMaterialRef = useRef<LineMaterial>(null!);

  // const lineGeometryRef = useRef<any>(null!);

  const uuid = useMemo(() => uuidv4(), []);
  const { onPointerOver: mouseEventsMapOver, onPointerOut: mouseEventsMapOut } = useMouseEvents(uuid);

  //TODO Split useMemo to utilize updateGeometry flags instead of building new line
  const [line, position, geometryVector] = useMemo(() => {
    let position = new Vector3(0, 0, 0), geometryVector = new Vector3(0, 0, 0);

    if (props.vertices === undefined || props.vertices.length === 0 || props.vertices.length === 1)
      return [new Object3D(), position, geometryVector];

    const positions: number[] = [];
    const colors: number[] = [];

    const spline = new CatmullRomCurve3(props.vertices);
    const divisions = Math.round(12 * props.vertices.length);
    const point = new Vector3();
    const color = new Color();

    for (let i = 0, l = divisions; i < l; i++) {
      const t = i / l;

      spline.getPoint(t, point);
      positions.push(point.x, point.y, point.z);

      color.setHSL(t, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);

    const matLine = new LineMaterial({
      color: 0xffffff,
      linewidth: 8, // in pixels
      vertexColors: true,
      resolution: new Vector2(window.innerWidth, window.innerHeight), // TODO - react to windowsize - to be set by renderer, eventually
      dashed: false,
      alphaToCoverage: false, // https://threejs.org/docs/#api/en/materials/Material.alphaToCoverage
    });

    const line = new Line2(geometry, matLine);
    line.computeLineDistances();
    line.scale.set(1, 1, 1);

    const bbox = new Box3().setFromObject(line);

    if (bbox.min.x !== Infinity &&
      bbox.min.y !== Infinity &&
      bbox.min.z !== Infinity &&
      bbox.max.x !== Infinity &&
      bbox.max.y !== Infinity &&
      bbox.max.z !== Infinity
    ) {
      position = new Vector3()
      bbox.getCenter(position);
      geometryVector = new Vector3().copy(bbox.max).sub(bbox.min);
    }

    return [line, position, geometryVector];
  }, [props.vertices]);

  useEffect(() => {
    // console.log(props.vertices);
  }, [props.vertices]);


  useEffect(() => {
    lineMaterialRef.current = (line as Line2)!.material || new LineMaterial();
    // lineGeometryRef.current = (line as Line2)!.geometry || new LineGeometry();
  }, [line]);


  return (
    <>
      <primitive
        object={line}
      ></primitive>

      <mesh
        position={position.toArray()}
        onPointerOver={(e) => {
          if (props.hoverable) {
            mouseEventsMapOver(e);
            lineMaterialRef.current.vertexColors = false;
            lineMaterialRef.current.needsUpdate = true;
          }
        }}
        onPointerOut={(e) => {
          if (props.hoverable) {
            mouseEventsMapOut(e);
            lineMaterialRef.current.vertexColors = true;
            lineMaterialRef.current.needsUpdate = true;
          }
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
          setActive(!active)
        }}
      >
        <boxGeometry args={geometryVector.toArray()} />
        <meshStandardMaterial color={'green'} visible={false} />
      </mesh>

      <Annotation position={position.toArray()} active={active}></Annotation>
    </>
  );
}
