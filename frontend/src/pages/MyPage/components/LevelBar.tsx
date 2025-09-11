// src/components/LevelBar.tsx
import React from "react";

type Props = {
  level?: number; // 1, 2, 3...
  expPercent?: number; // 0–100
};

export const LevelBar: React.FC<Props> = ({ level = 1, expPercent = 0 }) => {
  // 0–100 にクランプ
  const p = Math.max(0, Math.min(100, Math.round(expPercent ?? 0)));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl font-bold">Lv.{level}</span>
        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
          EXP {p}%
        </span>
      </div>

      <div
        className="h-3 w-full overflow-hidden rounded bg-white/10"
        aria-label="experience progress"
        aria-valuenow={p}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      >
        <div
          className="h-3 rounded bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-[width] duration-500"
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
};
