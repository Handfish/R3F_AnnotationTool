import create, { SetState, GetState } from 'zustand';
import { Vector3 } from 'three';

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
