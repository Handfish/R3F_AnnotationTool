import { useMemo, useRef, Suspense, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import Box from './components/Box'
import OBJ from './components/OBJ'
import HilbertCurve from './components/HilbertCurve'

import { useDrag } from './hooks/useDrag';
import OrbitControls2 from './components/camera/OrbitControls';


import { Vector3 } from 'three';

import './App.css';

function Camera() {
  return (
    < >
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <OrbitControls />
    </>
  )
}

type Vertices = [number, number, number][];

function DrawCurvesTool(props: { vertices: Vertices }) {
  const [vertices, setVertices] = useState(props.vertices);
  const positions = useMemo(() => new Float32Array(([] as number[]).concat.apply([], vertices)), [vertices])
  // const positionArr = useMemo(() => new Vector3().fromArray(props.position as number[]), [props]);

  const lineRef = useRef<THREE.Line>(null!)

  useEffect(() => {
    const { current } = lineRef
    current.geometry.attributes.position.needsUpdate = true
    current.geometry.computeBoundingSphere()
  }, [lineRef, vertices])


  const {
    camera,
    // gl: { domElement }
    gl
  } = useThree();

  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const { domElement } =  gl;

    console.log(domElement);

    domElement.onmousedown = function() {
      console.log('true');
      setIsDrawing(true);
    };
    domElement.onmouseup = function() {
      console.log('false');
      setIsDrawing(false);
    };

    //TODO set eventlistener to variable and remove event listener
    return () => {};
  }, [gl])


  if(isDrawing) {
    //Mouse Position
    const drawPosition = new Vector3(1, 1, 1).toArray();
    
    setVertices([...vertices, drawPosition]);
  }


  return (
    <>
      <line ref={lineRef as any}>
        <bufferGeometry>
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="white" />
      </line>
      {/* <EndPoint position={start} onDrag={(v: any) => setStart(v.toArray())} /> */}
      {/* <EndPoint position={end} onDrag={(v: any) => setEnd(v.toArray())} /> */}
    </>
  )
}

function UseDragTool () {
  const [vertices, setVertices] = useState([[0, 0, 0], [0, 0, 1]]);

  const drawPosition = new Vector3(1, 1, 1).toArray();
  const onDrag = (v: any) => setVertices([...vertices, drawPosition])
  const onEnd = () => { console.log('end'); return null };

  let bindDrag = useDrag(onDrag, onEnd);

  return (
    <OBJ {...bindDrag} objUrl={'http://127.0.0.1:8080/obj/FJ1252_BP50280_FMA59763_Maxillary%20gingiva.obj'}/>
  );
}



export default function App() {
  return (
    <Canvas 
      gl={{ powerPreference: "high-performance", antialias: true }}
    >
      {/* <Camera /> */}

      <OrbitControls2>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <DrawCurvesTool vertices={[[0,0,0], [0,0,1]]}/>
        <HilbertCurve />
        
        <Suspense fallback={null}>
          <Box position={[-1, 0, 0]} />
          <Box position={[1, 0, 0]} />
        
          {/* <Hotspot position={[0, 0, 0]}></Hotspot> */}
          {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/testBox.obj'}/> */}

          {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1252_BP50280_FMA59763_Maxillary%20gingiva.obj'}/> */}
          <UseDragTool />
          <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1253_BP50293_FMA59764_Mandibular%20gingiva.obj'}/>
        </Suspense>
      </OrbitControls2>

    </Canvas>
  )
}
