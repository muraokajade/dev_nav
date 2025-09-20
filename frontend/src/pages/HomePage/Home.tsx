// Home.tsx（ガラス調Hero + READMEバナー：外側クリックで閉じる対応）
import { sections } from "./components/sectionData";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { LogoPlane } from "./components/LogoPlane";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionScrollMotion } from "./components/SectionScrollMotion";
import { useAuth } from "../../context/useAuthContext";

/* ===== Inline SVG（lucide不使用のまま） ===== */
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

/* ===== READMEリンク先（必要なら変更） ===== */
const README_URL = "https://github.com/muraokajade/dev_nav/blob/main/README.md";

/* ===== 追加: 外側クリックで閉じられる READMEバナー ===== */
function ReadmeBanner({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Esc でも閉じる
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      aria-live="polite"
      role="dialog"
      aria-label="READMEのご案内"
    >
      {/* 背景（外側タップで閉じる） */}
      <button
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-black/20"
        style={{ WebkitTapHighlightColor: "transparent" }}
      />
      {/* バナー本体 */}
      <div className="relative m-3 sm:m-6 w-full sm:w-[min(92vw,720px)]">
        <div className="rounded-2xl border border-white/15 bg-white/95 backdrop-blur-md shadow-2xl p-4 sm:p-5 flex items-start gap-4 text-neutral-800">
          <div className="shrink-0 mt-1">
            <GitHubIcon className="h-6 w-6 text-neutral-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-semibold">
              詳しいセットアップ / 環境については README をご覧ください
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              導入手順・開発環境・設計意図・動作確認手順を短時間で確認できます。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={README_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white text-sm font-semibold shadow inline-flex items-center gap-2"
                onClick={onClose} // READMEへ遷移時も閉じる
              >
                <GitHubIcon className="h-4 w-4" />
                READMEを開く
              </a>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-sm"
              >
                後で見る
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-lg hover:bg-neutral-200/60 text-neutral-700"
            aria-label="バナーを閉じる"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const Home = () => {
  const { idToken } = useAuth();
  console.log(idToken);

  const [mounted, setMounted] = useState(false);

  // ===== READMEバナーの表示制御（既存の sessionStorage 利用は維持） =====
  const [showReadmeBanner, setShowReadmeBanner] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (!sessionStorage.getItem("readmeBannerDismissed")) {
        setShowReadmeBanner(true);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, []);
  const dismissReadmeBanner = () => {
    sessionStorage.setItem("readmeBannerDismissed", "1");
    setShowReadmeBanner(false);
  };

  // ===== 60秒デモ（既存そのまま） =====
  const [showVideo, setShowVideo] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const YT_BASE = "https://www.youtube-nocookie.com/embed/tx5BrnneewI";
  const openVideo = () => {
    setVideoKey((k) => k + 1);
    setShowVideo(true);
  };
  const closeVideo = () => setShowVideo(false);
  useEffect(() => {
    if (!showVideo) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeVideo();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showVideo]);

  // マウント
  useEffect(() => setMounted(true), []);

  // ===== レスポンシブ用（既存のロゴ座標/スケールも維持） =====
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

        {/* 3Dロゴ：ガラス調カード（既存） */}
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

      {/* READMEバナー（外側タップで閉じる/モバイル安全） */}
      <AnimatePresence>
        {showReadmeBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ReadmeBanner
              open={showReadmeBanner}
              onClose={dismissReadmeBanner}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 60秒デモ・モーダル（既存） */}
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
            <div
              onClick={closeVideo}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.98, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 8, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-[min(92vw,980px)] rounded-2xl overflow-hidden bg-black shadow-2xl"
            >
              <button
                onClick={closeVideo}
                className="absolute right-3 top-3 z-10 rounded-md bg-white/10 hover:bg-white/20 text-white px-2 py-1 text-xs"
                aria-label="閉じる"
              >
                閉じる
              </button>
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
    </div>
  );
};
