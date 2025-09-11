// src/types/user.ts など UserStats を定義している場所
export interface UserStats {
  // 既存
  articlesRead: number;
  comments: number; // ← thread_messages の件数をマッピング
  likes: number;
  reviews: number;
  likedArticles: Array<any>;

  // ★ 追加
  level: number; // Lv. 表示用
  expPercent: number; // 0–100
}
