// Home.tsx（見やすさ調整版）
import { sections } from "./components/sectionData";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { LogoPlane } from "./components/LogoPlane";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionScrollMotion } from "./components/SectionScrollMotion";
import { useAuth } from "../../context/useAuthContext";

export const Home = () => {
  const { idToken } = useAuth();
  // console.log(idToken);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 3Dロゴの座標・スケール
  const reactPos: [number, number, number] = isMobile
    ? [-1.7, 0.1, 0]
    : [-4, 0, 0];
  const springPos: [number, number, number] = isMobile
    ? [1.7, 0.1, 0]
    : [4, 0, 0];
  const tsPos: [number, number, number] = isMobile
    ? [-0.4, -1.25, 0]
    : [-1.6, -1.8, 0];
  const javaPos: [number, number, number] = isMobile
    ? [2.8, -1.25, 0]
    : [6.0, -1.8, 0];

  const reactScale: [number, number, number] = isMobile
    ? [0.5, -0.5, 1]
    : [0.62, -0.62, 1];
  const springScale: [number, number, number] = isMobile
    ? [0.5, -0.5, 1]
    : [0.62, -0.62, 1];
  const tsScale: [number, number, number] = isMobile
    ? [0.11, -0.11, 1]
    : [0.24, -0.24, 1];
  const javaScale: [number, number, number] = isMobile
    ? [0.22, -0.22, 1.875]
    : [0.52, -0.52, 1.875];

  return (
    <div className="relative min-h-screen w-full bg-gray-900">
      {/* HERO 背景：ラジアル + フェード */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_50%_20%,rgba(56,189,248,.25),transparent)]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900/40 to-gray-950" />

      {/* コンテンツ幅 & 余白を統一 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start max-w-6xl w-full mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-12">
        {/* タイトル */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-extrabold text-center tracking-tight drop-shadow"
        >
          <span className="text-sky-400">Dev</span>
          <span className="text-white">Nav</span>
          <span className="text-sky-500">+</span>
          <div className="mt-3 text-white">
            日本語で学べる最新Spring×React教材
          </div>
        </motion.h1>

        {/* サブ説明：可読行間/幅 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-4 text-base md:text-lg leading-snug text-gray-300 text-center max-w-3xl"
        >
          日本語で統合教材が少ない領域を網羅。TypeScript ×
          Java、実装→設計→デプロイまで一気通貫で学べます。
        </motion.p>

        {/* CTA：幅/タップ領域/コントラスト強化 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/start"
            className="transition-colors duration-200 min-w-[160px] px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 text-center"
            aria-label="学習を始める"
          >
            学習を始める
          </Link>
          <Link
            to="/articles"
            className="transition-colors duration-200 min-w-[160px] px-6 py-3 rounded-xl border border-white/15 bg-white/20 hover:bg-white/20 text-white backdrop-blur text-center"
            aria-label="記事を探す"
          >
            記事を探す
          </Link>
        </motion.div>

        {/* 3Dロゴ枠：白/90 → 透明感のあるカードへ */}
        <div className="relative w-full max-w-6xl flex justify-center items-center h-[18rem] md:h-[24rem] mt-12">
          <div className="absolute inset-0 rounded-2xl bg-white/90 ring-1 ring-black/5 shadow-2xl" />

          <Canvas
            className="absolute inset-0"
            camera={{ position: [0, 0, 6], fov: 50 }}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.7} />
            <LogoPlane
              url="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
              position={reactPos}
              scale={reactScale}
              opacity={1}
              rotationSpeed={0.01}
            />
            <LogoPlane
              url="/assets/images/Ts.svg"
              position={tsPos}
              scale={tsScale}
              opacity={1}
            />
            <LogoPlane
              url="/assets/images/Spring.png"
              position={springPos}
              scale={springScale}
              opacity={1}
              bounce
            />
            <LogoPlane
              url="/assets/images/Java.png"
              position={javaPos}
              scale={javaScale}
              opacity={1}
            />
          </Canvas>
        </div>

        {/* スクロール誘導：控えめに */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          transition={{ delay: 0.4, duration: 1.4, repeat: Infinity }}
          className="mt-6 text-gray-400"
          aria-hidden
        >
          ↓ もっと見る
        </motion.div>

        {/* セクション：見出しとの間隔を一定に */}
        <div className="w-full mt-16 space-y-16">
          {sections.map((section, i) => (
            <SectionScrollMotion
              key={`${section.key}-${i}`}
              section={section}
              mt=""
            />
          ))}
        </div>
      </div>
    </div>
  );
};
