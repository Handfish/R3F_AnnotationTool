import { Suspense, } from 'react'
import { Canvas } from '@react-three/fiber'
import { Vector2 } from 'three';

import BasicCamera from './components/BasicCamera'
import DndHotspotSvgs from './components/DndHotspotSvgs';
import DndHotspotSvgBuilder from './components/DndHotspotSvgBuilder';
import DrawCurveToolHOC from './components/DrawCurveToolHOC';

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

import type { DndIconItem } from './@types/custom-typings';
import { DndIcon } from './web/DraggableIconDnd';
import { ItemTypes } from './web/ItemTypes';

import { useDndHotspotSvgsStore } from './stores/stores';
// TODO - write simple annotation customization DOM component
// import type { PendingAnnotation } from './stores/stores';

import OrganSearch from './web/fuse/OrganSearch';

function App() {
  // Utilized in useDndDrop
  const setPendingDndHotspotSvg = useDndHotspotSvgsStore(state => state.setPendingDndHotspotSvg);
  let point: { x: number, y: number } = { x: 0, y: 0 };

  // Implements the SVG Icon drop into canvas scene functionality
  //
  // Purposely retained code to show how drag and drop logic can be further extended.
  //    const [{ canDrop, isOver }, drop] = useDndDrop(() => ({
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

          {/* Curve example */}
          {/**/}
          {/* <HilbertCurve /> */}

          <Suspense fallback={null}>
            <DrawCurveToolHOC />

            {/* Series of Prefabs example */}
            {/**/}
            {/* <Box position={[-1, 0, 0]} /> */}
            {/* <Box position={[1, 0, 0]} /> */}
            {/* <Hotspot position={[0, 0, 0]}></Hotspot> */}
            {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/testBox.obj'}/> */}
            {/* <OBJ objUrl={'http://127.0.0.1:8080/obj/FJ1252_BP50280_FMA59763_Maxillary%20gingiva.obj'}/> */}

            {/* Scene without CurveTool */}
            {/**/}
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

      <OrganSearch />
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
