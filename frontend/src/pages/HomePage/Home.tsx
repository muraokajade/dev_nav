import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { LogoPlane } from "./components/LogoPlane";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const Home = () => {
  // --- スマホ判定 ---
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 600 : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- スクロール連動アニメ ---
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });
  // スクロールでscale 0.7→1.08、opacity 0→1
  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 1], [0, 1, 1]);

  // --- ロゴの座標＆スケールをデバイスごとに ---
  const reactPos: [number, number, number] = isMobile ? [-2, 0, 0] : [-4, 0, 0];
  const springPos: [number, number, number] = isMobile ? [2, 0, 0] : [4, 0, 0];
  const tsPos: [number, number, number] = isMobile
    ? [-0.5, -1.3, 0]
    : [-1.5, -1.8, 0];
  const javaPos: [number, number, number] = isMobile
    ? [3.2, -1.3, 0]
    : [6, -1.8, 0];

  const reactScale: [number, number, number] = isMobile
    ? [0.7, 0.7, 1]
    : [0.7, 0.7, 1]
  const springScale: [number, number, number] = isMobile
    ? [0.8, -0.7, 1]
    : [0.8, -0.7, 1];
  const tsScale: [number, number, number] = isMobile
    ? [0.19, -0.19, 1]
    : [0.19, -0.19, 1];
  const javaScale: [number, number, number] = isMobile
    ? [0.16, -0.16, 1]
    : [0.16, -0.16, 1]

  return (
    <div className="relative min-h-screen w-full bg-gray-900 px-2">
      {/* --- ファーストビュー --- */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center max-w-5xl w-full mx-auto">
        {/* タイトル */}
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

        {/* ロゴ＋Canvas（中央寄せ・スマホでも切れない） */}
        <div className="relative w-full max-w-6xl flex justify-center items-center h-[20rem] md:h-[24rem] mb-10">
          <div className="absolute inset-0 bg-white/90 rounded-2xl h-full z-0" />
          <Canvas
            className="absolute left-0 top-5 w-full h-full z-10"
            camera={{ position: [0, 0, 6], fov: 50 }}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.7} />

            {/* Reactロゴ */}
            <LogoPlane
              url="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
              position={reactPos}
              scale={reactScale}
              opacity={1}
              rotationSpeed={0.01}
            />
            {/* TypeScriptロゴ */}
            <LogoPlane
              url="https://raw.githubusercontent.com/remojansen/logo.ts/master/ts.png"
              position={tsPos}
              scale={tsScale}
              opacity={1}
            />
            {/* Springロゴ */}
            <LogoPlane
              url="https://upload.wikimedia.org/wikipedia/commons/4/44/Spring_Framework_Logo_2018.svg"
              position={springPos}
              scale={springScale}
              opacity={1}
              bounce
            />
            {/* Javaロゴ */}
            <LogoPlane
              url="https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg"
              position={javaPos}
              scale={javaScale}
              opacity={1}
            />
          </Canvas>
        </div>

        {/* --- サイト紹介セクション --- */}
        <motion.section
          ref={sectionRef}
          style={{ scale, opacity }}
          className="mb-16 w-full mt-16"
        >
          <h2 className="text-2xl font-semibold mb-3 text-white flex items-center">
            <span className="text-blue-400">Dev</span>
            <span className="text-white">Nav</span>
            <span className="text-blue-600">+</span>
          </h2>
          <p className="text-lg mb-8 text-gray-200 font-medium">
            <span className="text-blue-300 font-bold">Spring Boot</span>と
            <span className="text-blue-300 font-bold">React</span>
            で作られた、本格派の技術ポータル。
            <br />
            実務で通用する設計とモダンなUI/UXを体感しながら、「コードを書く楽しさ」と「開発の最前線」を体験できます。
          </p>
        </motion.section>

        {/* --- 主な機能 --- */}
        <motion.section
          initial={{ opacity: 0, x: 120 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-10 w-full"
        >
          <h2 className="text-2xl font-semibold mb-3 text-white flex items-center gap-2">
            <span>🛠</span> 主な機能
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>
              Spring Boot／Reactの記事・コードサンプルを体系的にまとめて参照
            </li>
            <li>技術ごとの「使えるTips」や実践ノウハウを収集</li>
            <li>自分の学習記録やアクション履歴を可視化（マイページ機能）</li>
            <li>コメント・レビュー・いいねで、リアクションや意見を残せる</li>
          </ul>
        </motion.section>

        {/* --- このサイトについて --- */}
        <motion.section className="mb-16 w-full">
          <h2 className="text-2xl font-semibold mb-3 text-white flex items-center gap-2">
            <span>📚</span> このサイトについて
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>
              日本語でまとまった「Spring Boot ×
              React」教材が少ない現状を変えるべく開発
            </li>
            <li>最新トレンドや現場経験を取り入れた、実践的な技術ガイド</li>
            <li>技術の「かっこよさ」「楽しさ」を直感的に感じられるUI設計</li>
          </ul>
        </motion.section>

        {/* --- 注目記事 --- */}
        <motion.section className="w-full">
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            <span>🚀</span> 注目記事
          </h2>
          <div className="bg-gray-800/80 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition flex flex-col items-start">
            <h3 className="text-xl font-semibold mb-1 text-blue-300">
              Spring Boot × React 実践ナレッジ集
            </h3>
            <p className="text-gray-400 mb-3">
              API設計、フロント連携、セキュリティまで“現場視点”で徹底解説。
            </p>
            <Link
              to="/tech/spring"
              className="text-blue-400 hover:underline font-bold"
            >
              記事を読む →
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
};
