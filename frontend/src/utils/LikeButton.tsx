import React from "react";

const HeartIcon = ({ filled }: { filled: boolean }) =>
  filled ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="#e74c3c"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="#aaa"
      viewBox="0 0 16 16"
    >
      <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
    </svg>
  );

type LikeButtonProps = {
  liked: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
};

export const LikeButton: React.FC<LikeButtonProps> = ({
  liked,
  count,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      aria-label="いいね"
      aria-pressed={liked}
      aria-busy={disabled}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        "fixed top-20 left-6 z-50 flex flex-col items-center rounded-full shadow-lg p-2 transition",
        "bg-white bg-opacity-70 hover:bg-opacity-100",
        disabled ? "opacity-60 pointer-events-none" : "hover:scale-[1.02]",
      ].join(" ")}
      style={{ minWidth: 54 }}
    >
      <HeartIcon filled={liked} />
      <span className="mt-1 font-bold text-sm text-gray-700 tabular-nums">
        {count}
      </span>
    </button>
  );
};
