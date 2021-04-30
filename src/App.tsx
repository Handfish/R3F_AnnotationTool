import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, ReactThreeFiber, useFrame, useLoader } from '@react-three/fiber'
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { TextureLoader, sRGBEncoding, Vector2, Vector3, Vector4 } from 'three';
import { useVector3Store } from './stores';
import THREE from 'three'

interface OBJProps {
  objUrl: string;
  mtlUrl?: string;
}

type MeshProps = ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>



function OBJ(props: MeshProps & OBJProps) {
  const { objUrl, mtlUrl, ...meshProps } = props;

  const materials = useLoader(MTLLoader, String(mtlUrl));
  const obj = useLoader(OBJLoader, objUrl, loader => {

      if(mtlUrl) {
        materials.preload()
        //@ts-ignore
        loader.setMaterials(materials) 
      }

      return loader;
  })
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const [hotspotVec, setHotspotVec] = useState<Vector3>(new Vector3());


  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.Mesh>(obj.children[0]! as THREE.Mesh);
  const { geometry } = obj.children[0] as THREE.Mesh;

  const vec = useVector3Store(state => state.vec);
  const initialized = useVector3Store(state => state.initialized);


  /*
   * Translate Buffer Geometry to Origin
   */
  useEffect(() => {
    console.log(geometry, initialized, vec);

    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    let center = new Vector3(); 

    if(geometry.boundingBox) {
      geometry.boundingBox!.getCenter(center);

      if(!initialized){
        useVector3Store.setState({ 
          vec: center,
          initialized: true
        });
      }
      else {
        geometry.translate(-vec.x, -vec.y, -vec.z);
        geometry.boundingBox!.getCenter(center);

        setHotspotVec(new Vector3(center.x + 30, center.y, center.z));
      }
    }
  }, [geometry, initialized, vec]);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
      group.current.rotation.x = group.current.rotation.y += 0.0005
    // obj.rotation.x = obj.rotation.y += 0.001;
  })

  return (
    <group
      ref={group}>
      <mesh
        {...meshProps}
        ref={mesh}
        geometry={geometry}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}>
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />

      </mesh>
    
      <Hotspot position={hotspotVec}></Hotspot>
    </group>
  )
}

function Hotspot(props: MeshProps) {
  const [hovered, setHovered] = useState(false)

  const spriteFront = useRef<THREE.Sprite>(null!);
  const spriteBack = useRef<THREE.Sprite>(null!);

  useEffect(() => {
      document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])


  //TODO UseLoader
  const map = useLoader(TextureLoader, "https://i.imgur.com/EZynrrA.png");
  map.encoding = sRGBEncoding

  return (
    <>
      <sprite
        ref={spriteFront}
        position={props.position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <spriteMaterial attach="material" map={map} />
      </sprite>

      <sprite
        ref={spriteBack}
        position={props.position}
      >
        <spriteMaterial attach="material" map={map} opacity={0.3} transparent={true} depthTest={false} />
      </sprite>
    </>
  )
}

function Box(props: MeshProps) {
  // This reference will give us direct access to the mesh
  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.Mesh>(null!);
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const [position] = useState<Vector3>(new Vector3().fromArray(props.position as number[]));

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    // mesh.current.rotation.x = mesh.current.rotation.y += 0.0005
    group.current.rotation.x = group.current.rotation.y += 0.0005
  })
  return (
    <group
      ref={group}>
      <mesh
        {...props}
        ref={mesh}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      </mesh>
      <Hotspot position={[position.x + 0.5, position.y + 0.5, position.z + 0.5]}></Hotspot>
    </group>
  )
}

function Camera() {
  return (
    < >
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <OrbitControls />
    </>
  )
}

function drawIcon({path, viewport} : { path: Path2D, viewport: Vector4 }, fillStyle: string, size: Vector2) {
  const canvas = document.createElement('canvas');
  const { width, height} = size;
  const minSize = Math.min(width, height);
  canvas.width = parseInt(`${width}`);
  canvas.height = parseInt(`${height}`);
  const iconRatio = viewport.width / viewport.height;
  const canvasRatio = width / height;
  const scale = canvasRatio > iconRatio ? height / viewport.height : width / viewport.width;
  const context = canvas.getContext('2d')!;

  // draw white background
  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fill();
  context.beginPath();
  context.fillStyle = fillStyle;
  context.arc(minSize / 2, minSize / 2, minSize / 2, 0, 2 * Math.PI);
  context.fillStyle = 'black';
  context.fill();
  context.translate(width / 2, height / 2);
  context.scale(scale, scale);
  context.translate(-viewport.x - viewport.width / 2, - viewport.y - viewport.height / 2);
  context.beginPath();
  context.fillStyle = 'red';
  context.fill(new Path2D(path));
  context.restore();

  return canvas;
}

export default function App() {
  return (
    <Canvas>
      <Camera />

      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      <Suspense fallback={null}>
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <Hotspot position={[0, 0, 0]}></Hotspot>
        {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/testBox.obj'}/> */}
        {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1252_BP50280_FMA59763_Maxillary%20gingiva.obj'}/> */}
        {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1253_BP50293_FMA59764_Mandibular%20gingiva.obj'}/> */}
      </Suspense>
    </Canvas>
  )
}
