import { useMemo } from 'react';
import { CatmullRomCurve3, Color, Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils.js'

export default function HilbertCurve () {
  //https://github.com/pmndrs/react-three-fiber/issues/103
  const line = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];

    const points = GeometryUtils.hilbert3D( new Vector3( 0, 0, 0 ), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7 );

    const spline = new CatmullRomCurve3( points );
    const divisions = Math.round( 12 * points.length );
    const point = new Vector3();
    const color = new Color();

    for ( let i = 0, l = divisions; i < l; i ++ ) {
      const t = i / l;

      spline.getPoint( t, point );
      positions.push( point.x, point.y, point.z );

      color.setHSL( t, 1.0, 0.5 );
      colors.push( color.r, color.g, color.b );
    }

    const geometry = new LineGeometry();
    geometry.setPositions( positions );
    geometry.setColors( colors );

    const matLine = new LineMaterial( {
      color: 0xffffff,
      linewidth: 5, // in pixels
      vertexColors: true,
      resolution: new Vector2(window.innerWidth, window.innerHeight), // TODO - react to windowsize - to be set by renderer, eventually
      dashed: false,
      alphaToCoverage: false, // https://threejs.org/docs/#api/en/materials/Material.alphaToCoverage
    } );

    const line = new Line2( geometry, matLine );
    line.computeLineDistances();
    line.scale.set( 1, 1, 1 );

    return line;
  }, []);

  return (
    <primitive
      object={line} 
    ></primitive>
  );
}
