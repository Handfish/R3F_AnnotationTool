import { useMemo, useRef, Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Box from './components/Box'
import OBJ from './components/OBJ'
import HilbertCurve from './components/HilbertCurve'

import { useDrag } from './hooks/useDrag';
import BasicCamera from './components/BasicCamera'

import { Vector3 } from 'three';

import './App.css';


type Vertices = [number, number, number][];

function DrawCurvesTool(props: { vertices: Vertices }) {
  const positions = useMemo(() => new Float32Array(([] as number[]).concat(...props.vertices)), [props.vertices])
  // const positionArr = useMemo(() => new Vector3().fromArray(props.position as number[]), [props]);

  const lineRef = useRef<THREE.Line>(null!)

  useEffect(() => {
    // const { current } = lineRef;
    // current.geometry.attributes.position.needsUpdate = true;
    // current.geometry.computeBoundingSphere();
    console.log(positions);
    // console.log(current);
  }, [lineRef, positions]);

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
  const [vertices, setVertices] = useState<Vertices>([[0, 0, 0], [0, 0, 1]]);

  const drawPosition = new Vector3(1, 1, 1).toArray();
  const onDrag = (v: any) => setVertices([...vertices, drawPosition])
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

    </Canvas>
  )
}
