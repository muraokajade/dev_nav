// src/constants/user.ts など
import type { UserStats } from "../types/UserStats";

export const ZERO: UserStats = {
  articlesRead: 0,
  comments: 0,
  likes: 0,
  reviews: 0,
  likedArticles: [],
  level: 1,
  expPercent: 0,
};
