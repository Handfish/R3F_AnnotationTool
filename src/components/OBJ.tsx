import { useEffect, useRef, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { Group, Mesh, Vector3 } from 'three';
import { useVector3Store } from '../stores/stores';

import Hotspot from './Hotspot';

import type { MeshProps, OBJProps } from '../@types/custom-typings';


export default function OBJ(props: MeshProps & OBJProps) {
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
        geometry.rotateX(3 * Math.PI/2);
        geometry.boundingBox!.getCenter(center);

        setHotspotVec(new Vector3(center.x + 30, center.y, center.z));
      }
    }
  }, [geometry, initialized, vec]);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    // group.current.rotation.x = group.current.rotation.y += 0.0005
    // // obj.rotation.x = obj.rotation.y += 0.001;
  })

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

        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />

      </mesh>

      <Hotspot position={hotspotVec}></Hotspot>
    </group>
  )
}
