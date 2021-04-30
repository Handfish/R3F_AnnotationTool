import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

declare module '@react-three' {
 declare type Extensions = (loader: THREE.Loader | OBJLoader) => void;
 export default Extensions;
}
