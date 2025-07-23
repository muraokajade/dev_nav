import { sections } from "./components/sectionData"; 
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { LogoPlane } from "./components/LogoPlane";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionScrollMotion } from "./components/SectionScrollMotion";
import { useAuth } from "../../context/useAuthContext";


export const Home = () => {
  const {idToken} = useAuth();
  console.log(idToken);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 600 : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ロゴ座標・スケール
  const reactPos: [number, number, number] = isMobile ? [-2, 0, 0] : [-4, 0, 0];
  const springPos: [number, number, number] = isMobile ? [2, 0, 0] : [4, 0, 0];
  const tsPos: [number, number, number] = isMobile
    ? [-0.5, -1.3, 0]
    : [-1.5, -1.8, 0];
  const javaPos: [number, number, number] = isMobile
    ? [3.2, -1.3, 0]
    : [6, -1.8, 0];

  const reactScale: [number, number, number] = [0.7, 0.7, 1];
  const springScale: [number, number, number] = [0.8, -0.7, 1];
  const tsScale: [number, number, number] = [0.19, -0.19, 1];
  const javaScale: [number, number, number] = [0.26, -0.26, 1.5];

  return (
    <div className="relative min-h-screen w-full bg-gray-900 px-2">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center max-w-5xl w-full mx-auto py-8">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-extrabold mb-5 text-blue-400 drop-shadow-lg tracking-tight text-center"
        >
          <span className="text-blue-400">Dev</span>
          <span className="text-white">Nav</span>
          <span className="text-blue-600">+</span>
          <div></div>
          <span className="text-white">Spring Boot × React ナビゲーター</span>
        </motion.h1>

        <div className="relative w-full max-w-6xl flex justify-center items-center h-[20rem] md:h-[24rem] mb-10">
          <div className="absolute inset-0 bg-white/90 rounded-2xl h-full z-0" />
          <Canvas
            className="absolute left-0 top-5 w-full h-full z-10"
            camera={{ position: [0, 0, 6], fov: 50 }}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.7} />
            <LogoPlane url="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" position={reactPos} scale={reactScale} opacity={1} rotationSpeed={0.01} />
            <LogoPlane url="/assets/images/Ts.svg" position={tsPos} scale={tsScale} opacity={1} />
            <LogoPlane url="/assets/images/Spring.png" position={springPos} scale={springScale} opacity={1} bounce />
            <LogoPlane url="/assets/images/Java.png" position={javaPos} scale={javaScale} opacity={1} />
          </Canvas>
        </div>

        {/* sectionsをmapで展開 */}
        {sections.map((section, i) => (
          <SectionScrollMotion key={section.key} section={section} mt={i === 0 ? "mt-16" : ""} />
        ))}
      </div>
    </div>
  );
};
