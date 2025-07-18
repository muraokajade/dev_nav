import { useEffect, useState } from "react";
import axios from "axios";

export const AdminDashboard = () => {
  // ダミーstate
  const [adminEmail, setAdminEmail] = useState("admin@example.com");
  const [accessCount, setAccessCount] = useState(1523); // 仮データ
  const [unansweredQ, setUnansweredQ] = useState(7);    // 仮データ
  const [news, setNews] = useState([
    "今月の記事投稿数：15件",
    "未対応Q&Aがあります。管理画面から確認してください。",
    "新しいバージョンがリリースされました"
  ]);
  // 本来はuseEffect+axiosでAPIから情報取得

return (
    <div className="bg-zinc-800 rounded-2xl p-8 shadow flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-4 text-white">管理者ダッシュボード</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="bg-blue-600 px-6 py-4 rounded-xl text-white font-semibold flex-1 min-w-[180px]">
          管理者メール<br /><span className="text-lg">admin@example.com</span>
        </div>
        <div className="bg-green-600 px-6 py-4 rounded-xl text-white font-semibold flex-1 min-w-[180px]">
          今月のアクセス<br /><span className="text-lg">1523回</span>
        </div>
        <div className="bg-yellow-600 px-6 py-4 rounded-xl text-white font-semibold flex-1 min-w-[180px]">
          未対応Q&A<br /><span className="text-lg">7件</span>
        </div>
        <div className="bg-purple-600 px-6 py-4 rounded-xl text-white font-semibold flex-1 min-w-[180px]">
          新規ユーザー<br /><span className="text-lg">3人</span>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2 text-white">お知らせ</h3>
        <ul className="text-gray-200 list-disc ml-6">
          <li>今月の記事投稿数：15件</li>
          <li>未対応Q&Aがあります。管理画面から確認してください。</li>
          <li>新しいバージョンがリリースされました</li>
        </ul>
      </div>
    </div>
  );
};
