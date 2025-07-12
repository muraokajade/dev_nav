import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuthContext"; 

type Score = {
  id: number;
  userId: number;
  score: number;
};

export const useReviewScores = (articleId: number, myUserId: number) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { idToken } = useAuth();

  // 全スコア取得
  const fetchScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/review-scores?articleId=${articleId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setScores(res.data ?? []);
    } catch (e) {
      console.error("失敗", e);
      setError("スコア取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [articleId]);
  // 自分のスコア
  const myScoreObj =
    scores.find((s) => Number(s.userId) === Number(myUserId)) ?? null;
  const myScore = myScoreObj?.score ?? null;
  const myScoreId = myScoreObj?.id ?? null;




  const submitScore = async (score: number) => {
    setLoading(true);
    setError(null);

    try {
      if (myScoreId == null) {

        await axios.post(
          "/api/review-scores",
          { articleId, score }, // ←ココがbody
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
      } else {
        await axios.put(
          `/api/review-scores/${myScoreId}`,
          { articleId,score },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
      }
      await fetchScores();
    } catch (e) {
      setError("スコア送信に失敗しました");
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
