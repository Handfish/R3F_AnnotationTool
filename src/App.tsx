import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, ReactThreeFiber, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { CatmullRomCurve3, CanvasTexture, Color, Group, Mesh, TextureLoader, Sprite, sRGBEncoding, Vector2, Vector3, Vector4 } from 'three';
import { useVector3Store } from './stores';

import SvgEye from './icons/Eye'
import SvgLightbulb from './icons/Lightbulb'
import SvgQuestionCircle from './icons/QuestionCircle'
import './App.css';


import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils.js'


interface OBJProps {
  objUrl: string;
  mtlUrl?: string;
}

type MeshProps = ReactThreeFiber.Object3DNode<Mesh, typeof Mesh>

interface Hotspot2Props extends MeshProps {
  svg?: any
}

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
    // console.log(geometry, initialized, vec);

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

  const map = useLoader(TextureLoader, "https://i.imgur.com/EZynrrA.png");
  map.encoding = sRGBEncoding;

  useFrame(({ camera }) => {
    const scaleVector = new Vector3();
    const scaleFactor = 20;
    const subVector = scaleVector.subVectors(spriteFront.current.getWorldPosition(new Vector3())! as Vector3, camera.position);
    const scale = subVector.length() / scaleFactor;
    spriteFront.current.scale.set(scale, scale, 1);
    spriteBack.current.scale.set(scale, scale, 1);
  })

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

function Box(props: MeshProps & Hotspot2Props) {
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
      <Hotspot position={new Vector3(Math.abs(positionArr.x) - 0.5, positionArr.y - 0.5, positionArr.z + 0.5)}></Hotspot>
      <Hotspot2 position={new Vector3(Math.abs(positionArr.x) - 0.5, positionArr.y - 0.5, positionArr.z - 0.5)} svg={SvgLightbulb} />
      <Hotspot2 position={new Vector3(Math.abs(positionArr.x) - 0.5, positionArr.y + 0.5, positionArr.z - 0.5)} svg={SvgQuestionCircle} />
      <Hotspot2 position={new Vector3(Math.abs(positionArr.x) - 0.5, positionArr.y + 0.5, positionArr.z + 0.5)} svg={SvgEye} />
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

function drawIcon({paths, viewport} : { paths: Path2D[], viewport: Vector4 }, iconFillColor: string, size: Vector2) {
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
  context.fillStyle = 'rgba(255, 255, 255, 0.8)';

  context.shadowBlur = STROKE_SIZE;
  context.shadowColor = iconFillColor;
  // context.shadowColor = 'black';

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
    context.fillStyle = iconFillColor;
    context.fill(new Path2D(paths[x]));
  }

  context.restore();
  return canvas;
}


function Hotspot2(props: Hotspot2Props) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  const spriteFront = useRef<Sprite>(null!);
  const spriteBack = useRef<Sprite>(null!);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  const map = useMemo(() => {
    const paths = props.svg.paths.map((path: string) => new Path2D(path));
    const viewport = new Vector4(...props.svg.viewBox.split(' ').map((ele: string) => parseInt(ele)));
    const map = new CanvasTexture(drawIcon({paths, viewport}, !active ? 'black' : 'teal', new Vector2(128, 128)));
    return map;
  }, [props, active]);

  useFrame(({ camera }) => {
    const scaleVector = new Vector3();
    const scaleFactor = 20;
    // const subVector = scaleVector.subVectors(props.position! as Vector3, camera.position);
    const subVector = scaleVector.subVectors(spriteFront.current.getWorldPosition(new Vector3())! as Vector3, camera.position);
    const scale = subVector.length() / scaleFactor;
    spriteFront.current.scale.set(scale, scale, 1);
    spriteBack.current.scale.set(scale, scale, 1);
  })

  return (
    <>
      <sprite
        ref={spriteFront}
        position={props.position}
      >
        <spriteMaterial attach="material" map={map} />
      </sprite>

      <sprite
        ref={spriteBack}
        position={props.position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setActive(!active)}
      >
        <spriteMaterial attach="material" map={map} opacity={0.3} transparent={true} depthTest={false} />
      </sprite>

      <Annotation position={props.position} active={active}></Annotation>
    </>
  )
}

interface AnnotationProps {
  content?: string;
  active: boolean;
}

function Annotation (props: MeshProps & AnnotationProps) {
  return (
    <Html position={props.position} style={{ width:'260px', pointerEvents: 'none' }}>
      <div className='annotation-content' hidden={!props.active}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
        sed do eiusmod tempor incididunt ut labore et dolore  
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation  
      </div>
    </Html>
  );
}


function DrawCurvesTool () {
  const {
    camera,
    gl: { domElement }
  } = useThree();


  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    domElement.onmousedown = function(e) {
      setIsDrawing(true);
    };
    domElement.onmouseup = function(e) {
      setIsDrawing(false);
    };

    //TODO set eventlistener to variable and remove event listener
    return () => {};
  }, [domElement])


  if(isDrawing) {

  }

  //-------------------
  //-------------------
  //-------------------
  
  const [geometry, matLine, line] = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];

    const points = GeometryUtils.hilbert3D( new Vector3( 0, 0, 0 ), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7 );

    const spline = new CatmullRomCurve3( points );
    const divisions = Math.round( 12 * points.length );
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
      alphaToCoverage: true,
    } );

    const line = new Line2( geometry, matLine );

    return [geometry, matLine, line];
  }, []);

  const lineRef = useRef<Mesh>(line as Mesh);

  return (
    <mesh
      ref={lineRef}
      geometry={geometry}
      material={matLine}
    >
    </mesh>
  );
}




export default function App() {
  return (
    <Canvas>
      <Camera />

      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      <DrawCurvesTool />

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
