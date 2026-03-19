/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_CONFIG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace THREE {
  type Material = any;
  const AdditiveBlending: any;
  class AmbientLight { [key: string]: any; constructor(...args: any[]); position: any; }
  class BoxGeometry { constructor(...args: any[]); }
  class BufferAttribute { constructor(...args: any[]); }
  class BufferGeometry { [key: string]: any; constructor(...args: any[]); setAttribute(...args: any[]): any; }
  class Color { [key: string]: any; constructor(...args: any[]); getHSL(...args: any[]): any; setHSL(...args: any[]): any; }
  class ConeGeometry { constructor(...args: any[]); }
  class CylinderGeometry { constructor(...args: any[]); }
  class DirectionalLight { [key: string]: any; constructor(...args: any[]); position: any; }
  class Group { [key: string]: any; constructor(...args: any[]); add(...args: any[]): any; remove(...args: any[]): any; traverse(...args: any[]): any; children: any[]; position: any; rotation: any; scale: any; }
  class IcosahedronGeometry { constructor(...args: any[]); }
  class Mesh { [key: string]: any; constructor(...args: any[]); position: any; rotation: any; scale: any; material: any; geometry: any; }
  class MeshStandardMaterial { [key: string]: any; constructor(...args: any[]); color: any; emissive: any; emissiveIntensity: any; opacity: any; transparent: any; }
  class PerspectiveCamera { [key: string]: any; constructor(...args: any[]); position: any; lookAt(...args: any[]): any; aspect: number; updateProjectionMatrix(): any; }
  class Points { [key: string]: any; constructor(...args: any[]); rotation: any; geometry: any; material: any; }
  class PointsMaterial { constructor(...args: any[]); }
  class Scene { [key: string]: any; constructor(...args: any[]); add(...args: any[]): any; remove(...args: any[]): any; }
  class SphereGeometry { constructor(...args: any[]); }
  class WebGLRenderer { [key: string]: any; constructor(...args: any[]); domElement: any; setSize(...args: any[]): any; setPixelRatio(...args: any[]): any; render(...args: any[]): any; dispose(): any; }
}

declare module 'three' {
  export = THREE;
}
