import { useMemo, useRef, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import Annotation from './components/Annotation'
import HotspotSvg from './components/HotspotSvg';
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

import type { Vertices } from './@types/custom-typings';

import './App.css';
// import Eye from './icons-react/Eye';
import SvgEye from './icons/Eye';


// import { TouchBackend } from 'react-dnd-touch-backend';
// import { DndProvider } from 'react-dnd-multi-backend';
//
// import { DndProvider } from 'react-dnd';
import { useDrag as useDndDrag, useDrop as useDndDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';

import { Box as Test } from './web/DraggableIconDnd';
import { ItemTypes } from './web/ItemTypes';

import { useDndHotspotSvgsStore } from './stores/stores';
// import type { PendingAnnotation } from './stores/stores';



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


function DndHotspotSvgBuilder () {
  const { scene, raycaster, camera } = useThree();
  const pendingDndHotspotSvg  = useDndHotspotSvgsStore(state => state.pendingDndHotspotSvg);
  //const setPendingDndHotspotSvg = useDndHotspotSvgsStore(state => state.setPendingDndHotspotSvg);
  const hotspotSvgs = useDndHotspotSvgsStore(state => state.hotspotSvgs);
  const setDndHotspotSvgs = useDndHotspotSvgsStore(state => state.setDndHotspotSvgs);

  const CONTAINING_DIV_WIDTH = 1024;
  const CONTAINING_DIV_HEIGHT = 576;

  useEffect(() => {
    if(pendingDndHotspotSvg !== null) {
      const mouseVector = new Vector3();
      mouseVector.x = ( pendingDndHotspotSvg!.vec2.x / CONTAINING_DIV_WIDTH ) * 2 - 1;
      mouseVector.y = - ( pendingDndHotspotSvg!.vec2.y / CONTAINING_DIV_HEIGHT ) * 2 + 1;
      mouseVector.z = 1;

      // console.log(raycaster);
      // console.log(mouseVector);
      // console.log(camera);

      raycaster.setFromCamera( mouseVector, camera );

      const intersections = raycaster.intersectObjects( scene.children, true );

      if(intersections.length > 0) {
        const closestIntersection = intersections.reduce((prev, curr) => {
          return prev.distance < curr.distance ? prev : curr;
        });

        // console.log(closestIntersection);

        const newDndHotspotSvg = {
          //position: closestIntersection.point,
          position: closestIntersection.point.add(closestIntersection.face!.normal),
          icon: SvgEye
        };
        
        setDndHotspotSvgs([...hotspotSvgs, newDndHotspotSvg]);
      }
    } 
  }, [pendingDndHotspotSvg]);

  // console.log(scene, raycaster, camera);

  return (
    <></>
  );
}

function DndHotspotSvgs () {
  const hotspotSvgs = useDndHotspotSvgsStore(state => state.hotspotSvgs);

  const hotspotSvgsMap = hotspotSvgs.map((hotspotSvg, i) =>
    (<HotspotSvg key={i} position={hotspotSvg.position} svg={hotspotSvg.icon} />)
  );

  //TODO - Separate props so objUrl isnt reloaded
  return (
    < >
      {hotspotSvgsMap}
    </>
  );
}

function App() {
  const setPendingDndHotspotSvg = useDndHotspotSvgsStore(state => state.setPendingDndHotspotSvg);
  let point: { x: number, y: number } = { x: 0, y: 0 };

	const [{ canDrop, isOver }, drop] = useDndDrop(() => ({
		accept: ItemTypes.BOX,
		drop: () => {
      console.log(point);

      setPendingDndHotspotSvg({
        vec2: new Vector2(point.x, point.y),
        icon: SvgEye
      })
      return { name: 'Canvas' };
    }
    ,
    collect: (monitor: any) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
    hover: (item, monitor) => {
      point = monitor.getClientOffset()!;
    }
	}))

	// const isActive = canDrop && isOver;

	// let backgroundColor = '#222';
	// if (isActive) {
	// 	backgroundColor = 'darkgreen';
	// } else if (canDrop) {
	// 	backgroundColor = 'darkkhaki';
	// }

  // const [hovered, set] = useState(null)
  // useEffect(() => {
  //   const cursor = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><g filter="url(#filter0_d)"><path d="M29.5 47C39.165 47 47 39.165 47 29.5S39.165 12 29.5 12 12 19.835 12 29.5 19.835 47 29.5 47z" fill="${backgroundColor}"/></g><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/><text fill="#000" style="white-space:pre" font-family="Inter var, sans-serif" font-size="10" letter-spacing="-.01em"><tspan x="35" y="63">${hovered}</tspan></text></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h64v64H0z"/></clipPath><filter id="filter0_d" x="6" y="8" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="2"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`
  //   const auto = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></svg>`
  //   document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(hovered ? cursor : auto)}'), auto`
  // }, [hovered])

  return (
    <>
        <div ref={drop} className={'app-container'}
        >

          <Canvas 
            gl={{ powerPreference: "high-performance", antialias: true }}
          >
            <DndHotspotSvgBuilder />
            <DndHotspotSvgs />
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
        </div>

        {/* <Eye style={{float: "left"}} className={'pointer'} width="60px" height="60px"/> */}
        <Test name={"test"}/>

    </>
  )
}

export default function DropAndDropApp() {
  return (
    <DndProvider options={HTML5toTouch}>
      <App />
    </DndProvider>
  );
}
