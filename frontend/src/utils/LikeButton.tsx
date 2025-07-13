const HeartIcon = ({ filled }: { filled: boolean }) =>
  filled ? (
    // 塗りつぶしハート（赤）
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="#e74c3c"
      className="bi bi-heart-fill"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
      />
    </svg>
  ) : (
    // 空ハート（グレー）
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="#aaa"
      className="bi bi-heart"
      viewBox="0 0 16 16"
    >
      <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
    </svg>
  );

type LikeButtonProps = {
  liked: boolean;
  count: number;
  onClick: () => void;
};
export const LikeButton: React.FC<LikeButtonProps> = ({
  liked,
  count,
  onClick,
}) => {
  return (
    <button
      className="fixed top-20 left-6 z-50 flex flex-col items-center bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow-lg p-2 transition"
      style={{ minWidth: 54 }}
      onClick={onClick}
      aria-label="いいね"
    >
      <HeartIcon filled={liked} />
      <span className="mt-1 font-bold text-sm text-gray-700">{count}</span>
    </button>
  );
};
