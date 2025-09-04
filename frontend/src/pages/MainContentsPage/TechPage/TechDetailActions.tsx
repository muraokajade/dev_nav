// src/pages/articles/TechDetailActions.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ReviewScore } from "../../../utils/ReviewScore";
import { ReviewComments } from "../../../utils/ReviewComments";
import { MessagesNew } from "../../../utils/MessagesNew";
// import { ThreadComments } from "../../../components/ThreadComments"; // ← Q&A では使わない

export const TechDetailActions: React.FC<{
  articleId: number;
  myUserId?: number | null;
  myEmail?: string | null;
  idToken?: string | null;
  authHeader?: Record<string, string>;
}> = ({ articleId, myUserId, idToken }) => {
  const isLoggedIn = !!idToken;
  const [activeTab, setActiveTab] = useState<
    "review" | "comment" | "qa" | null
  >(null);

  const tabs = [
    { key: "review", label: "レビュー" },
    { key: "comment", label: "コメント" },
    { key: "qa", label: "Q&A" },
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
    <div className="max-w-4xl w-full mx-auto px-4 mt-8">
      <div className="flex gap-3 mb-4">
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(isActive ? null : t.key)}
              className={`px-4 py-2 rounded-xl font-bold shadow transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab && (
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg mb-6">
          {activeTab === "review" && (
            <>
              <ReviewScore
                targetType="ARTICLE"
                refId={articleId}
                myUserId={isLoggedIn ? myUserId ?? null : null}
                readonly={!isLoggedIn}
              />
              {!isLoggedIn && (
                <LoginInline text="レビューの投稿・自分のスコア編集にはログインが必要です。" />
              )}
            </>
          )}

          {activeTab === "comment" && (
            <>
              <ReviewComments
                articleId={articleId}
                myUserId={myUserId ?? null}
              />
              {!isLoggedIn && (
                <LoginInline text="コメントの投稿にはログインが必要です。" />
              )}
            </>
          )}

          {activeTab === "qa" && (
            <>
              <MessagesNew targetType="ARTICLE" refId={articleId} />
              {!isLoggedIn && (
                <LoginInline text="Q&A の投稿にはログインが必要です。" />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
