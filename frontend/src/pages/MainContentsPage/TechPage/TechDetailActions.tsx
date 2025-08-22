// TechDetailActions.tsx — 全差し替え版
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ReviewScore } from "../../../utils/ReviewScore";
import { ReviewComments } from "../../../utils/ReviewComments";
import { MessagesNew } from "../../../utils/MessagesNew";
import { ThreadComments } from "../../../components/ThreadComments";

export const TechDetailActions: React.FC<{
  articleId: number;
  myUserId?: number | null;
}> = ({ articleId, myUserId }) => {
  // 投稿可否は myUserId の有無だけで判定（idTokenには依存しない）
  const canPost = myUserId != null;

  const [activeTab, setActiveTab] =
    useState<"review" | "comment" | "message" | null>(null);

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
    <div className="max-w-4xl w-full mx-auto px-4 mt-8">
      {/* タブボタン */}
      <div className="flex gap-3 mb-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(isActive ? null : tab.key)}
              className={`px-4 py-2 rounded-xl font-bold shadow transition
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 開閉式エリア */}
      {activeTab && (
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg animate-fade-in mb-6">
          {/* レビュー：GETは常に、投稿UIはログイン時だけ */}
          {activeTab === "review" && (
            <div>
              <ReviewScore
                targetType="ARTICLE"
                refId={articleId}
                myUserId={canPost ? myUserId! : null}
                readonly={!canPost}
              />
              {!canPost && (
                <LoginInline text="レビューの投稿・自分のスコア編集にはログインが必要です。" />
              )}
            </div>
          )}

          {/* コメント：一覧は常に、投稿可否は子で myUserId を見て制御（未ログインならフォーム非表示想定） */}
          {activeTab === "comment" && (
            <ReviewComments articleId={articleId} myUserId={myUserId ?? null} />
          )}

          {/* Q&A：一覧は常に、投稿フォームはログイン時のみ。
              ログイン導線は ThreadComments 側に任せる（重複防止） */}
          {activeTab === "message" && (
            <div className="space-y-4">
              <ThreadComments
                type="article"
                refId={articleId}
                category="qa"
                readOnly={true}
                hideComposer={true}
              />
              {canPost && (
                <MessagesNew
                  targetType="ARTICLE"
                  refId={articleId}
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
