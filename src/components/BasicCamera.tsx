import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useOrbitSpeedStore } from '../stores/stores';

export default function Camera() {
  const rotateSpeed = useOrbitSpeedStore(state => state.speed);

  return (
    < >
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <OrbitControls rotateSpeed={rotateSpeed} dampingFactor={0.1}/>
    </>
  )
}
