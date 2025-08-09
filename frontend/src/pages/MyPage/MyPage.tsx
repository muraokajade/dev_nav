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

  // カレンダー取得（calendar に統一）
  useEffect(() => {
    if (!idToken) return;
    (async () => {
      try {
        const res = await axios.get(
          `/api/user/actions/calendar?year=${year}&month=${month}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setCalendarDays((res.data as CalendarDay[]) ?? []);
      } catch (e) {
        setCalendarDays([]);
      }
    })();
  }, [idToken, year, month]);

  // 月移動
  const prevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  // liked: 表示用に必須プロパティへ変換
  const likedForList: Article[] = (actionStatus?.likedArticles ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    authorName: a.authorName ?? a.author?.displayName ?? "不明",
  }));

  // レンダリング
  if (userError || actionError) {
    return (
      <div className="text-red-500 p-8">
        {userError && <div>{userError}</div>}
        {actionError && <div>{actionError}</div>}
      </div>
    );
  }

  if (!user || !actionStatus) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto py-4 px-2 sm:px-0">
        {/* タイトル＆2カラム */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 mb-8">
          {/* 左：プロフィール＆レベル */}
          <div className="flex-1 w-full mb-6 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">マイページ</h1>
            <div className="mb-2">
              <div className="text-xl sm:text-2xl font-semibold">{user.displayName}</div>
              <div className="text-gray-400 text-xs sm:text-sm">{user.email}</div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-base sm:text-lg">Lv.{level}</span>
              <span className="text-xs sm:text-sm text-gray-400">EXP: {exp}%</span>
            </div>
            <LevelBar level={level} exp={exp} />
          </div>

          {/* 右：カレンダー */}
          <div className="flex-1 w-full flex flex-col">
            <div className="bg-white/10 w-full sm:w-2/3 shadow-lg rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2 text-center text-white">学習カレンダー</h2>
              <div className="flex justify-center">
                <ProgressCalendar
                  days={calendarDays}
                  year={year}
                  month={month}
                  onPrevMonth={prevMonth}
                  onNextMonth={nextMonth}
                />
              </div>
            </div>
          </div>
        </div>

        {/* アクションサマリー */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-8">
          <ActionCard label="記事読了数" value={actionStatus.articlesRead} icon="📖" />
          <ActionCard label="レビュー数" value={actionStatus.reviews} icon="⭐" />
          <ActionCard label="いいね数" value={actionStatus.likes} icon="💖" />
          <ActionCard label="コメント数" value={actionStatus.comments} icon="💬" />
        </div>

        {/* いいね済み記事一覧 */}
        <div className="mb-10">
          <LikedArticlesList articles={likedForList} />
        </div>

        {/* 履歴 */}
        <ActionHistoryList />
      </div>
    </div>
  );
};
