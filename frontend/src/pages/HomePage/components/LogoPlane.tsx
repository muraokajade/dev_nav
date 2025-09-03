import { useRef, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader, DoubleSide, Mesh, Texture, sRGBEncoding } from "three";

type LogoProps = {
  url: string;
  position: [x: number, y: number, z: number];
  rotationSpeed?: number;
  scale?: [number, number, number];
  bounce?: boolean;
  opacity?: number;
  initialRotation?: [number, number, number];
  color?: string;
};
export const LogoPlane: React.FC<LogoProps> = ({
  url,
  position,
  rotationSpeed = 0,
  scale = [1, 1, 1],
  bounce = false,
  opacity = 1,
  initialRotation = [0, 0, 0],
  color,
}) => {
  const mesh = useRef<Mesh>(null!);
  const texture = useLoader(TextureLoader, url) as Texture;

  // LogoPlane の useEffect を強化（追記2行：premultiplyAlpha と既存の sRGB 設定）
  useEffect(() => {
    texture.flipY = false;

    // 互換：r152+ なら colorSpace、r150 なら encoding
    if ("colorSpace" in texture) {
      (texture as any).colorSpace = sRGBEncoding;
    } else {
      (texture as any).encoding = sRGBEncoding;
    }

    // 透明PNG/SVGを綺麗に
    (texture as any).premultiplyAlpha = true;

    texture.needsUpdate = true;
  }, [texture]);

  // 初期rotation
  useEffect(() => {
    if (mesh.current) {
      mesh.current.rotation.set(...initialRotation);
    }
  }, [initialRotation]);

  useFrame(() => {
    if (rotationSpeed && mesh.current) {
      mesh.current.rotation.z += rotationSpeed;
    }
    if (bounce && mesh.current) {
      mesh.current.position.y =
        position[1] + Math.sin(performance.now() * 0.002) * 0.2;
    }
  });
  const image = texture.image as HTMLImageElement;
  const aspect = image.width / image.height;

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <planeGeometry args={[5 * aspect, 5]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={opacity} // opacity=1なら完全不透明
        color="white" // "white"でテクスチャ本来の色
        side={DoubleSide}
      />
    </mesh>
  );
};
