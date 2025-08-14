export type ThreadMessage = {
  id: number;
  threadId: number;
  userId: string;         // ← email文字列
  body: string;
  createdAt: string;
  updatedAt?: string | null;
};

export type ThreadWithMessages = {
  thread: {
    id: number | null;    // GETで未作成の場合はnullの可能性を許容（将来の拡張用）
    type: 'ARTICLE' | 'SYNTAX' | 'PROCEDURE';
    refId: number;
    category: 'COMMENT' | 'REVIEW' | 'QA';
  };
  messages: ThreadMessage[];
};
