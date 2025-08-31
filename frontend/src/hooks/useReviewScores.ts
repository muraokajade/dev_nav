import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { apiHelper } from "../libs/apiHelper";
import { useAuth } from "../context/useAuthContext";

type Score = {
  id: number;
  userId: number;
  score: number;
};

type TargetType = "ARTICLE" | "SYNTAX" | "PROCEDURE";

export const useReviewScores = (
  targetType: TargetType,
  refId: number,
  myUserId?: number
) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { idToken } = useAuth();

  // レース対策
  const abortAllRef = useRef<AbortController | null>(null);
  const abortMineRef = useRef<AbortController | null>(null);

  // 全体分
  const fetchAllScores = useCallback(async () => {
    // - try {
    // -   const res = await apiHelper.get(
    // -     `/api/review-scores/${targetType.toLowerCase()}/${refId}`
    // -   );
    // -   setScores(res.data);
    // - } catch {
    // -   setScores([]);
    // -   setLoading(false);
    // - }
    abortAllRef.current?.abort();
    const ac = new AbortController();
    abortAllRef.current = ac;

    try {
      const res = await apiHelper.get(
        `/api/review-scores/${targetType.toLowerCase()}/${refId}`,
        { signal: ac.signal as any }
      );
      setScores(Array.isArray(res.data) ? (res.data as Score[]) : []);
    } catch (e: any) {
      if (e?.name === "CanceledError") return;
      setScores([]);
    }
  }, [targetType, refId]);

  // 初期＆切替時にまとめて取得
  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      await fetchAllScores();
      // 自分の分（ログイン時）
      if (idToken) {
        abortMineRef.current?.abort();
        const ac = new AbortController();
        abortMineRef.current = ac;
        try {
          const res = await apiHelper.get(
            `/api/review-scores/my/${targetType.toLowerCase()}/${refId}`,
            {
              headers: { Authorization: `Bearer ${idToken}` },
              signal: ac.signal as any,
            }
          );
          setMyScore(res.data?.score ?? null);
        } catch (e: any) {
          if (e?.name === "CanceledError") return;
          setMyScore(null);
          // 401 は未ログイン等として無視
          if (e?.response?.status && e.response.status !== 401) {
            setError("スコア取得に失敗しました。");
          }
        }
      } else {
        setMyScore(null);
      }
      setLoading(false);
    })();

    return () => {
      abortAllRef.current?.abort();
      abortMineRef.current?.abort();
    };
    // - }, [idToken, fetchAllScores]);
  }, [idToken, fetchAllScores]);

  // 送信系
  const submitScore = useCallback(
    async (score: number) => {
      if (!idToken) {
        setError("ログインが必要です。");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const payload = { score };
        if (myScore === null) {
          await apiHelper.post(
            `/api/review-scores/${targetType.toLowerCase()}/${refId}`,
            payload,
            { headers: { Authorization: `Bearer ${idToken}` } }
          );
        } else {
          await apiHelper.put(
            `/api/review-scores/${targetType.toLowerCase()}/${refId}`,
            payload,
            { headers: { Authorization: `Bearer ${idToken}` } }
          );
        }
        await fetchAllScores(); // 最新一覧反映
        setMyScore(score); // 自分のスコアも即時反映
      } catch {
        setError("スコア送信に失敗しました。");
      } finally {
        setLoading(false);
      }
    },
    [idToken, myScore, refId, targetType, fetchAllScores]
  );

  // 平均値（メモ化）
  // - const average = scores.length > 0 ? Math.round((scores.reduce((sum, cur) => sum + cur.score, 0) / scores.length) * 100) / 100 : null;
  const average = useMemo(() => {
    if (!scores.length) return null;
    const sum = scores.reduce((s, cur) => s + cur.score, 0);
    return Math.round((sum / scores.length) * 100) / 100;
  }, [scores]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchAllScores();
    setLoading(false);
  }, [fetchAllScores]);

  return { scores, myScore, loading, submitScore, average, error, refresh };
};
