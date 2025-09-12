// src/components/HeroImpact.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/** -----------------------------------------------------------
 *  HeroImpact
 *  - インパクト強度を tone で調整: "bold" | "default" | "calm"
 *  - lucide-react 不要（内製SVGアイコン）
 *  - 3Dチルト/グロー/背景エフェクトもトーンに応じて弱/強切替
 *  - screenshotSrc にヒーロー画像（スクショ）を渡す
 * ----------------------------------------------------------*/

type Tone = "bold" | "default" | "calm";

const WORDS = ["爆速", "美しい", "実践的"] as const;

/* === シンプル内製SVGアイコン（依存ゼロ） === */
const Icon = {
  ArrowRight: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <path fill="currentColor" d="M13 5l7 7-7 7v-4H4v-6h9V5z" />
    </svg>
  ),
  Github: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <path
        fill="currentColor"
        d="M12 .5a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.35-1.76-1.35-1.76-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.83 1.31 3.52 1 .11-.79.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.67 1.65.25 2.87.12 3.17.77.84 1.23 1.9 1.23 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0012 .5z"
      />
    </svg>
  ),
  Sparkles: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <path
        fill="currentColor"
        d="M11 2l1.8 4.2L17 8l-4.2 1.8L11 14l-1.8-4.2L5 8l4.2-1.8L11 2zm7 6l1.2 2.8L22 12l-2.8 1.2L18 16l-1.2-2.8L14 12l2.8-1.2L18 8zM6 14l1.4 3.4L11 19l-3.6 1.6L6 24l-1.4-3.4L1 19l3.6-1.6L6 14z"
      />
    </svg>
  ),
  Zap: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <path fill="currentColor" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  ),
  ShieldCheck: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <path
        fill="currentColor"
        d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-4zm-1 13l6-6-1.4-1.4L11 12.2 8.4 9.6 7 11l4 4z"
      />
    </svg>
  ),
};

export default function HeroImpact({
  screenshotSrc = "/hero-screenshot.png",
  onPrimaryClick,
  tone = "calm",
}: {
  screenshotSrc?: string;
  onPrimaryClick?: () => void;
  tone?: Tone;
}) {
  const [index, setIndex] = React.useState(0);

  // calm のときはアニメーション止める（固定ワード）
  React.useEffect(() => {
    if (tone === "calm") return;
    const t = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 2400);
    return () => clearInterval(t);
  }, [tone]);

  const headingClass =
    tone === "bold"
      ? "text-5xl sm:text-7xl"
      : tone === "calm"
      ? "text-3xl sm:text-5xl"
      : "text-4xl sm:text-6xl";

  return (
    <section className="relative isolate overflow-hidden">
      <BackgroundFX tone={tone} />

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-10 sm:pt-20 sm:pb-16 lg:px-8">
        {/* kicker */}
        <div className="mb-4 flex items-center gap-2 text-sky-300/90">
          <Icon.Sparkles className="h-5 w-5" />
          <span className="text-sm tracking-wide">
            DevNav+ — Spring × React 技術ポータル
          </span>
        </div>

        {/* 見出し */}
        <h1
          className={`text-balance ${headingClass} font-extrabold leading-tight text-white`}
        >
          <span
            className={
              tone === "calm"
                ? ""
                : "bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent"
            }
          >
            本気の開発を、
          </span>
          <span className="block">
            {tone === "calm" ? (
              <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                実践的
              </span>
            ) : (
              <AnimatedWord index={index} />
            )}{" "}
            で始めよう
          </span>
        </h1>

        {/* サブコピー */}
        <p className="mt-6 max-w-2xl text-pretty text-lg text-white/70">
          Spring Boot と React
          を軸に、実務で通用する設計・実装・運用までを一気通貫で学べます。
          迷わず最短で辿り着くための“設計思想”と“実装の型”を提供します。
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={onPrimaryClick}
            className={
              tone === "calm"
                ? "group inline-flex items-center gap-2 rounded-xl bg-sky-500/80 px-5 py-3 text-base font-semibold text-black transition hover:bg-sky-500"
                : "group inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-base font-semibold text-black shadow-[0_10px_30px_-10px_rgba(56,189,248,0.8)] transition hover:-translate-y-0.5 hover:bg-sky-400"
            }
          >
            はじめる
            <Icon.ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>

          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className={
              tone === "calm"
                ? "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-base font-semibold text-white/80 hover:bg-white/7"
                : "inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-base font-semibold text-white/80 backdrop-blur transition hover:bg-white/10"
            }
          >
            <Icon.Github className="h-4 w-4" /> GitHub
          </a>

          <div className="ml-2 hidden items-center gap-2 text-sm text-white/60 sm:flex">
            <Icon.ShieldCheck className="h-4 w-4" /> 安心の認証・権限設計
            <span className="mx-2 h-3 w-px bg-white/15" />
            <Icon.Zap className="h-4 w-4" /> 現場で使えるベストプラクティス
          </div>
        </div>

        {/* スクショ */}
        <div className="relative mt-14 sm:mt-16">
          <DeviceMock screenshotSrc={screenshotSrc} tone={tone} />
        </div>

        {/* バッジ */}
        <div className="mt-10 grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <Badge label="技術記事" value="120+" />
          <Badge label="手順書" value="110+" />
          <Badge label="更新頻度" value="毎週" />
          <Badge label="対応スタック" value="Spring / React / Firebase" />
        </div>
      </div>
    </section>
  );
}

