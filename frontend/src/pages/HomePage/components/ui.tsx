import React from "react";

export const GlassCard: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ className = "", children }) => (
  <div
    className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 md:p-5 ${className}`}
  >
    {children}
  </div>
);

export const MediaFrame: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ className = "", children }) => (
  <div
    className={`rounded-2xl border border-white/10 bg-[#0b0f15]/80 backdrop-blur p-4 ${className}`}
  >
    {children}
  </div>
);

export const Bullets: React.FC<{ items: string[]; className?: string }> = ({
  items,
  className = "",
}) => (
  <ul
    className={`list-disc pl-5 space-y-2 text-base md:text-lg leading-relaxed text-gray-200 ${className}`}
  >
    {items.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ul>
);
