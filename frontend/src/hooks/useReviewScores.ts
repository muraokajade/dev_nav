import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuthContext";

type Score = {
  id: number;
  userId: number;
  score: number;
};

export const useReviewScores = (articleId: number, myUserId: number) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [myScore, setMyScore] = useState<number | null>(null); //自分の投稿
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { idToken } = useAuth();

  // 全体分

  const fetchAllScores = useCallback(async () => {
    try {
      const res = await axios.get(
        `/api/review-scores/all?articleId=${articleId}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      setScores(res.data);
    } catch (e) {
      setScores([]);
      setLoading(false);
    }
  }, [articleId, idToken]);

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
          `/api/review-scores?articleId=${articleId}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setMyScore(res.data.score ?? null);
      } catch (e) {
        setMyScore(null);
      } finally {
        setLoading(false);
      }
    };
    fetchScore();
  }, [articleId, idToken]);

  // 送信系（myScoreがあればPUT、なければPOST）
  const submitScore = async (score: number) => {
    setLoading(true);
    setError(null);

    try {
      //まだ自分のスコアがない時
      if (myScore === null) {
        await axios.post(
          "/api/review-scores",
          { articleId, score },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
      } else {
        await axios.put(
          "/api/review-scores",
          { articleId, score },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
      }
      await fetchAllScores();
    } catch (e) {
      setError("スコア取得に失敗しました。");
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
