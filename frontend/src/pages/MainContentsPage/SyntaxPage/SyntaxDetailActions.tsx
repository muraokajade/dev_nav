import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ReviewScore } from "../../../utils/ReviewScore";
import { MessagesNew } from "../../../utils/MessagesNew";
import { ThreadComments } from "../../../components/ThreadComments";
import { useAuth } from "../../../context/useAuthContext";

export const SyntaxDetailActions: React.FC<{
  syntaxId: number;
  myUserId?: number | null;
}> = ({ syntaxId, myUserId }) => {
  // 🔒 投稿可否は myUserId のみで判定（idTokenに引っ張られない）
  const canPost = myUserId != null;

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
          {/* レビュー：常にGET、投稿UIはcanPostのみ */}
          {activeTab === "review" && (
            <div>
              <ReviewScore
                targetType="SYNTAX"
                refId={syntaxId}
                myUserId={canPost ? myUserId! : null} // 型がnumber必須なら 0 にフォールバック
                readonly={!canPost} // ← props名はReviewScoreに合わせて
              />
              {!canPost && (
                <LoginInline text="レビューの投稿・編集にはログインが必要です。" />
              )}
            </div>
          )}

          {/* コメント：一覧は常に、投稿UIはreadOnlyで封じる（ThreadComments側で対応） */}
          {activeTab === "comment" && (
            <ThreadComments
              type="syntax"
              refId={syntaxId}
              category="comment"
              readOnly={!canPost} // ← なければ下の「備考」を参照
              hideComposer={!canPost} // ← どちらか一方でもOK
            />
          )}

          {/* Q&A：一覧は常に、フォームはcanPostのときだけ */}
          {activeTab === "message" && (
            <div className="space-y-4">
              <ThreadComments
                type="syntax" // ← 画面に合わせて article/procedure/syntax
                refId={syntaxId} // ← 該当ID
                category="qa"
                readOnly={false} // ← 一覧は常に閲覧OK
                hideComposer={true} // ← ここを常に true（重要）
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
