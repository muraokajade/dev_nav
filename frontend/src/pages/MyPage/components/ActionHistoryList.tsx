import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { ActionHistory } from "../../../models/ActionHistory";
import { useAuth } from "../../../context/useAuthContext";

export const ActionHistoryList = () => {
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const { idToken } = useAuth();
  useEffect(() => {
    if (!idToken) return;
    axios
      .get("/api/user/actions/history?limit=10", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([])); // エラー時は空配列
  }, [idToken]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">直近のアクション履歴</h2>
      <ul>
        {history.length === 0 && (
          <li className="text-gray-400">アクション履歴がありません</li>
        )}
        {history.map((item, i) => (
          <li key={i} className="mb-2 text-sm flex items-center gap-2">
            <span>
              {item.type === "review" && "⭐ レビュー"}
              {item.type === "comment" && "💬 コメント"}
              {item.type === "read" && "📖 読了:"}
            </span>
            <span className="font-bold">記事タイトル:{item.articleTitle}</span>
            {item.content && (
              <span className="text-gray-400">投稿コメント:「{item.content}」</span>
            )}

            <span className="text-gray-500 ml-auto">
              {dayjs(item.date).format("M/D HH:mm")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
