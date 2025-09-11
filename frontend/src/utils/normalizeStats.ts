// src/utils/normalizeStats.ts （ファイル名はあなたの構成に合わせて）
import type { UserStats } from "../types/UserStats";

export const normalizeStats = (raw: any): UserStats => {
  const toNum = (v: any, def = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };
  const clamp01 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  return {
    articlesRead: toNum(raw?.articlesRead, 0),
    comments: toNum(raw?.comments ?? raw?.threadMessages, 0), // 互換
    likes: toNum(raw?.likes, 0),
    reviews: toNum(raw?.reviews, 0),
    likedArticles: Array.isArray(raw?.likedArticles) ? raw.likedArticles : [],

    // ★ 追加（バックエンドがそのまま返してくれている想定）
    level: toNum(raw?.level, 1),
    expPercent: clamp01(toNum(raw?.expPercent, 0)),
  };
};
