// MyPage.tsx（UI整形・機能はそのまま）
import React, { useEffect, useState } from "react";
import axios from "axios";
import { LevelBar } from "./components/LevelBar";
import { ActionCard } from "./components/ActionCard";
import { useAuth } from "../../context/useAuthContext";
import { ProgressCalendar } from "./components/ProgressCalendar";
import { ActionHistoryList } from "./components/ActionHistoryList";
import { LikedArticlesList } from "./components/LikedArticlesList";

// ---- 型（最低限） ----
type Me = { displayName: string; email: string };
type Article = { id: number; title: string; authorName: string };
type StatusMine = {
  level: number;
  expPercent: number;
  articlesRead: number;
  reviews: number;
  likes: number;
  comments: number;
  likedArticles?: Array<{
    id: number;
    title: string;
    slug?: string;
    authorName?: string;
    author?: { displayName?: string };
  }>;
};
type CalendarDay = { date: string; actions: number };

// 汎用カード（見た目統一）
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => (
  <div
    className={`rounded-2xl bg-white/5 border border-white/10 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export const MyPage = () => {
  const { idToken } = useAuth();

  // 基本情報
  const [user, setUser] = useState<Me | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  // ステータス
  const [actionStatus, setActionStatus] = useState<StatusMine | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);

  // カレンダー
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // /api/me と /api/status/mine を並列取得
  useEffect(() => {
    if (!idToken) return;
    setUser(null);
    setActionStatus(null);
    setUserError(null);
    setActionError(null);

    (async () => {
      try {
        const [meRes, statusRes] = await Promise.all([
          axios.get("/api/me", {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          axios.get("/api/status/mine", {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
        ]);
        setUser(meRes.data as Me);
        const s = statusRes.data as StatusMine;
        setActionStatus(s);
        setLevel(s.level);
        setExp(s.expPercent);
      } catch (err) {
        setUserError("ユーザーデータの取得に失敗しました");
        setActionError("ステータス情報の取得に失敗しました");
        console.error(err);
      }
    })();
  }, [idToken]);

  // カレンダー取得
  useEffect(() => {
    if (!idToken) return;
    (async () => {
      try {
        const res = await axios.get(
          `/api/user/actions/calendar?year=${year}&month=${month}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setCalendarDays((res.data as CalendarDay[]) ?? []);
      } catch {
        setCalendarDays([]);
      }
    })();
  }, [idToken, year, month]);

  // 月移動
  const prevMonth = () =>
    month === 1
      ? (setYear((y) => y - 1), setMonth(12))
      : setMonth((m) => m - 1);
  const nextMonth = () =>
    month === 12
      ? (setYear((y) => y + 1), setMonth(1))
      : setMonth((m) => m + 1);

  // liked: 表示用に整形
  const likedForList: Article[] = (actionStatus?.likedArticles ?? []).map(
    (a) => ({
      id: a.id,
      title: a.title,
      authorName: a.authorName ?? a.author?.displayName ?? "不明",
    })
  );

  // ---- UI ----
  if (userError || actionError) {
    return (
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
          <Card className="p-6 border-red-400/20 bg-red-500/10">
            <h1 className="text-xl font-semibold text-red-300 mb-2">
              読み込みエラー
            </h1>
            {userError && <div className="text-red-200">{userError}</div>}
            {actionError && <div className="text-red-200">{actionError}</div>}
          </Card>
        </div>
      </main>
    );
  }

  if (!user || !actionStatus) {
    return (
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
          <Card className="p-6 animate-pulse">
            <div className="h-6 w-40 bg-white/10 rounded mb-4" />
            <div className="h-3 w-56 bg-white/10 rounded mb-2" />
            <div className="h-2 w-full bg-white/10 rounded" />
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        {/* 見出し */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">マイページ</h1>
        </header>

        {/* 上段：プロフィール + カレンダー */}
        <section className="grid md:grid-cols-[1.2fr,1fr] gap-6 mb-10">
          {/* 左：プロフィール＆レベル */}
          <Card className="p-6">
            <div className="mb-3">
              <div className="text-xl md:text-2xl font-semibold">
                {user.displayName}
              </div>
              <div className="text-sm text-gray-400">{user.email}</div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold">Lv.{level}</span>
              <span className="text-sm text-gray-400">EXP: {exp}%</span>
            </div>
            <LevelBar level={level} exp={exp} />
          </Card>

          {/* 右：カレンダー */}
          <Card className="p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-white text-center mb-3">
              学習カレンダー
            </h2>
            <div className="flex justify-center">
              <ProgressCalendar
                days={calendarDays}
                year={year}
                month={month}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
              />
            </div>
          </Card>
        </section>

        {/* KPI */}
        <section className="mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <ActionCard
              label="記事読了数"
              value={actionStatus.articlesRead}
              icon="📖"
            />
            <ActionCard
              label="レビュー数"
              value={actionStatus.reviews}
              icon="⭐"
            />
            <ActionCard label="いいね数" value={actionStatus.likes} icon="💖" />
            <ActionCard
              label="コメント数"
              value={actionStatus.comments}
              icon="💬"
            />
          </div>
        </section>

        {/* いいね済み記事一覧 */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">いいねした記事一覧</h2>
          <Card className="p-0 divide-y divide-white/10">
            <LikedArticlesList
              articles={likedForList}
              showTitle={false}
              variant="bare"
            />
          </Card>
        </section>

        {/* 履歴 */}
        <section className="mb-4 md:mb-8">
          <h2 className="text-lg font-semibold mb-3">直近のアクション履歴</h2>
          <Card className="p-0 divide-y divide-white/10">
            <ActionHistoryList showTitle={false} variant="bare" />
          </Card>
        </section>
      </div>
    </main>
  );
};
