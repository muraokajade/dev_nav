import { useRef, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

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
  const mesh = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, url);

  // **重要：テクスチャのY反転をOFF**
  useEffect(() => {
    texture.flipY = false;
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
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
