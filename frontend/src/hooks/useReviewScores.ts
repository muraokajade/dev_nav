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
  const [myScore, setMyScore] = useState<number | null>(null); //自分の投稿
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { idToken } = useAuth();

  // 全体分
  useEffect(() => {
    axios
      .get(`/api/review-scores/all?articleId=${articleId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => setScores(res.data ?? []))
      .catch(() => setScores([]));
    setLoading(false);
  }, [articleId]);

  // 自分の分
  useEffect(() => {
    if (!idToken) return;
    axios
      .get(`/api/review-scores?articleId=${articleId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => {
        console.log("myScore取得APIレスポンス", res);
        setMyScore(res.data?.score ?? null);
      })
      .catch(() => setMyScore(null));
    setLoading(false);
  }, [articleId, idToken]);
  // 自分のスコア

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
      // ★送信後に再取得することで、myScoreが最新化され、次回はPUTに切り替わる
      const res = await axios.get(`/api/review-scores?articleId=${articleId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      console.log(res.data);
      setMyScore(res.data?.score ?? null);
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
