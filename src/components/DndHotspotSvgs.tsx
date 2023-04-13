import HotspotSvg from './HotspotSvg';
import { useDndHotspotSvgsStore } from '../stores/stores';

/**
  * Component which renders Hotspot Store Data
  */
export default function DndHotspotSvgs() {
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
