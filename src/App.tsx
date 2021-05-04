import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, ReactThreeFiber, useFrame, useLoader } from '@react-three/fiber'
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { CanvasTexture, Group, Mesh, TextureLoader, Sprite, sRGBEncoding, Vector2, Vector3, Vector4 } from 'three';
import { useVector3Store } from './stores';
import SvgEye from './icons/Eye'
import SvgLightbulb from './icons/Lightbulb'
import SvgQuestionCircle from './icons/QuestionCircle'


interface OBJProps {
  objUrl: string;
  mtlUrl?: string;
}

type MeshProps = ReactThreeFiber.Object3DNode<Mesh, typeof Mesh>

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


  const group = useRef<Group>(null!);
  const mesh = useRef<Mesh>(obj.children[0]! as Mesh);
  const { geometry } = obj.children[0] as Mesh;

  const vec = useVector3Store(state => state.vec);
  const initialized = useVector3Store(state => state.initialized);

  /*
   * TODO - The loading of the first model should be done elsewhere
   * The store should be set before this component is loaded
   *  - This allows us to get rid of the wonky if/else translate
   *
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

  const spriteFront = useRef<Sprite>(null!);
  const spriteBack = useRef<Sprite>(null!);

  useEffect(() => {
      document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])


  // const map = useLoader(TextureLoader, "https://i.imgur.com/EZynrrA.png");
  // map.encoding = sRGBEncoding

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
  const group = useRef<Group>(null!);
  const mesh = useRef<Mesh>(null!);
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const [positionArr] = useState<Vector3>(new Vector3().fromArray(props.position as number[]));

  const { position, ...otherProps } = props;

  // Rotate mesh every frame, SpriteMaterial, this is outside of React without overhead
  useFrame(() => {
    // mesh.current.rotation.x = mesh.current.rotation.y += 0.0005
    group.current.rotation.x = group.current.rotation.y += 0.003
  })
  return (
    <group
      ref={group}
      position={position}
      >
      <mesh
        {...otherProps}
        ref={mesh}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      </mesh>
      <Hotspot position={[Math.abs(positionArr.x) - 0.5, positionArr.y - 0.5, positionArr.z + 0.5]}></Hotspot>
      <Hotspot2 position={[Math.abs(positionArr.x) - 0.5, positionArr.y - 0.5, positionArr.z - 0.5]} svg={SvgLightbulb} />
      <Hotspot2 position={[Math.abs(positionArr.x) - 0.5, positionArr.y + 0.5, positionArr.z - 0.5]} svg={SvgQuestionCircle} />
      <Hotspot2 position={[Math.abs(positionArr.x) - 0.5, positionArr.y + 0.5, positionArr.z + 0.5]} svg={SvgEye} />
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

function drawIcon({paths, viewport} : { paths: Path2D[], viewport: Vector4 }, fillStyle: string, size: Vector2) {
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
  context.fillStyle = fillStyle;

  context.shadowBlur = STROKE_SIZE;
  context.shadowColor = 'black';

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
    context.fillStyle = 'black';
    context.fill(new Path2D(paths[x]));
  }

  context.restore();

  return canvas;
}


function Hotspot2(props: MeshProps & any) {
  const [hovered, setHovered] = useState(false)

  const spriteFront = useRef<Sprite>(null!);
  const spriteBack = useRef<Sprite>(null!);

  useEffect(() => {
      document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])


  // const map = useLoader(TextureLoader, "https://i.imgur.com/EZynrrA.png");
  // map.encoding = sRGBEncoding

  const paths: Path2D[] = props.svg.paths.map((path: string) => new Path2D(path));
  const viewport = new Vector4(...props.svg.viewBox.split(' ').map((ele: string) => parseInt(ele)));
  const map = new CanvasTexture(drawIcon({paths, viewport}, 'rgba(255, 255, 255, 0.8)', new Vector2(128, 128)));

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

        {/* <Hotspot position={[0, 0, 0]}></Hotspot> */}
        {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/testBox.obj'}/> */}
        <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1252_BP50280_FMA59763_Maxillary%20gingiva.obj'}/>
        <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1253_BP50293_FMA59764_Mandibular%20gingiva.obj'}/>
      </Suspense>
    </Canvas>
  )
}
