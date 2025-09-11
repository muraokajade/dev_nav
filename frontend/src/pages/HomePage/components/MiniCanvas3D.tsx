// src/pages/HomePage/components/MiniCanvas3D.tsx
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SRGBColorSpace, NoToneMapping } from "three";

type MiniCanvas3DProps = {
  /** キャンバスの高さ(px)。未指定は 56px */
  size?: number;
  className?: string;
};

// 余計な依存を使わない、安定版のスピナー
const SpinningOctahedron: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.018;
      ref.current.rotation.x += 0.012;
    }
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[1.7, 0]} />
      {/* ライトの影響を受けるが、重くない standard を使用 */}
      <meshStandardMaterial metalness={0.3} roughness={0.35} />
    </mesh>
  );
};

export const MiniCanvas3D: React.FC<MiniCanvas3DProps> = ({
  size = 56,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: "transparent",
        boxShadow: "0 2px 14px #0003",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 36 }}
        gl={{ alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          // three r152+ の正しい色空間API（sRGBEncoding は使わない）
          (gl as any).outputColorSpace = SRGBColorSpace;
          (gl as any).toneMapping = NoToneMapping;
          (gl as any).toneMappingExposure = 1;
        }}
      >
        {/* 軽量ライティングのみ */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 12]} intensity={1.5} />
        <directionalLight position={[-7, 4, 10]} intensity={0.8} />
        <SpinningOctahedron />
      </Canvas>
    </div>
  );
};

export default MiniCanvas3D;
