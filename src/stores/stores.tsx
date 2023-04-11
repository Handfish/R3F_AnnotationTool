import { create } from 'zustand';
import { Vector2, Vector3 } from 'three';
import type { IconData, MouseEventData, Vertices } from '../@types/custom-typings';
// import type { PartialState } from zustand;

/**
* useGlobalAdjustedOriginStore Data
*
* vec - Initial OBJ import location
* initialized - true if an OBJ is rendered
*/
type GlobalAdjustedOriginState = {
  vec: Vector3;
  initialized: boolean;
  setVec: (input: Vector3) => void;
};

/**
* Intended to translate all obj coordinates by vec (Vector3).
*
* Vec equals the origin of the first imported OBJ file Everything imported into the scene
* afterwards is translated by that vector in order to brind the relevant objs into focus
*
*/
export const useGlobalAdjustedOriginStore = create<GlobalAdjustedOriginState>()(
  (set) => ({
    vec: new Vector3(),
    initialized: false,
    setVec: (input: Vector3): void => {
      set({
        vec: input,
        initialized: true
      });
    }
  })
);

/**
* useOrbitSpeedStore Data
*
* speed - scalar for camera rotation speed
*/
type OrbitSpeedState = {
  speed: number;
  setSpeed: (input: number) => void;
};

/**
* Used to disable rotating the camera when dragging the mouse in the useDrag hook
*/
export const useOrbitSpeedStore = create<OrbitSpeedState>()(
  (set) => ({
    speed: 0.5,
    setSpeed: (input: number): void => {
      set({
        speed: input,
      });
    }
  })
);

/**
* useCurvesStore Data
*
* curves - 2D array of Vector3
*/
type CurvesState = {
  curves: Vertices[];
  setCurves: (input: Vertices[]) => void;
};


/**
* Array of Vertices data for custom drawn curves
*/
export const useCurvesStore = create<CurvesState>()(
  (set) => ({
    curves: [],
    setCurves: (input: Vertices[]): void => {
      set({
        curves: input,
      });
    }
  })
);


/**
* useMouseOverStore Data
*
* intersections - Array of expandable elements presently moused over
* addElement - Push
* removeElement - filter based on uuid
*/
type MouseOverState = {
  intersections: MouseEventData[],
  addElement: (data: MouseEventData) => void;
  removeElement: (uuid: string) => void;
};

/**
* All presently moused over expandable scene elements
* used to properly set cursor style, open singular elements, etc
*/
export const useMouseOverStore = create<MouseOverState>()(
  (set, get) => ({
    intersections: [],

    addElement: (data: MouseEventData): void => {
      const { intersections } = get();

      set({
        intersections: [...intersections, data]
      });
    },

    removeElement: (uuid: string): void => {
      const { intersections } = get();

      set({
        intersections: intersections.filter(i => i.uuid !== uuid),
      });
    }
  })
);


/**
* Data required to place icon in 3d canvas
*/
export type DndHotspotSvgProps = {
  position: Vector3,
  icon: IconData
}

type PendingDndHotspotSvg = {
  icon: IconData
  vec2: Vector2
}

type DndHotspotSvgsState = {
  pendingDndHotspotSvg?: PendingDndHotspotSvg | null,
  hotspotSvgs: DndHotspotSvgProps[],
  setDndHotspotSvgs: (input: DndHotspotSvgProps[]) => void;
  setPendingDndHotspotSvg: (input: PendingDndHotspotSvg) => void;
}

/**
* DndHotspotSvgs - Array of Hotspots in 3d Canvas
* PendingDndHotspotSvg - settable memory which useEffect converts to canvas Hostspot
*/
export const useDndHotspotSvgsStore = create<DndHotspotSvgsState>()(
  (set) => ({
    pendingDndHotspotSvg: null,
    hotspotSvgs: [],
    setDndHotspotSvgs: (input: DndHotspotSvgProps[]): void => {
      set({
        hotspotSvgs: input,
      });
    },
    setPendingDndHotspotSvg: (input: PendingDndHotspotSvg): void => {
      set({
        pendingDndHotspotSvg: input,
      });
    }
  })
);


export type OBJProps = [
  elementId: string,
  color: string
]


type OBJsState = {
  objProps: OBJProps[];
  setObjProps: (input: OBJProps[]) => void;
};

/**
* Array of OBJ (Organ) parts URI ids and their colors.
*/
export const useOBJsStore = create<OBJsState>()(
  (set) => ({
    objProps: [],
    setObjProps: (input: OBJProps[]): void => {
      set({
        objProps: input
      });
    }
  })
);
