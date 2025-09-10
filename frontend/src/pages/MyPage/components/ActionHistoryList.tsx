// src/pages/MyPage/components/ActionHistoryList.tsx
import React, { useEffect, useState } from "react";

import dayjs from "dayjs";
import { ActionHistory } from "../../../models/ActionHistory";
import { useAuth } from "../../../context/useAuthContext";
import { Link } from "react-router-dom";
import { apiHelper } from "../../../libs/apiHelper";

function isActionHistory(x: unknown): x is ActionHistory {
  return (
    !!x &&
    typeof (x as any).type === "string" &&
    typeof (x as any).date === "string" &&
    (typeof (x as any).articleId === "number" ||
      typeof (x as any).articleId === "string")
  );
}
function toArray(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  if (!input) return [];
  if (typeof input === "object")
    return Object.values(input as Record<string, unknown>);
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed)
        ? parsed
        : typeof parsed === "object" && parsed
        ? Object.values(parsed as Record<string, unknown>)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}
function normalizeHistory(input: unknown): ActionHistory[] {
  return toArray(input).filter(isActionHistory) as ActionHistory[];
}

type Props = {
  showTitle?: boolean;
  variant?: "card" | "bare";
};

export const ActionHistoryList = ({
  showTitle = true,
  variant = "card",
}: Props) => {
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { idToken } = useAuth();

  useEffect(() => {
    let aborted = false;
    setLoading(true);

    const run = async () => {
      if (!idToken) {
        setHistory([]);
        setLoading(false);
        return;
      }

      try {
        const res = await apiHelper.get("/api/user/actions/history?limit=10", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (aborted) return;

        const list = normalizeHistory(res?.data ?? []);
        setHistory(list);
      } catch (err: any) {
        if (aborted) return;
        console.log("history err", err?.response?.status, err?.response?.data);
        setHistory([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    run();
    return () => {
      aborted = true;
    };
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
        {loading && <li className="px-4 py-3 text-gray-400">読み込み中...</li>}
        {!loading && history.length === 0 && (
          <li className="px-4 py-3 text-gray-400">
            アクション履歴がありません
          </li>
        )}

        {history.map((item) => {
          const kind =
            item.type === "review"
              ? "⭐ レビュー"
              : item.type === "comment"
              ? "💬 コメント"
              : "📖 読了";
          const key = `${item.type}-${item.date}-${item.articleId}`;

          return (
            <li key={key} className="px-4 py-3">
              <div className="grid grid-cols-[auto,1fr,auto] items-start gap-2">
                <span className="shrink-0">{kind}</span>
                <div className="min-w-0">
                  <div className="truncate font-bold">
                    <span className="mr-1">記事タイトル:</span>
                    <Link
                      to={`/articles/${item.articleId}`}
                      className="text-blue-400 hover:text-blue-300 hover:underline transition align-baseline"
                      title={item.articleTitle}
                    >
                      {item.articleTitle ?? "(タイトルなし)"}
                    </Link>
                  </div>
                </div>
                <span className="text-gray-500 ml-2 whitespace-nowrap">
                  {dayjs(item.date).isValid()
                    ? dayjs(item.date).format("M/D HH:mm")
                    : item.date}
                </span>
              </div>

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
