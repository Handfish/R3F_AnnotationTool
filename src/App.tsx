import { useMemo, useRef, Suspense, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import Annotation from './components/Annotation'
import HotspotSvg from './components/HotspotSvg';

import OBJ from './components/OBJ'

import { useDrag } from './hooks/useDrag';
import BasicCamera from './components/BasicCamera'

import { Box3, CatmullRomCurve3, Color, Object3D, Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

import { useMouseEvents } from './hooks/useMouseEvents';
import { v4 as uuidv4 } from 'uuid';

import type { DndIconItem, Vertices } from './@types/custom-typings';

import './App.css';

import Eye from './icons-react/Eye';
import SvgEye from './icons/Eye';

import Lightbulb from './icons-react/Lightbulb';
import SvgLightbulb from './icons/Lightbulb';

import QuestionCircle from './icons-react/QuestionCircle';
import SvgQuestionCircle from './icons/QuestionCircle';

import Hourglass from './icons-react/Hourglass';
import SvgHourglass from './icons/Hourglass';

import { Perf } from 'r3f-perf'

import { DropTargetMonitor, useDrop as useDndDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';

import { DndIcon } from './web/DraggableIconDnd';
import { ItemTypes } from './web/ItemTypes';

import { DndHotspotSvgProps, useDndHotspotSvgsStore } from './stores/stores';
// import type { PendingAnnotation } from './stores/stores';

import { useOBJsStore } from './stores/stores';

import MySearch from './web/fuse/MySearch';

function Curve(props: { vertices: Vertices, hoverable: boolean }) {
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

function DrawCurveToolHOC() {
  // const [,forceUpdate] = useState();

  const [vertices, setVertices] = useState<Vertices>([]);
  const [curves, setCurves] = useState<Vertices[]>([]);

  //https://stackoverflow.com/a/58877875
  const verticesRef = useRef<Vertices>([]);
  useEffect(() => void (verticesRef.current = vertices));
  const curvesRef = useRef<Vertices>([]);
  useEffect(() => void (curvesRef.current = curves));

  const onDrag = (v: Vector3) => {
    const haveNewVerticesBeenDrawn = !vertices?.[vertices.length - 1]?.equals(v)

    if (vertices.length > 0 && haveNewVerticesBeenDrawn)
      setVertices([...verticesRef.current, v]);
    else if (vertices.length === 0)
      setVertices([...verticesRef.current, v]);
  };

  const onEnd = () => {
    setCurves([...(curvesRef.current.filter((array: Vertices) => array.length > 0)), verticesRef.current]);
  };

  useEffect(() => {
    setVertices([]);
  }, [curves]);

  const curvesMap = curves.map((_, i) =>
    (<Curve key={i} vertices={curves[i]} hoverable={true} />)
  );

  const bindDrag = useDrag(onDrag, onEnd);

  // OBJ MAP
  const elementIds = useOBJsStore(state => state.objProps);
  console.log(elementIds);

  const OBJMap = elementIds.map((obj, i) =>
    (<OBJ key={i} objUrl={`http://localhost:8080/obj/isa_BP3D_4.0_obj_99/${obj[0]}.obj`} colorProp={obj[1]} />)
  );

  return (
    < >
      <Curve vertices={vertices} hoverable={false} />
      {curvesMap}
      <group {...bindDrag} >
        {OBJMap}
      </group>
    </>
  );
}

function DndHotspotSvgBuilder() {
  const { scene, raycaster, camera } = useThree();
  const pendingDndHotspotSvg = useDndHotspotSvgsStore(state => state.pendingDndHotspotSvg);
  //const setPendingDndHotspotSvg = useDndHotspotSvgsStore(state => state.setPendingDndHotspotSvg);
  const hotspotSvgs = useDndHotspotSvgsStore(state => state.hotspotSvgs);
  const setDndHotspotSvgs = useDndHotspotSvgsStore(state => state.setDndHotspotSvgs);

  const CONTAINING_DIV_WIDTH = 1024;
  const CONTAINING_DIV_HEIGHT = 576;

  /*
  * In order for the main useEffect to have a proper
  * dependency array we use refs to utilize problematic react life cycle memory
  */
  const sceneChildrenRef = useRef<Object3D[]>([]);
  useEffect(() => void (sceneChildrenRef.current = scene.children));

  const hotspotSvgsRef = useRef<DndHotspotSvgProps[]>([]);
  useEffect(() => void (hotspotSvgsRef.current = hotspotSvgs));

  /*
  * Main useEffect responsible for constructing objects handling SVG data and sprite data
  * for hotspots in canvas
  */
  useEffect(() => {
    if (pendingDndHotspotSvg !== null) {

      const mouseVector = new Vector2();
      mouseVector.x = (pendingDndHotspotSvg!.vec2.x / CONTAINING_DIV_WIDTH) * 2 - 1;
      mouseVector.y = - (pendingDndHotspotSvg!.vec2.y / CONTAINING_DIV_HEIGHT) * 2 + 1;

      // console.log(raycaster);
      // console.log(mouseVector);
      // console.log(camera);

      raycaster.setFromCamera(mouseVector, camera);

      const intersections = raycaster.intersectObjects(sceneChildrenRef.current, true);

      if (intersections.length > 0) {
        const closestIntersection = intersections.reduce((prev, curr) => {
          return prev.distance < curr.distance ? prev : curr;
        });

        // console.log(closestIntersection);

        const newDndHotspotSvg = {
          //position: closestIntersection.point,
          position: closestIntersection.point.add(closestIntersection.face!.normal),
          icon: pendingDndHotspotSvg!.icon
        };

        setDndHotspotSvgs([...hotspotSvgsRef.current, newDndHotspotSvg]);
      }
    }
  }, [pendingDndHotspotSvg
    , camera
    , raycaster
    , setDndHotspotSvgs
    , hotspotSvgsRef
    , sceneChildrenRef
  ]);

  return (
    <></>
  );
}

function DndHotspotSvgs() {
  const hotspotSvgs = useDndHotspotSvgsStore(state => state.hotspotSvgs);

  const hotspotSvgsMap = hotspotSvgs.map((hotspotSvg, i) =>
    (<HotspotSvg key={i} position={hotspotSvg.position} svg={hotspotSvg.icon} />)
  );

  return (
    < >
      {hotspotSvgsMap}
    </>
  );
}

function App() {
  const setPendingDndHotspotSvg = useDndHotspotSvgsStore(state => state.setPendingDndHotspotSvg);
  let point: { x: number, y: number } = { x: 0, y: 0 };

  // const [{ canDrop, isOver }, drop] = useDndDrop(() => ({
  const [, drop] = useDndDrop(() => ({
    accept: ItemTypes.ICON,
    drop: (item: DndIconItem) => {
      console.log(point);

      setPendingDndHotspotSvg({
        vec2: new Vector2(point.x, point.y),
        icon: item.icon
      })
      return { name: 'Canvas' };
    }
    ,
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover: (_, monitor) => {
      point = monitor.getClientOffset()!;
    }
  }))

  return (
    <>
      <div ref={drop} className={'app-container'}
      >
        <Canvas
          gl={{ powerPreference: "high-performance", antialias: true }}
        >
          <Perf />
          <DndHotspotSvgBuilder />
          <DndHotspotSvgs />
          <BasicCamera />
          <ambientLight intensity={0.8} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />

          {/* <HilbertCurve /> */}

          <Suspense fallback={null}>
            {/* <Box position={[-1, 0, 0]} /> */}
            {/* <Box position={[1, 0, 0]} /> */}

            {/* <Hotspot position={[0, 0, 0]}></Hotspot> */}
            {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/testBox.obj'}/> */}

            {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1252_BP50280_FMA59763_Maxillary%20gingiva.obj'}/> */}
            <DrawCurveToolHOC />
            {/* <CurvesArray /> */}

            {/* <OBJStoreMap /> */}
            {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1253_BP50293_FMA59764_Mandibular%20gingiva.obj'}/> */}
          </Suspense>

        </Canvas>
      </div>

      <DndIcon name={"Eye"} icon={SvgEye}>
        <Eye width="60px" height="60px" />
      </DndIcon>

      <DndIcon name={"Lightbulb"} icon={SvgLightbulb}>
        <Lightbulb width="60px" height="60px" />
      </DndIcon>

      <DndIcon name={"QuestionCircle"} icon={SvgQuestionCircle}>
        <QuestionCircle width="60px" height="60px" />
      </DndIcon>

      <DndIcon name={"Hourglass"} icon={SvgHourglass}>
        <Hourglass width="60px" height="60px" />
      </DndIcon>

      <MySearch />
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
