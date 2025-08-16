import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageResponse } from "../../../models/MessageResponse";

/**
 * TargetType enum(ARTICLE/SYNTAX/PROCEDURE) → ルート名
 */
const targetEnumToRoute = (t?: string): "articles" | "syntaxes" | "procedures" | undefined => {
  if (!t) return undefined;
  switch (t) {
    case "ARTICLE":
      return "articles";
    case "SYNTAX":
      return "syntaxes";
    case "PROCEDURE":
      return "procedures";
    default:
      // 既に "articles" 等が来るケースにも一応対応
      if (t.toLowerCase() === "articles") return "articles";
      if (t.toLowerCase() === "syntaxes") return "syntaxes";
      if (t.toLowerCase() === "procedures") return "procedures";
      return undefined;
  }
};

/**
 * MessageResponse から target & id & title/slug を引き出す（DTO優先・旧プロパティにフォールバック）
 */
function resolveLinkInfo(msg: any): {
  route?: "articles" | "syntaxes" | "procedures";
  id?: number;
  title?: string;
  slug?: string;
} {
  // 1) DTO拡張（推奨）: targetType/ contentId / contentTitle / contentSlug
  const routeFromEnum = targetEnumToRoute(msg.targetType);
  const idFromDto: number | undefined = msg.contentId ?? undefined;
  const titleFromDto: string | undefined = msg.contentTitle ?? undefined;
  const slugFromDto: string | undefined = msg.contentSlug ?? undefined;

  if (routeFromEnum && idFromDto) {
    return { route: routeFromEnum, id: idFromDto, title: titleFromDto, slug: slugFromDto };
  }

  // 2) 旧形式: target + contentId
  if (msg.target && msg.contentId) {
    const t = targetEnumToRoute(String(msg.target).toUpperCase()) ?? msg.target;
    const route =
      t === "articles" || t === "syntaxes" || t === "procedures" ? (t as any) : undefined;
    return {
      route,
      id: msg.contentId,
      title:
        msg.contentTitle ??
        msg.articleTitle ??
        msg.syntaxTitle ??
        msg.procedureTitle,
      slug:
        msg.contentSlug ??
        msg.articleSlug ??
        msg.syntaxSlug ??
        msg.procedureSlug,
    };
  }

  // 3) 専用キーにフォールバック
  if (msg.articleId) {
    return {
      route: "articles",
      id: msg.articleId,
      title: msg.articleTitle,
      slug: msg.articleSlug,
    };
  }
  if (msg.syntaxId) {
    return {
      route: "syntaxes",
      id: msg.syntaxId,
      title: msg.syntaxTitle,
      slug: msg.syntaxSlug,
    };
  }
  if (msg.procedureId) {
    return {
      route: "procedures",
      id: msg.procedureId,
      title: msg.procedureTitle,
      slug: msg.procedureSlug,
    };
  }

  return {};
}

type Props = {
  message: MessageResponse;
  onAnswer: (answer: string) => void; // 回答送信時のコールバック
  loading?: boolean;
};

export const AdminQuestionPage: React.FC<Props> = ({
  message,
  onAnswer,
  loading,
}) => {
  const [answer, setAnswer] = useState(message.response || "");
  const [editMode, setEditMode] = useState(false);

  // リンク情報を解決（タイトル/スラッグが無ければIDリンクのみ）
  const { route, id, title, slug } = resolveLinkInfo(message as any);
  const linkPath =
    route && id ? `/${route}/${id}${slug ? `-${slug}` : ""}` : undefined;
  const linkedTitle = title || "関連コンテンツ";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onAnswer(answer);
      setEditMode(false);
      setAnswer("");
    }
  };

  return (
    <div className="bg-zinc-800 rounded-xl p-6 mb-6 shadow">
      {/* ユーザー・ラベル */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-blue-400 font-semibold">
          {message.displayName}
        </span>
        <span className="ml-2 text-xs text-gray-400">{message.createdAt}</span>
        <span
          className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${
            message.closed
              ? "bg-green-700 text-white"
              : "bg-yellow-600 text-white"
          }`}
        >
          {message.closed ? "対応済み" : "未対応"}
        </span>
      </div>

      {/* 関連タイトル＋リンク（ある場合だけ表示） */}
      {linkPath && (
        <div className="mb-2">
          <Link
            to={linkPath}
            className="text-sky-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 {linkedTitle} を開く
          </Link>
        </div>
      )}

      {/* 質問内容 */}
      <div className="text-lg font-bold mb-2">{message.title}</div>
      <div className="mb-4">{message.question}</div>

      {/* 回答欄 */}
      {!message.closed || editMode ? (
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full bg-zinc-900 resize-none border border-zinc-700 rounded p-2 mb-2 text-white"
            rows={3}
            placeholder="ここに回答を入力"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading}
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className={`px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {message.closed ? "編集を保存" : "回答を送信"}
            </button>
            {message.closed && (
              <button
                type="button"
                className="ml-2 px-3 py-1 rounded bg-zinc-700 text-white text-xs"
                onClick={() => setEditMode(false)}
              >
                キャンセル
              </button>
            )}
          </div>
        </form>
      ) : (
        <>
          {message.response && (
            <div className="mt-3 p-2 bg-green-900/50 rounded text-green-200">
              <strong>A.</strong> {message.response}
              {/* 編集ボタンは対応済みだけ表示 */}
              <button
                type="button"
                className="ml-4 px-2 py-1 bg-blue-700 text-white text-xs rounded"
                onClick={() => {
                  setAnswer(message.response || "");
                  setEditMode(true);
                }}
              >
                編集
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
