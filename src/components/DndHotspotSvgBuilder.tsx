import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Object3D, Vector2 } from 'three';
import { DndHotspotSvgProps, useDndHotspotSvgsStore } from '../stores/stores';

export default function DndHotspotSvgBuilder() {
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
