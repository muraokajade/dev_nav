import { useEffect, useState, useCallback, useRef } from "react";
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
  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async () => {
    if (!idToken) {
      setReadIds([]);
      setError(null);
      setLoading(false);
      return;
    }
    // 先行リクエストを中断（レース対策）
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);
    try {
      const res = await apiHelper.get(`/api/${target}/read/all`, {
        headers: { Authorization: `Bearer ${idToken}` },
        signal: ac.signal as any, // axiosはAbortController対応
      });
      setReadIds(Array.isArray(res.data) ? (res.data as number[]) : []);
    } catch (e: any) {
      if (e?.name === "CanceledError") return; // 中断は無視
      // 401 は未ログイン等として無視
      const status = e?.response?.status;
      if (status === 401) {
        setReadIds([]);
        setError(null);
      } else {
        setError(e?.message ?? "failed to fetch read statuses");
        setReadIds([]);
      }
    } finally {
      setLoading(false);
    }
  }, [idToken, target]);

  useEffect(() => {
    fetchAll();
    return () => abortRef.current?.abort();
  }, [fetchAll]);

  const isRead = useCallback((id: number) => readIds.includes(id), [readIds]);

  return { readIds, isRead, refresh: fetchAll, loading, error };
};

/**
 * 既読登録（対象ごとのAPI差異に両対応）
 * 1) /api/{target}/{id}/read に POST
 * 2) ダメなら /api/{target}/read (bodyに {<key>Id: id})
 */
export const useMarkRead = (target: ReadTarget) => {
  const { idToken } = useAuth();

  const markRead = useCallback(
    async (id: number) => {
      if (!idToken) return;

      // 対象ごとのボディキー
      const bodyKey =
        target === ReadTarget.Articles
          ? "articleId"
          : target === ReadTarget.Syntaxes
          ? "syntaxId"
          : "procedureId";

      // まず：/{id}/read で試す
      try {
        await apiHelper.post(
          `/api/${target}/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        return;
      } catch (e: any) {
        // 404/405/400 などはフォールバックへ
        const status = e?.response?.status;
        if (status && ![400, 401, 403, 404, 405].includes(status)) {
          // 予期しないエラーは再throw
          throw e;
        }
      }

      // フォールバック：/read にボディで投げる
      await apiHelper.post(
        `/api/${target}/read`,
        { [bodyKey]: id },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
    },
    [idToken, target]
  );

  return { markRead };
};
