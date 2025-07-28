import React, { useState } from "react";
import { ReviewScore } from "../../../utils/ReviewScore"; 
import { ReviewComments } from "../../../utils/ReviewComments"; 
import { Messages } from "../../../utils/Messages"; 

export const SyntaxDetailActions: React.FC<{
  articleId: number;
  myUserId: number;
}> = ({ articleId, myUserId }) => {
  // タブの状態
  const [activeTab, setActiveTab] = useState<"review" | "comment" | "message" | null>(null);

  // タブ定義
  const tabs = [
    { key: "review", label: "レビュー" },
    { key: "comment", label: "コメント" },
    { key: "message", label: "Q&A" },
  ] as const;

  // 全体を一つのカードに
  return (
    <div className="max-w-4xl w-full mx-auto px-4 mt-8">
      {/* タブボタン */}
      <div className="flex gap-3 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key === activeTab ? null : tab.key)}
            className={`px-4 py-2 rounded-xl font-bold shadow transition
              ${activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 開閉式エリア */}
      {activeTab && (
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg animate-fade-in mb-6">
          {activeTab === "review" && <ReviewScore articleId={articleId} myUserId={myUserId} />}
          {activeTab === "comment" && <ReviewComments articleId={articleId} myUserId={myUserId} />}
          {activeTab === "message" && <Messages articleId={articleId} myUserId={myUserId} />}
        </div>
      )}
    </div>
  );
};
