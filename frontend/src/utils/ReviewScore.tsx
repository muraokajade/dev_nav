import React, { useState, useEffect } from "react";
import { useReviewScores } from "../hooks/useReviewScores";

type StarRatingProps = {
  value: number; // 0〜5, 0.5刻み
  size?: number; // アイコンサイズ
  onChange?: (v: number) => void; // クリック時
  disabled?: boolean;
};
export const StarRatingSVG: React.FC<StarRatingProps> = ({
  value,
  size = 28,
  onChange,
  disabled,
}) => {
  // 5段階、0.5単位で評価
  const fullStars = Math.floor(value);
  const halfStar = value % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  // クリック対応
  const handleClick = (idx: number, isHalf: boolean) => {
    if (disabled || !onChange) return;
    onChange(isHalf ? idx + 0.5 : idx + 1);
  };

  return (
    <div className="inline-flex items-center select-none">
      {[...Array(5)].map((_, idx) => {
        // 星ごとに右半分/左半分エリアをdivでラップする
        const isFull = idx < fullStars;
        const isHalf = idx === fullStars && halfStar === 1;

        return (
          <span key={idx} className="relative">
            {/* 半分クリック用：左側（0.5） */}
            <span
              className={`absolute inset-y-0 left-0 w-1/2 z-10 ${
                onChange && !disabled ? "cursor-pointer" : ""
              }`}
              style={{ display: "inline-block", height: size, width: size / 2 }}
              onClick={() => handleClick(idx, true)}
            />
            {/* 右側クリック用（1.0） */}
            <span
              className={`absolute inset-y-0 right-0 w-1/2 z-10 ${
                onChange && !disabled ? "cursor-pointer" : ""
              }`}
              style={{ display: "inline-block", height: size, width: size / 2 }}
              onClick={() => handleClick(idx, false)}
            />
            {/* 星のSVG表示 */}
            {isFull ? (
              // ★
              <svg
                width={size}
                height={size}
                fill="currentColor"
                style={{ color: "gold" }}
                viewBox="0 0 16 16"
              >
                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
              </svg>
            ) : isHalf ? (
              // ☆半分
              <svg
                width={size}
                height={size}
                fill="currentColor"
                style={{ color: "gold" }}
                viewBox="0 0 16 16"
              >
                <path d="M5.354 5.119 7.538.792A.52.52 0 0 1 8 .5c.183 0 .366.097.465.292l2.184 4.327 4.898.696A.54.54 0 0 1 16 6.32a.55.55 0 0 1-.17.445l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256a.5.5 0 0 1-.146.05c-.342.06-.668-.254-.6-.642l.83-4.73L.173 6.765a.55.55 0 0 1-.172-.403.6.6 0 0 1 .085-.302.51.51 0 0 1 .37-.245zM8 12.027a.5.5 0 0 1 .232.056l3.686 1.894-.694-3.957a.56.56 0 0 1 .162-.505l2.907-2.77-4.052-.576a.53.53 0 0 1-.393-.288L8.001 2.223 8 2.226z" />
              </svg>
            ) : (
              // ☆
              <svg
                width={size}
                height={size}
                fill="currentColor"
                style={{ color: "#d1d5db" }}
                viewBox="0 0 16 16"
              >
                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
};

export const ReviewScore: React.FC<{ articleId: number; myUserId: number }> = ({
  articleId,
  myUserId,
}) => {
  const { scores, myScore, loading, submitScore, average, error } =
    useReviewScores(articleId, myUserId);
  const [tempScore, setTempScore] = useState(myScore ?? 0);

  // myScore更新時にUIにも反映
  useEffect(() => {
    if (myScore !== null) setTempScore(myScore);
  }, [myScore]);

  return (
    <section className="bg-zinc-900 rounded-xl p-6 my-8 shadow-lg max-w-3xl text-zinc-100">
      <h3 className="font-bold mb-3 text-lg text-zinc-200">
        レビュー点数（0〜5・0.5刻み）
      </h3>
      <div className="flex items-center gap-3">
        <StarRatingSVG value={tempScore} onChange={setTempScore} />

        <button
          className={`ml-2 px-4 py-1 rounded font-semibold shadow transition 
            ${
              loading || tempScore === myScore
                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          disabled={loading || tempScore === myScore}
          onClick={() => submitScore(tempScore)}
        >
          {myScore !== null ? "更新" : "投稿"}
        </button>
      </div>
      <div className="mt-5 text-base">
        <span className="text-yellow-400 font-semibold">平均点：</span>
        {average !== null ? (
          <span>{average} / 5</span>
        ) : (
          <span className="text-zinc-400">まだスコアなし</span>
        )}
        <span className="ml-3 text-zinc-400 text-sm">({scores.length}人)</span>
      </div>
      {myScore !== null && (
        <div className="mt-2 text-green-300 text-sm">
          あなたのスコア: {myScore}
        </div>
      )}
      {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
      {loading && <div className="mt-4 text-zinc-400 text-sm">通信中...</div>}
    </section>
  );
};
