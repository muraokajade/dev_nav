import { useEffect, useState, useCallback } from "react";
import { apiHelper } from "../libs/apiHelper";
import { useAuth } from "../context/useAuthContext";

export enum ReadTarget {
  Articles = "articles",
  Syntaxes = "syntaxes",
  Procedures = "procedures",
}

export type UseReadStatusResult = {
  readIds: number[];
  isRead: (id: number) => boolean;
  refresh: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

/**
 * 共通既読取得フック
 * GET /api/{target}/read/all で ID 配列を取得して保管
 */
export const useReadStatus = (target: ReadTarget): UseReadStatusResult => {
  const { idToken } = useAuth();
  const [readIds, setReadIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!idToken) {
      setReadIds([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiHelper.get(`/api/${target}/read/all`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setReadIds(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.message ?? "failed to fetch read statuses");
      setReadIds([]);
    } finally {
      setLoading(false);
    }
  }, [idToken, target]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const isRead = useCallback((id: number) => readIds.includes(id), [readIds]);

  return { readIds, isRead, refresh: fetchAll, loading, error };
};

// 任意：既読登録用（詳細ページ遷移時などで利用）
export const useMarkRead = (target: ReadTarget) => {
  const { idToken } = useAuth();
  const markRead = useCallback(
    async (id: number) => {
      if (!idToken) return;
      await apiHelper.post(
        `/api/${target}/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
    },
    [idToken, target]
  );
  return { markRead };
};
