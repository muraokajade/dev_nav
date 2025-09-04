// src/components/ReviewComments.tsx
import React from "react";
import { ThreadComments } from "../components/ThreadComments";

/**
 * 従来の「記事コメント」用コンポーネント。
 * 内部でスレッドAPI（type=article, category=comment）に委譲します。
 * myUserId はもう使いません（サーバ側でメール一致チェックするため互換のためだけに残しています）。
 */
export const ReviewComments: React.FC<{
  articleId?: number;
  myUserId?: unknown; // 互換のため残すが未使用
}> = ({ articleId }) => {
  if (articleId == null) return null; // 記事IDが無ければ何も表示しない
  return <ThreadComments type="ARTICLE" refId={articleId} category="comment" />;
};
