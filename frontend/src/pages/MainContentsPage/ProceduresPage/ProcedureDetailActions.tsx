// ==========================
// src/pages/procedures/ProcedureDetailActions.tsx
// ==========================
import React, { useState } from "react";
import { ThreadComments } from "../../../components/ThreadComments";

type Props = {
  procedureId: number;
  myUserId?: number | null;
  myEmail?: string | null; // ★ 追加
  authHeader?: Record<string, string> | undefined; // ★ 追加
};

export const ProcedureDetailActions: React.FC<Props> = ({
  procedureId,
  myUserId = null,
  myEmail = null,
  authHeader,
}) => {
  const [activeTab, setActiveTab] = useState<"comment" | "qa" | null>(null);

  const tabs = [
    { key: "comment", label: "コメント" },
    { key: "qa", label: "Q&A" },
  ] as const;

  const isLoggedIn = !!(myEmail || myUserId != null);

  return (
    <div className="max-w-4xl w-full mx-auto px-4">
      {/* タブ */}
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
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* パネル */}
      {activeTab && (
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg mb-6">
          {activeTab === "comment" && (
            <ThreadComments
              type="PROCEDURE"
              refId={procedureId}
              category="comment"
              readOnly={!isLoggedIn}
              hideComposer={!isLoggedIn}
              myUserId={myUserId}
              myEmail={myEmail} // ★ 渡す
              authHeader={authHeader} // ★ 渡す
            />
          )}
          {activeTab === "qa" && (
            <ThreadComments
              type="PROCEDURE"
              refId={procedureId}
              category="qa"
              readOnly={!isLoggedIn}
              hideComposer={!isLoggedIn}
              myUserId={myUserId}
              myEmail={myEmail} // ★ 渡す
              authHeader={authHeader} // ★ 渡す
            />
          )}
        </div>
      )}
    </div>
  );
};
