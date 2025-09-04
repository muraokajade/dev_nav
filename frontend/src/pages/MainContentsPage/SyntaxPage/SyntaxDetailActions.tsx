// src/pages/MainContentsPage/SyntaxPage/SyntaxDetailActions.tsx
import React from "react";

type Props = {
  syntaxId: number;
  myUserId?: number | null;
  isRead: boolean;
  onToggleRead: () => void;
};

export const SyntaxDetailActions: React.FC<Props> = ({
  // syntaxId, // いまは使っていないが将来用に保持
  // myUserId,
  isRead,
  onToggleRead,
}) => {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onToggleRead}
          className={`px-4 py-2 rounded text-white font-bold shadow transition ${
            isRead ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isRead ? "読了済み（解除）" : "この記事を読了する"}
        </button>
        {/* 他の操作ボタンを増やす場合はここに追加（共有など）。編集UIは出さない */}
      </div>
    </div>
  );
};
