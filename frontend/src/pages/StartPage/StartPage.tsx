// StartPage.tsx — 手順IDは固定、タイトル/スラグだけ自動補完して堅くする版
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuthContext"; 

type RouteT = "articles" | "syntaxes" | "procedures";
type RawStep = { key: "step1" | "step2" | "step3"; label: string; route: RouteT; id: number };
type Step = RawStep & { path: string; displayTitle: string };

// ★ ここは今までどおり“実在ID”を固定で
const RAW_STEPS: RawStep[] = [
  { key: "step1", label: "環境構築",                 route: "procedures", id: 44 },
  { key: "step2", label: "最小アプリ(React×Spring)", route: "procedures", id: 48 },
  { key: "step3", label: "CRUDと認証へ",             route: "procedures", id: 60 },
];

const LS_CHECKS = "start.checks.v1";
const LS_RECENTS = "recent.items.v1";

export const StartPage = () => {
  const { idToken } = useAuth();
  const isLoggedIn = !!idToken;

  const [checks, setChecks] = useState<boolean[]>(
    () => JSON.parse(localStorage.getItem(LS_CHECKS) || "[]")
  );
  useEffect(() => localStorage.setItem(LS_CHECKS, JSON.stringify(checks)), [checks]);

  // 読了件数（簡易）
  const [reads, setReads] = useState<{[K in RouteT]?: number[]}>({});
  useEffect(() => {
    if (!isLoggedIn) return;
    const headers = { Authorization: `Bearer ${idToken}` };
    (async () => {
      try {
        const [a, s, p] = await Promise.all([
          axios.get<number[]>("/api/articles/read/all",   { headers }),
          axios.get<number[]>("/api/syntaxes/read/all",   { headers }),
          axios.get<number[]>("/api/procedures/read/all", { headers }),
        ]);
        setReads({ articles: a.data ?? [], syntaxes: s.data ?? [], procedures: p.data ?? [] });
      } catch {
        setReads({});
      }
    })();
  }, [isLoggedIn, idToken]);

  // ★ タイトル/スラグ補完（バックエンド変更なし）
  const [steps, setSteps] = useState<Step[]>(
    () => RAW_STEPS.map(s => ({ ...s, path: `/${s.route}/${s.id}`, displayTitle: s.label }))
  );
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // procedures なら /api/procedures/{id} という既存詳細APIでOK
      const enriched = await Promise.all(RAW_STEPS.map(async (s) => {
        try {
          const { data } = await axios.get(`/api/${s.route}/${s.id}`);
          const title = data?.title ?? data?.name ?? s.label;
          const slug  = data?.slug ?? data?.pathSlug ?? "";
          const path  = `/${s.route}/${s.id}${slug ? `-${slug}` : ""}`;
          return { ...s, path, displayTitle: title } as Step;
        } catch {
          // 失敗時はハードコードのまま使う
          return { ...s, path: `/${s.route}/${s.id}`, displayTitle: s.label } as Step;
        }
      }));
      if (!cancelled) setSteps(enriched);
    })();
    return () => { cancelled = true; };
  }, []);

  // “次にやる” = 未読の最初
  const nextStep = useMemo(() => {
    if (!isLoggedIn) return steps[0];
    const isRead = (r: RouteT, id: number) => (reads[r] ?? []).includes(id);
    return steps.find(s => !isRead(s.route, s.id)) ?? null;
  }, [isLoggedIn, steps, reads]);

  const progress = useMemo(() => ({
    articles:   (reads.articles   ?? []).length,
    syntaxes:   (reads.syntaxes   ?? []).length,
    procedures: (reads.procedures ?? []).length,
  }), [reads]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">学習を始める</h1>
      <p className="text-gray-400 mb-8">最短で成果に繋がる3ステップを用意しました。</p>

      {/* 学習を再開 */}
      <section className="mb-10">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {nextStep ? (
            <>
              <div>
                <div className="text-gray-300 text-sm mb-1">次にやる</div>
                <div className="text-lg font-semibold text-white">{nextStep.displayTitle}</div>
              </div>
              <Link to={nextStep.path} className="inline-block px-4 py-2 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-400 transition w-fit">
                このステップへ進む
              </Link>
            </>
          ) : (
            <div className="text-white">3ステップはすべて<strong className="ml-1">読了済み！</strong> 🎉</div>
          )}
        </div>
      </section>

      {/* 3ステップ一覧 */}
      <ol className="grid md:grid-cols-3 gap-6 mb-12">
        {steps.map((s, i) => {
          const done = (reads[s.route] ?? []).includes(s.id);
          return (
            <li key={s.key} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition">
              <div className="text-xs uppercase tracking-wide text-gray-400">STEP {i + 1}</div>
              <div className="font-semibold mt-1 text-white flex items-center gap-2">
                {s.displayTitle}
                {done && <span className="text-emerald-400 text-xs px-2 py-0.5 border border-emerald-400/50 rounded">読了</span>}
              </div>
              <Link to={s.path} className="inline-block mt-3 px-3 py-1 rounded-lg bg-sky-500 text-white text-sm hover:bg-sky-400 transition">
                開く
              </Link>
            </li>
          );
        })}
      </ol>

      {/* 進捗（ログイン時） */}
      {isLoggedIn && (
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "技術記事 読了",    val: progress.articles },
            { label: "文法記事 読了",    val: progress.syntaxes },
            { label: "開発手順記事 読了", val: progress.procedures },
          ].map((x, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-gray-300 text-sm">{x.label}</div>
              <div className="text-3xl font-extrabold text-white mt-1">{x.val}</div>
            </div>
          ))}
        </section>
      )}

      {/* 今日のチェック */}
      <section className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-12">
        <div className="font-semibold mb-4 text-white">今日のチェック</div>
        <ul className="space-y-3 text-sm">
          {["ローカル環境を起動できた","API→フロントで一覧を表示できた","GitHubにPushした"].map((t, idx) => (
            <li key={idx} className="flex items-center">
              <input
                type="checkbox"
                className="mr-3 w-4 h-4 accent-sky-500"
                checked={!!checks[idx]}
                onChange={(e) => {
                  const next = [...checks]; next[idx] = e.target.checked; setChecks(next);
                }}
              />
              <span className="text-gray-300">{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* クイックリンク */}
      <section className="grid md:grid-cols-3 gap-4">
        <Link to="/articles"   className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] text-gray-200 transition">技術記事一覧</Link>
        <Link to="/syntaxes"   className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] text-gray-200 transition">文法記事一覧</Link>
        <Link to="/procedures" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] text-gray-200 transition">開発手順記事一覧</Link>
      </section>
    </main>
  );
};
