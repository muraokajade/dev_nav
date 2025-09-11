import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../../context/useAuthContext";
import { ProgressCalendar, DayAction } from "./components/ProgressCalendar";
import { ActionHistoryList } from "./components/ActionHistoryList";
import { apiHelper } from "../../libs/apiHelper";
import { LevelBar } from "./components/LevelBar";
import { LikedArticlesList } from "./components/LikedArticlesList";
import { useLikedArticles } from "../../hooks/useLikedArticles";

/* ---------- types ---------- */
type UserStats = {
  readCount: number;
  reviewCount: number;
  likeCount: number;
  commentCount: number;
  level: number; // Lv. 表示用
  expPercent: number;
};
const ZERO: UserStats = {
  readCount: 0,
  reviewCount: 0,
  likeCount: 0,
  commentCount: 0,
  level: 1, // Lv. 表示用
  expPercent: 0,
};

/* ---------- normalizers ---------- */
function normalizeStats(data: any): UserStats | null {
  if (!data || typeof data !== "object") return null;

  const obj = data.data ?? data.status ?? data;

  const pickNum = (keys: string[], fallback = 0) => {
    for (const k of keys) {
      const v = obj?.[k];
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return fallback;
  };

  const clamp0to100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const readCount = pickNum([
    "readCount",
    "reads",
    "read_count",
    "articlesRead",
    "read_total",
  ]);
  const reviewCount = pickNum(["reviewCount", "reviews", "review_count"]);
  const likeCount = pickNum(["likeCount", "likes", "like_count"]);
  const commentCount = pickNum([
    "commentCount",
    "comments",
    "comment_count",
    "threadMessages",
  ]);

  // 追加: level / expPercent もマッピング
  const level = pickNum(["level", "lv"], 1) || 1;
  const expPercentRaw = pickNum(["expPercent", "exp_percent", "exp"], 0);
  const expPercent = clamp0to100(expPercentRaw);

  if (
    readCount + reviewCount + likeCount + commentCount === 0 &&
    process.env.NODE_ENV !== "production"
  ) {
    // eslint-disable-next-line no-console
    console.warn("[MyPage] stats mapping fallback (all zero). raw =", data);
  }

  return { readCount, reviewCount, likeCount, commentCount, level, expPercent };
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
  const {
    data: likedArticles,
    loading: loadingLikes,
    error,
  } = useLikedArticles(authHeader);

  const [stats, setStats] = useState<UserStats>(ZERO);
  const [calendarDays, setCalendarDays] = useState<DayAction[]>([]);
  const [loadingCal, setLoadingCal] = useState<boolean>(true);

  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1); // 1..12

  // 統計：フォールバックで取得（本番でまず /api/status/mine を叩く）
  useEffect(() => {
    if (!idToken) {
      setStats(ZERO);
      return;
    }
    const endpoints = ["/api/status/mine", "/api/user/stats", "/api/me/stats"];
    (async () => {
      let normalized: UserStats | null = null;
      for (const url of endpoints) {
        try {
          // stats取得のtry内、normalize前に

          const { data } = await apiHelper.get(url, { headers: authHeader });
          console.log("[stats raw]", url, data);
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
      <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rotate-45 rounded-full bg-white/10 blur-2xl" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">マイページ</h1>
          <div className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/80">
            {dayjs().format("YYYY/MM/DD")}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <LevelBar
            level={stats.level ?? 1}
            expPercent={stats.expPercent ?? 0}
          />

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

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">🧡</span>
              <h2 className="text-xl font-bold">いいねした記事一覧</h2>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white/70">
              <LikedArticlesList articles={likedArticles} variant="bare" />
            </div>
          </div>
          <ActionHistoryList showTitle variant="card" />
        </div>
      </div>
    </div>
  );
};
