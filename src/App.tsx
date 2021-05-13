import { useMemo, useRef, Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Box from './components/Box'
import OBJ from './components/OBJ'
// import HilbertCurve from './components/HilbertCurve'

import { useDrag } from './hooks/useDrag';
import BasicCamera from './components/BasicCamera'

import { CatmullRomCurve3, Color, Object3D, Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

import './App.css';

type Vertices = Vector3[];

function DrawCurvesTool(props: { vertices: Vertices }) {

  //TODO Split useMemo to utilize updateGeometry flags instead of building new line
  const line = useMemo(() => {
    if(props.vertices.length === 0 || props.vertices.length === 1)
      return new Object3D();

    const positions: number[] = [];
    const colors: number[] = [];

    const spline = new CatmullRomCurve3( props.vertices );
    const divisions = Math.round( 12 * props.vertices.length );
    const point = new Vector3();
    const color = new Color();

    for ( let i = 0, l = divisions; i < l; i ++ ) {
      const t = i / l;

      spline.getPoint( t, point );
      positions.push( point.x, point.y, point.z );

      color.setHSL( t, 1.0, 0.5 );
      colors.push( color.r, color.g, color.b );
    }

    const geometry = new LineGeometry();
    geometry.setPositions( positions );
    geometry.setColors( colors );

    const matLine = new LineMaterial( {
      color: 0xffffff,
      linewidth: 5, // in pixels
      vertexColors: true,
      resolution: new Vector2(window.innerWidth, window.innerHeight), // TODO - react to windowsize - to be set by renderer, eventually
      dashed: false,
      alphaToCoverage: false, // https://threejs.org/docs/#api/en/materials/Material.alphaToCoverage
    } );

    const line = new Line2( geometry, matLine );
    line.computeLineDistances();
    line.scale.set( 1, 1, 1 );

    return line;
  }, [props.vertices]);

  useEffect(() => {
    // console.log(props.vertices);
  }, [props.vertices]);

  return (
    <primitive
      object={line} 
    ></primitive>
  );
}

function UseDragTool () {
  const [vertices, setVertices] = useState<Vertices>([]);
  const verticesRef = useRef<any>();

  useEffect(() => {
    verticesRef.current = vertices
  })

  const onDrag = (v: any) => { 
    setVertices([...verticesRef.current, v]);
  };

  // useEffect(() => {
  //   console.log('changed', vertices);
  // }, [vertices])

  const onEnd = () => { console.log('end'); return null };

  let bindDrag = useDrag(onDrag, onEnd);

  return (
    < >
      <OBJ {...bindDrag} objUrl={'http://127.0.0.1:8080/obj/FJ1252_BP50280_FMA59763_Maxillary%20gingiva.obj'}/>
      <DrawCurvesTool vertices={vertices}/>
    </>
  );
}

export default function App() {
  return (
    <Canvas 
      gl={{ powerPreference: "high-performance", antialias: true }}
    >
      <BasicCamera />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      
      {/* <HilbertCurve /> */}
      
      <Suspense fallback={null}>
        <Box position={[-1, 0, 0]} />
        <Box position={[1, 0, 0]} />
      
        {/* <Hotspot position={[0, 0, 0]}></Hotspot> */}
        {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/testBox.obj'}/> */}

        {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1252_BP50280_FMA59763_Maxillary%20gingiva.obj'}/> */}
        <UseDragTool />
        <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1253_BP50293_FMA59764_Mandibular%20gingiva.obj'}/>
      </Suspense>

    </Canvas>
  )
}
