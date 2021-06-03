import create, { SetState, GetState } from 'zustand';
import { Vector3 } from 'three';
import type { MouseEventData, Vertices } from '../@types/custom-typings';
// import type { PartialState } from zustand;

type Vector3Store = {
    vec: Vector3;
    initialized: boolean;
    setVec: (input: Vector3) => void;
};

export const useVector3Store = create<Vector3Store>((set: SetState<Vector3Store>, get: GetState<Vector3Store>) => ({
    vec: new Vector3(),
    initialized: false,
    setVec: (input: Vector3): void =>  {
      set({ 
        vec: input,
        initialized: true
      });
    }
}));





type OrbitSpeedStore = {
    speed: number;
    setSpeed: (input: number) => void;
};

export const useOrbitSpeedStore = create<OrbitSpeedStore>((set: SetState<OrbitSpeedStore>, get: GetState<OrbitSpeedStore>) => ({
    speed: 0.5,
    setSpeed: (input: number): void =>  {
      set({ 
        speed: input,
      });
    }
}));






type CurvesStore = {
    curves: Vertices[];
    setCurves: (input: Vertices) => void;
};


export const useCurvesStore = create<CurvesStore>((set: SetState<CurvesStore>, get: GetState<CurvesStore>) => ({
    curves: [],
    setCurves: (input: Vertices[]): void =>  {
      set({ 
        curves: input,
      });
    }
}));




// interface IIntersections {
//   [key: string]: MouseEventData;
//   // [key: string]: MouseEventData | PartialState<MouseOverStore, keyof MouseOverStore>;
// }

type MouseOverStore = {
    //TODO: Figure out this type
    // intersections: IIntersections,
  
    intersections: any,
    addElement: (data: MouseEventData) => void;
    removeElement: (data: MouseEventData) => void;
};

export const useMouseOverStore = create<MouseOverStore>((set: SetState<MouseOverStore>, get: GetState<MouseOverStore>) => ({
    intersections: {},
    addElement: (data: MouseEventData): void => {
      const { intersections } = get();

      const intersectionsMerge = {...intersections, [data.uuid]: data};

      // console.log(intersectionsMerge);
      set({
        intersections: intersectionsMerge
      });

    },
    removeElement: (data: MouseEventData): void => {
      const { intersections } = get();
      const uuid = data.uuid;

      //Remove uuid from map
      const{ [uuid]: unusedValue, ...rest } = intersections

      // console.log(rest);
      set({ 
        intersections: rest,
      });
    },
}));
