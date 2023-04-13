import { useEffect, useMemo, useRef, useState } from 'react'
import { useLoader } from '@react-three/fiber'
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { Group, Mesh, Vector3 } from 'three';
import { useGlobalAdjustedOriginStore } from '../stores/stores';

import type { MeshProps, OBJInitProps } from '../@types/custom-typings';

/**
* Renderable OBJ with color props and logic to center camera on their origin
*/
export default function OBJ(props: MeshProps & OBJInitProps) {
  const { objUrl, mtlUrl, colorProp, ...meshProps } = props;
  const color = useMemo(() => colorProp, [colorProp]);

  const materials = useLoader(MTLLoader, String(mtlUrl));
  const obj = useLoader(OBJLoader, objUrl, loader => {

    if (mtlUrl) {
      materials.preload()
      loader.setMaterials(materials)
    }

    return loader;
  })
  const [hovered, setHover] = useState(false)
  // const [active, setActive] = useState(false)
  const [active] = useState(false)
  // const [hotspotVec, setHotspotVec] = useState<Vector3>(new Vector3());

  // console.log(obj);

  const group = useRef<Group>(null!);
  const { geometry } = obj.children[0] as Mesh;

  const vec = useGlobalAdjustedOriginStore(state => state.vec);
  const initialized = useGlobalAdjustedOriginStore(state => state.initialized);

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

    if (geometry.boundingBox) {
      geometry.boundingBox!.getCenter(center);

      if (!initialized) {
        useGlobalAdjustedOriginStore.setState({
          vec: center,
          initialized: true
        });
      }
      else {
        geometry.translate(-vec.x, -vec.y, -vec.z);
        geometry.rotateX(3 * Math.PI / 2);
        geometry.boundingBox!.getCenter(center);

        // setHotspotVec(new Vector3(center.x + 30, center.y, center.z));
      }
    }
  }, [geometry, initialized, vec]);

  // Rotate mesh every canvas frame
  // useFrame(() => {
  // group.current.rotation.x = group.current.rotation.y += 0.0005
  //   obj.rotation.x = obj.rotation.y += 0.001;
  // })

  return (
    <group
      ref={group}
    >
      <mesh
        {...meshProps}
        geometry={geometry}
        scale={active ? 1.5 : 1}
        onPointerOver={() => {
          // e.stopPropagation()
          setHover(true)
        }}
        onPointerOut={() => {
          // e.stopPropagation()
          setHover(false)
        }}
      >
        <meshStandardMaterial color={hovered ? 'hotpink' : color ? color : 'orange'} />
        {/* <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} /> */}
      </mesh>

      {/* <Hotspot position={hotspotVec}></Hotspot> */}
    </group>
  )
}
