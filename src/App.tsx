import { useMemo, useRef, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import Annotation from './components/Annotation'
import Box from './components/Box'
import OBJ from './components/OBJ'
// import Hotspot from './components/Hotspot'

// import HilbertCurve from './components/HilbertCurve'

import { useDrag } from './hooks/useDrag';
import BasicCamera from './components/BasicCamera'

import { Box3, CatmullRomCurve3, Color, Object3D, Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

import { useMouseEvents } from './hooks/useMouseEvents';
import { v4 as uuidv4 } from 'uuid';
// import { useCurvesStore } from './stores/stores';

import type { Vertices } from './@types/custom-typings';

import './App.css';


function Curve(props: { vertices: Vertices, hoverable: boolean }) {
  const [active, setActive] = useState(false);
  const lineMaterialRef = useRef<any>(null!);

  // const lineGeometryRef = useRef<any>(null!);

  const uuid = useMemo(() => uuidv4(), []);
  const { onPointerOver: mouseEventsMapOver, onPointerOut: mouseEventsMapOut } = useMouseEvents(uuid);

  //TODO Split useMemo to utilize updateGeometry flags instead of building new line
  const [line, position, geometryVector] = useMemo(() => {
    let position = new Vector3(0,0,0), geometryVector = new Vector3(0,0,0);

    if(props.vertices === undefined || props.vertices.length === 0 || props.vertices.length === 1)
      return [new Object3D(), position, geometryVector];

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
      linewidth: 8, // in pixels
      vertexColors: true,
      resolution: new Vector2(window.innerWidth, window.innerHeight), // TODO - react to windowsize - to be set by renderer, eventually
      dashed: false,
      alphaToCoverage: false, // https://threejs.org/docs/#api/en/materials/Material.alphaToCoverage
    } );

    const line = new Line2( geometry, matLine );
    line.computeLineDistances();
    line.scale.set( 1, 1, 1 );



    const bbox = new Box3().setFromObject(line);

    if(bbox.min.x !== Infinity && 
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
        onPointerOver={() => {
          if(props.hoverable) {
            mouseEventsMapOver(uuid);
            lineMaterialRef.current.vertexColors = false;
            lineMaterialRef.current.needsUpdate = true;
          }
        }}
        onPointerOut={() => {
          if(props.hoverable) {
            mouseEventsMapOut(uuid);
            lineMaterialRef.current.vertexColors = true;
            lineMaterialRef.current.needsUpdate = true;
          }
        }}
        onClick={(e) => {
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

function DrawCurveTool () {
  // const [,forceUpdate] = useState();

  const [vertices, setVertices] = useState<Vertices>([]);
  const [curves, setCurves] = useState<Vertices[]>([]);

  //https://stackoverflow.com/a/58877875
  const verticesRef = useRef<any>([]);
  const curvesRef = useRef<any>([]);

  // const curvesRef = useCallbackRef<any>([], () => setCurves([...curves, vertices]));

  useEffect(() => {
    verticesRef.current = vertices;
    curvesRef.current = curves;
  })

  const onDrag = (v: any) => { 
    // console.log(v)

    // setVertices([...verticesRef.current, v]);

    if(vertices.length > 0 && !vertices[vertices.length-1].equals(v))
      setVertices([...verticesRef.current, v]);
    else if(vertices.length <= 0)
      setVertices([...verticesRef.current, v]);
  };

  const onEnd = () => { 
      setCurves([...(curvesRef.current.filter((array: Vertices) => array.length > 0)), verticesRef.current]);
  };

  useEffect(() => {
    // useCurvesStore.setState({ 
    //   curves,
    // });

    setVertices([]);
  }, [curves]);



  const curvesMap = curves.map((curve, i) =>
    (<Curve key={i} vertices={curves[i]} hoverable={true} />)
  );

  const bindDrag = useDrag(onDrag, onEnd);


  //TODO - Separate props so objUrl isnt reloaded
  return (
    < >
      <OBJ {...bindDrag} objUrl={'http://127.0.0.1:8080/obj/FJ1252_BP50280_FMA59763_Maxillary%20gingiva.obj'}/>
      <Curve vertices={vertices} hoverable={false}/>
      {curvesMap}
    </>
  );
}

// function CurvesArray() {
//   const curves = useCurvesStore(state => state.curves);
  
//   const curvesMap = curves.map((curve, i) =>
//     (<Curve key={i} vertices={curves[i]}  />)
//   );

//   return (
//     <>
//       {curvesMap}
//     </>
//   );
// }


function RaycasterInfo () {
  const { raycaster, camera } = useThree();
  console.log(raycaster, camera);

  return (
    <></>
  );
}


export default function App() {
  return (
    <Canvas 
      gl={{ powerPreference: "high-performance", antialias: true }}
    >
      <RaycasterInfo />
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
        <DrawCurveTool />
        {/* <CurvesArray /> */}
        <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1253_BP50293_FMA59764_Mandibular%20gingiva.obj'}/>
      </Suspense>

    </Canvas>
  )
}
