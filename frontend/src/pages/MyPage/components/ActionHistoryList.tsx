// ActionHistoryList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { ActionHistory } from "../../../models/ActionHistory";
import { useAuth } from "../../../context/useAuthContext";
import { Link } from "react-router-dom";

type Props = {
  showTitle?: boolean; // 追加: 見出しの有無
  variant?: "card" | "bare"; // 追加: 外枠/区切り線を自前で持つか
};

export const ActionHistoryList = ({
  showTitle = true,
  variant = "card",
}: Props) => {
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const { idToken } = useAuth();

  useEffect(() => {
    if (!idToken) return;
    axios
      .get("/api/user/actions/history?limit=10", {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]));
  }, [idToken]);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    variant === "card" ? (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 divide-y divide-white/10">
        {children}
      </div>
    ) : (
      <>{children}</>
    );

  return (
    <Wrapper>
      {showTitle && (
        <h2 className="text-xl font-bold mb-2">直近のアクション履歴</h2>
      )}
      <ul>
        {/* 履歴が空の場合 */}
        {history.length === 0 && (
          <li className="px-4 py-3 text-gray-400">
            アクション履歴がありません
          </li>
        )}

        {history.map((item) => {
          // アイコン付き種別
          const kind =
            item.type === "review"
              ? "⭐ レビュー"
              : item.type === "comment"
              ? "💬 コメント"
              : "📖 読了:";

          return (
            <li
              key={`${item.type}-${item.date}-${item.articleId}`}
              className="px-4 py-3"
            >
              {/* 1段目：アイコン/種別 | タイトル（省略） | 時刻（固定） */}
              <div className="grid grid-cols-[auto,1fr,auto] items-start gap-2">
                {/* 種別 */}
                <span className="shrink-0">{kind}</span>

                {/* タイトル全体に truncate を適用（min-w-0 を親に付与） */}
                <div className="min-w-0">
                  <div className="truncate font-bold">
                    <span className="mr-1">記事タイトル:</span>
                    <Link
                      to={`/articles/${item.articleId}`}
                      className="text-blue-400 hover:text-blue-300 hover:underline transition align-baseline"
                      title={item.articleTitle}
                    >
                      {item.articleTitle}
                    </Link>
                  </div>
                </div>

                {/* 時刻は折り返し禁止で右端キープ */}
                <span className="text-gray-500 ml-2 whitespace-nowrap">
                  {dayjs(item.date).format("M/D HH:mm")}
                </span>
              </div>

              {/* 2段目：コメント（ある時だけ）→ 2列目の下に揃える */}
              {item.content && (
                <div className="mt-1 text-gray-400 text-sm col-start-2">
                  投稿コメント:「{item.content}」
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Wrapper>
  );
};
