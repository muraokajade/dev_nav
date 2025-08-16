import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  myUserId: number
) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { idToken } = useAuth();

  // 全体分
  const fetchAllScores = useCallback(async () => {
    try {
      const res = await axios.get(
        `/api/review-scores/${targetType.toLowerCase()}/${refId}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setScores(res.data);
    } catch {
      setScores([]);
      setLoading(false);
    }
  }, [targetType, refId, idToken]);

  useEffect(() => {
    (async () => {
      await fetchAllScores();
    })();
  }, [idToken, fetchAllScores]);

  // 自分の分
  useEffect(() => {
    if (!idToken) return;
    const fetchScore = async () => {
      try {
        const res = await axios.get(
          `/api/review-scores/my/${targetType.toLowerCase()}/${refId}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setMyScore(res.data.score ?? null);
      } catch {
        setMyScore(null);
      } finally {
        setLoading(false);
      }
    };
    fetchScore();
  }, [targetType, refId, idToken]);

  // 送信系
  const submitScore = async (score: number) => {
    setLoading(true);
    setError(null);

    try {
      const payload = { score }; // targetType, refId は URL に含まれるから不要でもOK

      if (myScore === null) {
        await axios.post(
          `/api/review-scores/${targetType.toLowerCase()}/${refId}`,
          payload,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
      } else {
        await axios.put(
          `/api/review-scores/${targetType.toLowerCase()}/${refId}`,
          payload,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
      }

      await fetchAllScores();
    } catch {
      setError("スコア送信に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // 平均値
  const average =
    scores.length > 0
      ? Math.round(
          (scores.reduce((sum, cur) => sum + cur.score, 0) / scores.length) *
            100
        ) / 100
      : null;

  return { scores, myScore, loading, submitScore, average, error };
};
