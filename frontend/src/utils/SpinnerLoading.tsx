// SpinnerLoading.tsx
import React from "react";

type SpinnerLoadingProps = {
  /** pxベースの直径（デフォルト24） */
  size?: number;
  /** trueで全画面オーバーレイ（背景を暗くして中央に表示） */
  fullscreen?: boolean;
  /** スクリーンリーダー用テキスト（視覚的には隠す） */
  label?: string;
  /** 追加クラス */
  className?: string;
  /** ラベルを視覚的にも表示したい時はここに文字列 */
  visibleLabel?: string;
};

export const SpinnerLoading: React.FC<SpinnerLoadingProps> = ({
  size = 24,
  fullscreen = false,
  label = "読み込み中",
  className = "",
  visibleLabel,
}) => {
  const spinner = (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className="block animate-spin rounded-full border-2 border-zinc-200 border-t-transparent"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {visibleLabel ? (
        <span className="text-zinc-300 text-sm">{visibleLabel}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );

  if (!fullscreen) return spinner;

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/60 backdrop-blur-sm">
      {spinner}
    </div>
  );
};
