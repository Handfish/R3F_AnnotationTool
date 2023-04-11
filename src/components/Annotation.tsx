import { Html } from '@react-three/drei'
import type { MeshProps, AnnotationProps } from '../@types/custom-typings';

/**
* Hovering text field to Annotate 3d Space
*/
export default function Annotation(props: MeshProps & AnnotationProps) {
  return (
    <Html position={props.position} style={{ width: '260px', pointerEvents: 'none' }}>
      <div className='annotation-content' hidden={!props.active}>
        {
          props.content ? props.content :
            `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore
            magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation`
        }
      </div>
    </Html>
  );
}
