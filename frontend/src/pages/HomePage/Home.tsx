import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReadmeNotice from "../../ReadmeNotice";

// 依存している既存のコンポーネント/データ（パスはあなたの構成に合わせて）
import { sections } from "./components/sectionData";
import { LogoPlane } from "./components/LogoPlane";
import { SectionScrollMotion } from "./components/SectionScrollMotion";

// --- Inline SVG icons (lucide不使用) ---
const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.55 2.34 1.1 2.9.84.09-.66.35-1.1.62-1.36-2.22-.26-4.56-1.13-4.56-5.02 0-1.11.39-2.01 1.03-2.72-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.04A9.3 9.3 0 0 1 12 7.06c.85 0 1.71.12 2.51.34 1.9-1.31 2.73-1.04 2.73-1.04.56 1.42.21 2.47.1 2.73.64.71 1.03 1.61 1.03 2.72 0 3.9-2.35 4.75-4.59 5.01.36.32.67.95.67 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"
    />
  </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
    />
  </svg>
);

// READMEリンク先（差し替え可）
const README_URL = "https://github.com/muraokajade/dev_nav/blob/main/README.md";

export default function HomePage() {
  // モーダル（YouTube）
  const [showVideo, setShowVideo] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const YT_BASE = "https://www.youtube-nocookie.com/embed/tx5BrnneewI";

  const openVideo = () => {
    setVideoKey((k) => k + 1); // 毎回 iframe を作り直し
    setShowVideo(true);
  };
  const closeVideo = () => setShowVideo(false);

  // ESCで閉じる
  useEffect(() => {
    if (!showVideo) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeVideo();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showVideo]);

  // マウント透過アニメ
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // モバイルかどうか（3D配置調整）
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 3D ロゴ配置
  const reactPos: [number, number, number] = isMobile
    ? [-1.7, 0.1, 0]
    : [-4, 0, 0];
  const springPos: [number, number, number] = isMobile
    ? [1.5, 0.1, 0]
    : [3.3, 0, 0];
  const tsPos: [number, number, number] = isMobile
    ? [-0.4, -1.25, 0]
    : [-1.6, -1.8, 0];
  const javaPos: [number, number, number] = isMobile
    ? [2.8, -1.25, 0]
    : [5.5, -1.7, 0];

  const reactScale: [number, number, number] = isMobile
    ? [0.5, -0.5, 1]
    : [0.62, -0.62, 1];
  const springScale: [number, number, number] = isMobile
    ? [0.2, -0.2, 1]
    : [0.31, -0.3, 1];
  const tsScale: [number, number, number] = isMobile
    ? [0.11, -0.11, 1]
    : [0.24, -0.24, 1];
  const javaScale: [number, number, number] = isMobile
    ? [0.22, -0.22, 1.875]
    : [0.52, -0.52, 1.875];

  return (
    <div className="relative min-h-screen w-full bg-gray-900 overflow-x-hidden">
      {/* 背景 */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_20%,rgba(56,189,248,.25),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 to-gray-950" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start max-w-6xl w-full mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-12">
        {/* タイトル */}
        <motion.h1
          initial={{ opacity: 1 }}
          animate={mounted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-extrabold text-center tracking-tight leading-tight drop-shadow"
        >
          <span className="text-sky-400">Dev</span>
          <span className="text-white">Nav</span>
          <span className="text-sky-500">+</span>
          <div className="mt-3 text-white">
            日本語で学べる最新Spring×React教材
          </div>
        </motion.h1>

        {/* サブ説明 */}
        <motion.p
          initial={{ opacity: 1 }}
          animate={mounted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.05, duration: 0.45, ease: "easeOut" }}
          className="mt-4 text-base md:text-lg leading-snug text-gray-300 text-center max-w-3xl will-change-transform"
        >
          日本語で統合教材が少ない領域を網羅。TypeScript ×
          Java、実装→設計→デプロイまで一気通貫で学べます。
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={mounted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: "easeOut" }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 will-change-transform"
        >
          <Link
            to="/start"
            className="transition-colors duration-200 min-w-[160px] px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 text-center"
          >
            学習を始める
          </Link>
          <Link
            to="/articles"
            className="transition-colors duration-200 min-w-[160px] px-6 py-3 rounded-xl border border-white/15 bg-white/20 hover:bg-white/20 text-white backdrop-blur text-center"
          >
            記事を探す
          </Link>
          <button
            onClick={openVideo}
            className="transition-colors duration-200 px-4 py-2 rounded-lg border border-white/20 text-white/90 hover:bg-white/10 text-sm"
            aria-haspopup="dialog"
            aria-controls="demo-modal"
          >
            ▶︎ 60秒デモを見る
          </button>

          <a
            href={README_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 min-w-[200px] px-5 py-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-900 text-white font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 inline-flex items-center justify-center gap-2"
            aria-label="README (環境/セットアップ) を開く"
          >
            <GitHubIcon className="h-5 w-5" />
            <span>README（環境/セットアップ）</span>
          </a>
        </motion.div>

        {/* 3Dロゴ：ガラス調カード */}
        <div className="relative w-full max-w-6xl h-[16rem] md:h-[22rem] mt-10">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 rounded-2xl bg-white/8 backdrop-blur-md border border-white/15" />
            <div
              className="absolute inset-0 rounded-2xl
                 bg-[radial-gradient(70%_50%_at_30%_0%,rgba(56,189,248,0.22),transparent_60%)]
                 after:content-[''] after:absolute after:inset-0 after:rounded-2xl
                 after:bg-[radial-gradient(70%_50%_at_75%_100%,rgba(99,102,241,0.18),transparent_60%)]"
            />
            <div className="absolute inset-0 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]" />
          </div>

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

        {/* スクロール誘導 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          transition={{ delay: 0.4, duration: 1.4, repeat: Infinity }}
          className="mt-6 text-gray-400"
          aria-hidden
        >
          ↓ もっと見る
        </motion.div>

        {/* セクション */}
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

      {/* YouTube モーダル（背景クリック/ESCで閉じる） */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            id="demo-modal"
            role="dialog"
            aria-modal="true"
            aria-label="60秒デモ動画"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
          >
            {/* 背景クリックで閉じる */}
            <div
              onClick={closeVideo}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            {/* コンテンツ */}
            <motion.div
              initial={{ scale: 0.98, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 8, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-[min(92vw,980px)] rounded-2xl overflow-hidden bg-black shadow-2xl"
            >
              {/* 閉じるボタン（右上） */}
              <button
                onClick={closeVideo}
                className="absolute right-3 top-3 z-10 rounded-md bg-white/10 hover:bg白/20 text-white px-2 py-1 text-xs"
                aria-label="閉じる"
              >
                閉じる
              </button>
              {/* 16:9 埋め込み */}
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <iframe
                  key={videoKey}
                  title="DevNav 60秒デモ"
                  src={`${YT_BASE}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&vts=${videoKey}`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* READMEバナー（localStorage失敗→sessionStorageにフォールバック） */}
      <ReadmeNotice
        storageKey="readme_notice_dismissed_at"
        expireDays={365}
        readmeHref="/readme"
      />
    </div>
  );
}
