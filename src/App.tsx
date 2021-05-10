import { Suspense, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import Box from './components/Box'
import OBJ from './components/OBJ'
import HilbertCurve from './components/HilbertCurve'

import './App.css';

function Camera() {
  return (
    < >
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <OrbitControls />
    </>
  )
}

function DrawCurvesTool () {
  const {
    camera,
    // gl: { domElement }
    gl
  } = useThree();

  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const { domElement } =  gl;

    domElement.onmousedown = function() {
      setIsDrawing(true);
    };
    domElement.onmouseup = function() {
      setIsDrawing(false);
    };

    //TODO set eventlistener to variable and remove event listener
    return () => {};
  }, [gl])


  if(isDrawing) {

  }

  return (
    <>
    </>
  );
}

export default function App() {
  return (
    <Canvas
        gl={{ powerPreference: "high-performance", antialias: true }}
    >
      <Camera />

      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      <DrawCurvesTool />
      <HilbertCurve />

      <Suspense fallback={null}>
        <Box position={[-1, 0, 0]} />
        <Box position={[1, 0, 0]} />

        {/* <Hotspot position={[0, 0, 0]}></Hotspot> */}
        {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/testBox.obj'}/> */}
        <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1252_BP50280_FMA59763_Maxillary%20gingiva.obj'}/>
        <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1253_BP50293_FMA59764_Mandibular%20gingiva.obj'}/>
      </Suspense>
    </Canvas>
  )
}
