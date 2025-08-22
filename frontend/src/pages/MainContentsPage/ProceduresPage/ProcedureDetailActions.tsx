import React, { useState } from "react";
import { ReviewScore } from "../../../utils/ReviewScore";
import { MessagesNew } from "../../../utils/MessagesNew";
import { ThreadComments } from "../../../components/ThreadComments";
import { Link } from "react-router-dom";

export const ProcedureDetailActions: React.FC<{
  procedureId: number;
  myUserId?: number | null; // ← null許容に
}> = ({ procedureId, myUserId }) => {
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
              className={`px-4 py-2 rounded-xl font-bold shadow transition ${
                isActive ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* コンテンツ */}
      {activeTab && (
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg animate-fade-in mb-6">
          {/* レビュー：GETは常に表示、投稿UIはログイン時だけ */}
          {activeTab === "review" && (
            <div>
              <ReviewScore
                targetType="PROCEDURE"
                refId={procedureId}
                myUserId={canPost ? myUserId! : null}
                readonly={!canPost}
              />
              {!canPost && (
                <LoginInline text="レビューの投稿・自分のスコア編集にはログインが必要です。" />
              )}
            </div>
          )}

          {/* コメント：一覧は常に、投稿フォームは未ログイン時は非表示（CTAはThreadCommentsが出す想定ならここは表示しない） */}
          {activeTab === "comment" && (
            <ThreadComments
              type="procedure"
              refId={procedureId}
              category="comment"
              readOnly={!canPost}
              hideComposer={!canPost}
            />
          )}

          {/* Q&A：一覧は常に、フォームはログイン時のみ（CTAはThreadComments側に統一） */}
          {activeTab === "message" && (
            <div className="space-y-4">
              <ThreadComments
                type="procedure"
                refId={procedureId}
                category="qa"
                readOnly={true}
                hideComposer={true}
              />
              {canPost && (
                <MessagesNew
                  targetType="PROCEDURE"
                  refId={procedureId}
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
