import React, { useEffect, useState } from "react";
import axios from "axios";
import { LevelBar } from "./components/LevelBar";
import { ActionCard } from "./components/ActionCard";
import { useAuth } from "../../context/useAuthContext";

// 仮コンポーネント（未実装ならコメントで明記）
const ProgressCalendar = () => (
  <div>{/* ここに学習カレンダー */}カレンダー機能（未実装）</div>
);
<LevelBar />;

export const MyPage = () => {
  // 仮のステート
  const [user, setUser] = useState<any>(null);
  const [actionStats, setActionStats] = useState<any>(null);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const{idToken} = useAuth();

//   useEffect(() => {
//     if (idToken) {
//       axios.get("/api/me", {
//         headers: { Authorization: `Bearer ${idToken}` }
//       })
//       .then(res => setUser(res.data));
  
//       axios.get("/api/status/mine", {
//         headers: { Authorization: `Bearer ${idToken}` }
//       })
//       .then(res => {
//         setActionStats(res.data);
//         setLevel(res.data.level);
//         setExp(res.data.expPercent);
//       });
//     }
//   }, [idToken]);

useEffect(() => {
    // --- ここでモックデータを直で突っ込むだけでOK！ ---
    setUser({
      displayName: "田中エンジニア",
      email: "engineer@example.com",
      // iconUrl: "..." などもここで
    });
    setActionStats({
      articlesRead: 22,
      reviews: 7,
      likes: 15,
      comments: 9,
      level: 3,
      expPercent: 62,
      // likedArticles: [/* ... */],
      // reviewsHistory: [/* ... */],
      // commentsHistory: [/* ... */],
    });
    setLevel(3);
    setExp(62);
  }, []);
  

  if (!user || !actionStats)
    return <div className="text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">マイページ</h1>
        {/* プロフィール */}
        <div className="flex items-center gap-4 mb-6">
          {/* <ProfileImage src={user.iconUrl}/> */}
          <div>
            <div className="text-2xl font-semibold">{user.displayName}</div>
            <div className="text-gray-400 text-sm">{user.email}</div>
          </div>
        </div>
        {/* レベル＆進捗バー */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">Lv.{level}</span>
            <span className="text-sm text-gray-400">EXP: {exp}%</span>
          </div>
          <LevelBar level={level} exp={exp} />
        </div>
        {/* 学習アクションカレンダー */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">学習カレンダー</h2>
          <ProgressCalendar />
        </div>
        {/* アクションサマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
          <h2 className="text-xl font-bold mb-2">いいねした記事一覧</h2>
          {/* <LikedArticlesList articles={actionStats.likedArticles} /> */}
          <div className="text-gray-400">記事一覧機能（未実装）</div>
        </div>
        {/* レビュー履歴・コメント履歴なども追加可 */}
        {/* <ReviewHistory reviews={actionStats.reviewsHistory}/> */}
        {/* <CommentHistory comments={actionStats.commentsHistory}/> */}
      </div>
    </div>
  );
};