/* ============ parts ============ */

function AnimatedWord({ index }: { index: number }) {
  return (
    <div className="inline-block h-[1.1em] overflow-hidden align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block bg-gradient-to-r from-sky-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(34,211,238,0.35)]"
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80">
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="mt-0.5 text-xs tracking-wide text-white/60">{label}</div>
    </div>
  );
}

function DeviceMock({
  screenshotSrc,
  tone,
}: {
  screenshotSrc: string;
  tone: Tone;
}) {
  const hover =
    tone === "bold"
      ? { rotateX: 10, rotateY: -8 }
      : tone === "calm"
      ? { rotateX: 3, rotateY: -2 }
      : { rotateX: 8, rotateY: -6 };

  const shadowClass =
    tone === "bold"
      ? "shadow-[0_50px_140px_-30px_rgba(59,130,246,0.45)] border-white/20"
      : tone === "calm"
      ? "shadow-[0_30px_80px_-40px_rgba(59,130,246,0.18)] border-white/8"
      : "shadow-[0_40px_120px_-30px_rgba(59,130,246,0.35)] border-white/15";

  const showScan = tone !== "calm";

  return (
    <motion.div
      whileHover={hover}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="relative mx-auto w-full max-w-4xl [perspective:1000px]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className={`relative rounded-3xl border ${shadowClass} bg-gradient-to-b from-white/10 to-white/5 p-1`}
      >
        <div className="rounded-2xl bg-[#0b1220] p-2">
          <div className="mx-auto mb-2 mt-1 h-2 w-16 rounded-full bg-white/10" />
          <div className="relative overflow-hidden rounded-xl ring-1 ring-white/10">
            {showScan && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.8, repeat: Infinity }}
              />
            )}
            <img
              src={screenshotSrc}
              alt="App screenshot"
              loading="lazy"
              decoding="async"
              className="block w-full select-none object-cover"
            />
          </div>
        </div>
      </div>
      {tone !== "calm" && (
        <div className="pointer-events-none absolute -inset-x-6 top-full -mt-4 h-24 bg-gradient-to-b from-sky-500/20 via-cyan-400/10 to-transparent blur-2xl" />
      )}
    </motion.div>
  );
}

function BackgroundFX({ tone }: { tone: Tone }) {
  if (tone === "calm") {
    return (
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(14,165,233,0.06)_0%,rgba(14,165,233,0)_60%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>
    );
  }

  // default / bold は派手目
  const spot1 = tone === "bold" ? "bg-sky-500/30" : "bg-sky-500/20";
  const spot2 = tone === "bold" ? "bg-emerald-400/25" : "bg-emerald-400/15";
  const gridOpacity = tone === "bold" ? "opacity-[0.12]" : "opacity-[0.08]";

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(14,165,233,0.12)_0%,rgba(14,165,233,0)_60%)]" />
      <div
        className={`pointer-events-none absolute -right-32 top-10 h-72 w-72 rotate-12 rounded-full ${spot1} blur-3xl`}
      />
      <div
        className={`pointer-events-none absolute -left-24 top-40 h-72 w-72 -rotate-12 rounded-full ${spot2} blur-3xl`}
      />
      <div
        className={`pointer-events-none absolute inset-0 ${gridOpacity}`}
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.2) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
    </div>
  );
}
