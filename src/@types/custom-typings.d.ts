import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { ReactThreeFiber } from '@react-three/fiber';

declare module '@react-three' {
 declare type Extensions = (loader: THREE.Loader | OBJLoader) => void;
 export default Extensions;
}

interface OBJProps {
  objUrl: string;
  mtlUrl?: string;
}

type MeshProps = ReactThreeFiber.Object3DNode<Mesh, typeof Mesh>

interface HotspotSvgProps extends MeshProps {
  svg?: any
}
interface AnnotationProps {
  content?: string;
  active: boolean;
}

type Vertices = Vector3[];
