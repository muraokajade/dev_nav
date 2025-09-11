import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import {
  TextureLoader,
  DoubleSide,
  Mesh,
  Texture,
  SRGBColorSpace,
} from "three";

type LogoProps = {
  url: string;
  position: [number, number, number];
  scale?: [number, number, number];
  rotationSpeed?: number;
  bounce?: boolean;
  opacity?: number;
  initialRotation?: [number, number, number];
};

export const LogoPlane: React.FC<LogoProps> = ({
  url,
  position,
  scale = [1, 1, 1],
  rotationSpeed = 0,
  bounce = false,
  opacity = 1,
  initialRotation = [0, 0, 0],
}) => {
  const mesh = useRef<Mesh>(null!);
  const texture = useLoader(TextureLoader as any, url) as Texture;

  // テクスチャ設定：r152+ の colorSpace を使用（sRGBEncoding は使わない）
  useEffect(() => {
    texture.flipY = false;
    // 型定義の差異を吸収するため in チェック
    if ("colorSpace" in texture) {
      (texture as any).colorSpace = SRGBColorSpace;
    }
    (texture as any).premultiplyAlpha = true; // 透明PNGを綺麗に
    texture.needsUpdate = true;
  }, [texture]);

  // 初期回転
  useEffect(() => {
    if (mesh.current) mesh.current.rotation.set(...initialRotation);
  }, [initialRotation]);

  // 画像アスペクト（未ロード時は 1）
  const aspect = useMemo(() => {
    const img: any = (texture as any).image;
    const w = img?.width ?? img?.videoWidth ?? 1;
    const h = img?.height ?? img?.videoHeight ?? 1;
    return h > 0 ? w / h : 1;
  }, [texture]);

  // 回転＆バウンス（transform のみ）
  useFrame(() => {
    if (rotationSpeed && mesh.current) mesh.current.rotation.z += rotationSpeed;
    if (bounce && mesh.current) {
      mesh.current.position.y =
        position[1] + Math.sin(performance.now() * 0.002) * 0.2;
    }
  });

  // 基準高さ 5、幅はアスペクトで決定。geometry は 1x1 固定で押し出し回避
  const [sx, sy, sz] = scale;
  const finalScale: [number, number, number] = [sx * 5 * aspect, sy * 5, sz];

  return (
    <mesh ref={mesh} position={position} scale={finalScale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        color="white"
        side={DoubleSide}
        toneMapped={false} // three@0.171 での正しい無効化
      />
    </mesh>
  );
};

export default LogoPlane;
