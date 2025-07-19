import React, { useEffect, useState } from "react";
import axios from "axios";
import { LevelBar } from "./components/LevelBar";
import { ActionCard } from "./components/ActionCard";
import { useAuth } from "../../context/useAuthContext";
import { ProgressCalendar } from "./components/ProgressCalendar";
import { ActionHistoryList } from "./components/ActionHistoryList";
import { LikedArticlesList } from "./components/LikedArticlesList";

export const MyPage = () => {
  const [user, setUser] = useState<any>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [actionStats, setActionStatus] = useState<any>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [likedArticles, setLikedArticles] = useState([]);
  const { idToken } = useAuth();

  // 1. カレンダー用の状態追加
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // JSは0始まり
  const [calendarDays, setCalendarDays] = useState([]); // [{ date, actions }]型

  useEffect(() => {
    if (!idToken) return;
    axios
      .get(`/api/user/actions/calender?year=${year}&month=${month}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
      .then((res) => setCalendarDays(res.data))
      .catch((e) => setCalendarDays([]));
  }, [idToken, year, month]);

  // 3. 月移動用ハンドラ
  const prevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };
  const nextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  // /api/me 用
  useEffect(() => {
    if (!idToken) return;
    setUser(null); // ローディング演出用（任意）
    setUserError(null); // 前回エラー消す
    axios
      .get("/api/me", {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        setUserError("ユーザーデータの取得に失敗しました");
        console.error(err);
      });
  }, [idToken]);

  // /api/status/mine 用
  useEffect(() => {
    if (!idToken) return;
    setActionStatus(null);
    setActionError(null);
    axios
      .get("/api/status/mine", {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => {
        console.log("APIレスポンス", res.data); // ←★ここでlikedArticlesが入ってるか見る
        setActionStatus(res.data);
        setLevel(res.data.level);
        setExp(res.data.expPercent);
      })
      .catch((err) => {
        setActionError("ステータス情報の取得に失敗しました");
        console.error(err);
      });
  }, [idToken]);

  //liked
  useEffect(() => {
    if (!idToken) return;
    axios
      .get("/api/articles/liked", {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => setLikedArticles(res.data))
      .catch(() => setLikedArticles([]));
  }, [idToken]);

  if (userError || actionError)
    return (
      <div className="text-red-500 p-8">
        {userError && <div>{userError}</div>}
        {actionError && <div>{actionError}</div>}
      </div>
    );

  if (!user || !actionStats)
    return <div className="text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* スマホ: px-2 / PC: px-0 */}
      <div className="max-w-4xl mx-auto py-4 px-2 sm:px-0">
        {/* タイトル＆2カラム → スマホは縦積み */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 mb-8">
          {/* 左カラム：プロフィール&バー */}
          <div className="flex-1 w-full mb-6 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
              マイページ
            </h1>
            <div className="mb-2">
              <div className="text-xl sm:text-2xl font-semibold">
                {user.displayName}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">
                {user.email}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-base sm:text-lg">Lv.{level}</span>
              <span className="text-xs sm:text-sm text-gray-400">
                EXP: {exp}%
              </span>
            </div>
            <LevelBar level={level} exp={exp} />
          </div>
          {/* 右カラム：カレンダー */}
          <div className="flex-1 w-full flex flex-col">
            <div className="bg-white/10 w-full sm:w-2/3 shadow-lg rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2 text-center text-white">
                学習カレンダー
              </h2>
              <div className="flex justify-center ">
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
          <ActionCard
            label="記事読了数"
            value={actionStats.articlesRead}
            icon="📖"
          />
          <ActionCard
            label="レビュー数"
            value={actionStats.reviews}
            icon="⭐"
          />
          <ActionCard label="いいね数" value={actionStats.likes} icon="💖" />
          <ActionCard
            label="コメント数"
            value={actionStats.comments}
            icon="💬"
          />
        </div>

        {/* いいね済み記事一覧 */}
        <div className="mb-10">
          <LikedArticlesList articles={actionStats.likedArticles ?? []} />
        </div>

        {/* 履歴 */}
        <ActionHistoryList />
      </div>
    </div>
  );
};
