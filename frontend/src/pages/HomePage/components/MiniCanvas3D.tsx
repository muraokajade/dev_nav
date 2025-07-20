import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Octahedron, Environment } from "@react-three/drei";

export const MiniCanvas3D = ({ size = 56 }: { size?: number }) => {
  function SpinningOctahedron() {
    const meshRef = useRef<any>(null);
    useFrame(() => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.018;
        meshRef.current.rotation.x += 0.012;
      }
    });

    return (
      <Octahedron ref={meshRef} args={[1.7, 0]}>
        {/* meshPhysicalMaterialでガチ金属 */}
        <meshPhysicalMaterial
          color="#e5e7eb"
          metalness={1}
          roughness={0.05}
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0.04}
          transmission={0.01}
          ior={2.5}
          thickness={2}
        />
      </Octahedron>
    );
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "transparent",
        borderRadius: 16,
        boxShadow: "0 2px 14px #0003",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 36 }}
        style={{ background: "none" }}
        gl={{ alpha: true }}
      >
        {/* 強めライト多数（正面/上/横/下/斜め） */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[5, 8, 12]} intensity={3} color="#fff" />
        <directionalLight
          position={[-7, 4, 10]}
          intensity={2}
          color="#b6ebfb"
        />
        <directionalLight
          position={[0, -8, 7]}
          intensity={1.7}
          color="#e7e7ee"
        />
        <directionalLight
          position={[-5, -6, 8]}
          intensity={1.2}
          color="#a3cef1"
        />
        <directionalLight position={[10, 0, 6]} intensity={1.5} color="#eee" />
        <directionalLight position={[-10, 0, 6]} intensity={1.5} color="#eee" />
        <pointLight position={[0, 0, 14]} intensity={2.8} color="#fff" />
        <pointLight position={[5, 5, 9]} intensity={1.1} color="#fff" />
        <Environment preset="city" />
        <SpinningOctahedron />
      </Canvas>
    </div>
  );
};
