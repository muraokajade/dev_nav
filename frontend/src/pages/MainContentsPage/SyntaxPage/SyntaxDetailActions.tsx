// src/pages/syntax/detail/SyntaxDetailActions.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ReviewScore } from "../../../utils/ReviewScore";
import { MessagesNew } from "../../../utils/MessagesNew";
import { ThreadComments } from "../../../components/ThreadComments";

export const SyntaxDetailActions: React.FC<{
  syntaxId: number;
  myUserId?: number | null;
}> = ({ syntaxId, myUserId }) => {
  const canPost = myUserId != null;

  // 必要なら "comment" を初期タブに
  const [activeTab, setActiveTab] = useState<
    "review" | "comment" | "message" | null
  >(null);

  const tabs = [
    { key: "review", label: "レビュー" },
    { key: "comment", label: "コメント" },
    { key: "message", label: "Q&A" },
  ] as const;

  const LoginInline: React.FC<{ text: string }> = ({ text }) => (
    <div className="mt-4 text-zinc-300">
      <p className="mb-2">{text}</p>
      <Link
        to="/login"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded"
      >
        ログイン / 新規登録へ
      </Link>
    </div>
  );

  return (
    // ★ 親は「幅を持たない」。ページ側の max-w-* に従うため w-full のみ。
    <div className="w-full">
      {/* タブボタン */}
      <div className="flex gap-3 mb-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(isActive ? null : tab.key)}
              className={`px-4 py-2 rounded-xl font-bold shadow transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 開閉式エリア（パネルはページ幅内で w-full） */}
      {activeTab && (
        <div className="not-prose w-full bg-zinc-900 p-6 rounded-2xl shadow-lg animate-fade-in mb-6">
          {/* レビュー */}
          {activeTab === "review" && (
            <div>
              <ReviewScore
                targetType="SYNTAX"
                refId={syntaxId}
                myUserId={canPost ? myUserId! : null}
                readonly={!canPost}
              />
              {!canPost && (
                <LoginInline text="レビューの投稿・編集にはログインが必要です。" />
              )}
            </div>
          )}

          {/* コメント（一覧は常に、投稿はログイン時のみ） */}
          {activeTab === "comment" && (
            <ThreadComments
              type="syntax"
              refId={syntaxId}
              category="comment"
              readOnly={!canPost}
              hideComposer={!canPost}
            />
          )}

          {/* Q&A（一覧＋新規投稿） */}
          {activeTab === "message" && (
            <div className="space-y-4">
              <ThreadComments
                type="syntax"
                refId={syntaxId}
                category="qa"
                readOnly={false}
                hideComposer={true} // 投稿フォームは MessagesNew に一本化
              />
              {canPost && (
                <MessagesNew
                  targetType="SYNTAX"
                  refId={syntaxId}
                  myUserId={myUserId!}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
