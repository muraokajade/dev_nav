// src/pages/HomePage/components/MiniCanvas3D.tsx
import React, { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Octahedron, Environment, OrbitControls } from "@react-three/drei";
import {
  TextureLoader,
  DoubleSide,
  Mesh,
  sRGBEncoding,
  Texture,
  SRGBColorSpace,
  NoToneMapping, // ★ 追加（new three 用）
} from "three";

/* -------------------- LogoPlane（ロゴ画像を貼る平面） -------------------- */
type LogoProps = {
  url: string;
  position: [number, number, number];
  rotationSpeed?: number;
  scale?: [number, number, number];
  bounce?: boolean;
  opacity?: number;
  initialRotation?: [number, number, number];
};

export const LogoPlane: React.FC<LogoProps> = ({
  url,
  position,
  rotationSpeed = 0,
  scale = [1, 1, 1],
  bounce = false,
  opacity = 1,
  initialRotation = [0, 0, 0],
}) => {
  const mesh = useRef<Mesh>(null!);
  const texture = useLoader<Texture, string>(TextureLoader, url);

  // ロゴはsRGBで正しく表示 + 反転オフ
  useEffect(() => {
    texture.flipY = false;

    // ★ 互換レイヤー：新旧 three どちらでも OK にする
    if ("colorSpace" in texture) {
      // new three (r152+)
      (texture as any).colorSpace = SRGBColorSpace;
    } else {
      // old three (r150 など)
      (texture as any).encoding = sRGBEncoding;
    }

    texture.needsUpdate = true;
  }, [texture]);

  // 初期回転
  useEffect(() => {
    if (mesh.current) mesh.current.rotation.set(...initialRotation);
  }, [initialRotation]);

  // 画像ロード後にアスペクト比を算出（未ロード時は1）
  const aspect = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    return img && img.width && img.height ? img.width / img.height : 1;
  }, [texture]);

  // アニメーション
  useFrame(() => {
    if (rotationSpeed && mesh.current) mesh.current.rotation.z += rotationSpeed;
    if (bounce && mesh.current) {
      mesh.current.position.y =
        position[1] + Math.sin(performance.now() * 0.002) * 0.2;
    }
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <planeGeometry args={[5 * aspect, 5]} />
      {/* ロゴはライトの影響を受けない & トーンマップ無効で“薄さ”を防ぐ */}
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        color="white"
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
};

/* -------------------- MiniCanvas3D（メインの小型キャンバス） -------------------- */
const SpinningOctahedron: React.FC = () => {
  const meshRef = useRef<any>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.018;
      meshRef.current.rotation.x += 0.012;
    }
  });
  return (
    <Octahedron ref={meshRef} args={[1.7, 0]}>
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
};

export const MiniCanvas3D: React.FC<{ size?: number }> = ({ size = 56 }) => {
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
        gl={{ alpha: true }}
        onCreated={({ gl }) => {
          // ★ r150系：レンダラの出力をsRGBに
          (gl as any).outputEncoding = sRGBEncoding;
          (gl as any).toneMapping = NoToneMapping;
          (gl as any).toneMappingExposure = 1;
        }}
      >
        {/* ライティング */}
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

        {/* ローカルHDR（壊れない PolyHaven のファイル） */}
        <Suspense fallback={null}>
          {/* <Environment files="/hdr/studio_small_03_1k.hdr" background={false} />
          {/* 必要ならロゴを表示：
          <LogoPlane
            url="/react-logo.png"
            position={[0, 0, 0]}
            rotationSpeed={0.01}
            scale={[1, 1, 1]}
            opacity={1}
            initialRotation={[0, 0, 0]}
          /> */}
          <SpinningOctahedron />
        </Suspense>

        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
};

export default MiniCanvas3D;
