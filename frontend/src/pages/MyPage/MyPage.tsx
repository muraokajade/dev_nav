import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../../context/useAuthContext";
import { ProgressCalendar, DayAction } from "./components/ProgressCalendar";
import { ActionHistoryList } from "./components/ActionHistoryList";
import { apiHelper } from "../../libs/apiHelper";

/* ---------- types ---------- */
type UserStats = {
  readCount: number;
  reviewCount: number;
  likeCount: number;
  commentCount: number;
};
const ZERO: UserStats = {
  readCount: 0,
  reviewCount: 0,
  likeCount: 0,
  commentCount: 0,
};

/* ---------- normalizers ---------- */
function normalizeStats(data: any): UserStats | null {
  if (!data || typeof data !== "object") return null;
  const obj = data.data ?? data.status ?? data;
  const pick = (keys: string[], fallback = 0) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (typeof v === "number" && Number.isFinite(v)) return v;
    }
    return fallback;
  };
  const readCount = pick([
    "readCount",
    "reads",
    "read_count",
    "articlesRead",
    "read_total",
  ]);
  const reviewCount = pick(["reviewCount", "reviews", "review_count"]);
  const likeCount = pick(["likeCount", "likes", "like_count"]);
  const commentCount = pick(["commentCount", "comments", "comment_count"]);

  if (
    readCount + reviewCount + likeCount + commentCount === 0 &&
    process.env.NODE_ENV !== "production"
  ) {
    // eslint-disable-next-line no-console
    console.warn("[MyPage] stats mapping fallback (all zero). raw =", data);
  }
  return { readCount, reviewCount, likeCount, commentCount };
}

/* ---------- component ---------- */
export const MyPage: React.FC = () => {
  const { idToken } = useAuth();

  // axios共通ヘッダ
  useEffect(() => {
    if (idToken)
      apiHelper.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;
    else delete apiHelper.defaults.headers.common["Authorization"];
  }, [idToken]);
  const authHeader = useMemo(
    () => (idToken ? { Authorization: `Bearer ${idToken}` } : undefined),
    [idToken]
  );

  const [stats, setStats] = useState<UserStats>(ZERO);
  const [calendarDays, setCalendarDays] = useState<DayAction[]>([]);
  const [loadingCal, setLoadingCal] = useState<boolean>(true);

  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1); // 1..12

  // 統計：フォールバックで取得
  useEffect(() => {
    if (!idToken) {
      setStats(ZERO);
      return;
    }
    const endpoints = ["/api/user/stats", "/api/status/mine", "/api/me/stats"];
    (async () => {
      let normalized: UserStats | null = null;
      for (const url of endpoints) {
        try {
          const { data } = await apiHelper.get(url, { headers: authHeader });
          normalized = normalizeStats(data);
          if (normalized) break;
        } catch (e: any) {
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.warn(
              `[MyPage] stats fetch failed at ${url}`,
              e?.response?.status
            );
          }
        }
      }
      setStats(normalized ?? ZERO);
    })();
  }, [idToken, authHeader]);

  // カレンダー
  useEffect(() => {
    if (!idToken) {
      setCalendarDays([]);
      setLoadingCal(false);
      return;
    }
    let aborted = false;
    setLoadingCal(true);
    (async () => {
      try {
        const { data } = await apiHelper.get("/api/user/actions/calendar", {
          headers: authHeader,
          params: { year, month },
        });
        const raw = Array.isArray(data)
          ? data
          : typeof data === "object" && data
          ? Object.values(data as Record<string, unknown>)
          : [];
        const safe: DayAction[] = (raw as any[]).filter(
          (d) =>
            d && typeof d.date === "string" && typeof d.actions === "number"
        );
        if (!aborted) setCalendarDays(safe);
      } catch (e: any) {
        if (!aborted) setCalendarDays([]);
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn("[MyPage] calendar fetch failed", e?.response?.status);
        }
      } finally {
        if (!aborted) setLoadingCal(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [idToken, authHeader, year, month]);

  // 記事側からの戻りで更新
  useEffect(() => {
    const need = localStorage.getItem("needs-stats-refresh");
    if (need === "1") {
      localStorage.removeItem("needs-stats-refresh");
      (async () => {
        try {
          const { data } = await apiHelper.get("/api/user/stats", {
            headers: authHeader,
          });
          const n = normalizeStats(data);
          setStats(n ?? ZERO);
        } catch {
          /* noop */
        }
      })();
    }
  }, [authHeader]);

  const onPrevMonth = () => {
    const cur = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).subtract(
      1,
      "month"
    );
    setYear(cur.year());
    setMonth(cur.month() + 1);
  };
  const onNextMonth = () => {
    const cur = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).add(
      1,
      "month"
    );
    setYear(cur.year());
    setMonth(cur.month() + 1);
  };

  /* ---- UI helpers ---- */
  const StatCard: React.FC<{
    label: string;
    value: number;
    emoji: string;
    color: string;
    hint?: string;
  }> = ({ label, value, emoji, color, hint }) => (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${color} p-4 transition-transform hover:scale-[1.02] hover:shadow-xl`}
      title={hint ?? label}
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-3xl leading-none">{emoji}</div>
        <div className="text-2xl font-extrabold tabular-nums">{value}</div>
      </div>
      <div className="mt-2 text-sm opacity-85">{label}</div>
      {/* ハイライトの光筋 */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rotate-45 rounded-full bg-white/10 blur-2xl" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-6xl p-6">
        {/* ヘッダ */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">マイページ</h1>
          <div className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/80">
            {dayjs().format("YYYY/MM/DD")}
          </div>
        </div>

        {/* 上段：経験値／カレンダー */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* EXP */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl font-bold">Lv.</span>
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                EXP
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded bg-white/10">
              <div className="h-3 w-[35%] animate-[pulse_2.2s_ease-in-out_infinite] rounded bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            </div>
            <div className="mt-2 text-xs text-white/60">
              ※ ダミー表示。今後スコアと連動
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-2 text-center text-lg font-bold">
              学習カレンダー
            </div>
            {!loadingCal ? (
              <ProgressCalendar
                days={calendarDays}
                year={year}
                month={month}
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
              />
            ) : (
              <div className="py-10 text-center text-white/70">読み込み中…</div>
            )}
          </div>
        </div>

        {/* 統計カード */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <StatCard
            label="記事既読数"
            value={stats.readCount}
            emoji="📚"
            color="from-sky-900/40 to-sky-700/20"
          />
          <StatCard
            label="レビュー数"
            value={stats.reviewCount}
            emoji="⭐"
            color="from-amber-900/40 to-amber-700/20"
          />
          <StatCard
            label="いいね数"
            value={stats.likeCount}
            emoji="💖"
            color="from-rose-900/40 to-rose-700/20"
          />
          <StatCard
            label="コメント数"
            value={stats.commentCount}
            emoji="💬"
            color="from-emerald-900/40 to-emerald-700/20"
          />
        </div>

        {/* いいね一覧（プレースホルダー） + 履歴 */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">🧡</span>
              <h2 className="text-xl font-bold">いいねした記事一覧</h2>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white/70">
              まだありません
            </div>
          </div>

          <ActionHistoryList showTitle variant="card" />
        </div>
      </div>
    </div>
  );
};
