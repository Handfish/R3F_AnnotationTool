import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { ReactThreeFiber } from '@react-three/fiber';

declare module '@react-three' {
  declare type Extensions = (loader: THREE.Loader | OBJLoader) => void;
  export default Extensions;
}

/**
* Importable OBJ files with colors
*/
interface OBJProps {
  objUrl: string;
  mtlUrl?: string;
  colorProp?: string;
}

/**
* More convenient typing for Three Fiber Meshes
*/
type MeshProps = ReactThreeFiber.Object3DNode<Mesh, typeof Mesh>


/**
* SVG data for Icon Sprites rendered in Canvas
*/
interface HotspotSvgProps extends MeshProps {
  svg?: IconData
}

/**
* Popover Text Annotations
*/
interface AnnotationProps {
  content?: string;
  active: boolean;
}

/**
* Alias for clearer understanding / scoping
*/
type Vertices = Vector3[];


type IconData = {
  viewBox: string,
  paths: string[]
}

/**
* Type to assign icons a name
*/
type DndIconItem = {
  icon: IconData,
  name: string,
}


/**
* Element ID, camera distance, and raycast collison point
*/
type MouseEventData = {
  uuid: string;
  distance: float;
  point: Vector3;
}
