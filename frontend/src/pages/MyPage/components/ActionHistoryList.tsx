// ActionHistoryList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { ActionHistory } from "../../../models/ActionHistory";
import { useAuth } from "../../../context/useAuthContext";
import { Link } from "react-router-dom";

/* ---------- 型ガード & 正規化 ---------- */
function isActionHistory(x: unknown): x is ActionHistory {
  // 使っているプロパティだけ堅めにチェック
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
  // API が {items:[...]} や 連想オブジェクトで返す場合に対応
  if (typeof input === "object")
    return Object.values(input as Record<string, unknown>);
  // 文字列JSONのケースも一応救済
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

/* ---------- Props ---------- */
type Props = {
  showTitle?: boolean; // 見出しの有無
  variant?: "card" | "bare"; // 外枠あり/なし
};

export const ActionHistoryList = ({
  showTitle = true,
  variant = "card",
}: Props) => {
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { idToken } = useAuth();

  useEffect(() => {
    if (!idToken) {
      setHistory([]);
      setLoading(false);
      return;
    }
    let aborted = false;
    setLoading(true);

    axios
      .get("/api/user/actions/history?limit=10", {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => {
        if (aborted) return;
        const list = normalizeHistory(res?.data);
        setHistory(list);
      })
      .catch((err) => {
        if (aborted) return;
        if (process.env.NODE_ENV !== "production") {
          // 本番では出さない
          // eslint-disable-next-line no-console
          console.error(
            "[ActionHistoryList] fetch failed:",
            err?.response?.data ?? err
          );
        }
        setHistory([]);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });

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
        {/* ローディング表示（任意） */}
        {loading && <li className="px-4 py-3 text-gray-400">読み込み中...</li>}

        {/* 履歴が空の場合 */}
        {!loading && history.length === 0 && (
          <li className="px-4 py-3 text-gray-400">
            アクション履歴がありません
          </li>
        )}

        {/* 履歴リスト */}
        {history.map((item) => {
          // アイコン付き種別
          const kind =
            item.type === "review"
              ? "⭐ レビュー"
              : item.type === "comment"
              ? "💬 コメント"
              : "📖 読了";

          const key = `${item.type}-${item.date}-${item.articleId}`;

          return (
            <li key={key} className="px-4 py-3">
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
                      {item.articleTitle ?? "(タイトルなし)"}
                    </Link>
                  </div>
                </div>

                {/* 時刻は折り返し禁止で右端キープ */}
                <span className="text-gray-500 ml-2 whitespace-nowrap">
                  {dayjs(item.date).isValid()
                    ? dayjs(item.date).format("M/D HH:mm")
                    : item.date}
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
