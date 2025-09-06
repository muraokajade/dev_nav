// src/pages/MyPage/components/ProgressCalendar.tsx
import React from "react";
import dayjs from "dayjs";

/** 1日分のアクション集計 */
export type DayAction = { date: string; actions: number };

type ProgressCalendarProps = {
  days: DayAction[]; // 期待は配列（normalizeDaysで防御）
  year: number;
  month: number; // 1-12
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

/* ---------- 色スタイル（アクション数に応じて） ---------- */
const getColorStyle = (actions: number): React.CSSProperties => {
  if (actions >= 5) return { backgroundColor: "#166534" }; // green-800
  if (actions >= 4) return { backgroundColor: "#16a34a" }; // green-600
  if (actions >= 3) return { backgroundColor: "#22c55e" }; // green-500
  if (actions >= 2) return { backgroundColor: "#4ade80" }; // green-400
  if (actions >= 1) return { backgroundColor: "#bbf7d0" }; // green-200
  return { backgroundColor: "#374151" }; // gray-700
};

/* ---------- 型ガード＆正規化 ---------- */
function isDayAction(x: unknown): x is DayAction {
  return (
    !!x &&
    typeof (x as any).date === "string" &&
    typeof (x as any).actions === "number"
  );
}

/** 入力が配列でない/配列風でも安全に DayAction[] に整形 */
function normalizeDays(input: unknown): DayAction[] {
  if (!input) return [];

  // 1) まず配列に正規化
  let arr: unknown[];
  if (Array.isArray(input)) {
    arr = input as unknown[];
  } else if (typeof (input as any)[Symbol.iterator] === "function") {
    // Iterable(Set/Map/NodeList など)のみ Array.from を使用
    arr = Array.from(input as Iterable<unknown>);
  } else {
    return [];
  }

  // 2) DayAction のみ抽出
  return arr.filter(isDayAction);
}

/* ---------- コンポーネント ---------- */
export const ProgressCalendar: React.FC<ProgressCalendarProps> = ({
  days,
  year,
  month,
  onPrevMonth,
  onNextMonth,
}) => {
  // 正規化して安全な配列に
  const safeDays = normalizeDays(days);

  // 7日ごとに分割（足りない分は null でパディング）
  const weeks: (DayAction | null)[][] = [];
  for (let i = 0; i < safeDays.length; i += 7) {
    const chunk = safeDays.slice(i, i + 7);
    const padded = [
      ...chunk,
      ...Array(Math.max(0, 7 - chunk.length)).fill(null),
    ];
    weeks.push(padded);
  }

  // スタイル（CSSProperties）
  const headerRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: ".5rem",
    margin: ".5rem 0",
  };
  const btnStyle: React.CSSProperties = {
    fontSize: ".9rem",
    background: "#1f2937",
    padding: ".25rem .75rem",
    borderRadius: ".375rem",
    cursor: "pointer",
  };
  const weeksWrapStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: ".25rem",
    alignItems: "center",
  };
  const rowStyle: React.CSSProperties = {
    display: "flex",
    gap: ".25rem",
    margin: ".2rem 0",
  };
  const cellBase: React.CSSProperties = {
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: ".25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: ".75rem",
    transition: "all .3s ease",
  };

  return (
    <div>
      <div style={headerRowStyle}>
        <button style={btnStyle} onClick={onPrevMonth}>
          ← 前の月
        </button>
        <span style={{ fontWeight: 700 }}>
          {year}年{month}月
        </span>
        <button style={btnStyle} onClick={onNextMonth}>
          次の月 →
        </button>
      </div>

      <div style={weeksWrapStyle}>
        {weeks.map((week, i) => (
          <div key={i} style={rowStyle}>
            {week.map((day, j) =>
              day ? (
                <div
                  key={`${day.date}-${j}`}
                  style={{ ...cellBase, ...getColorStyle(day.actions) }}
                  title={`${day.date}: ${day.actions}アクション`}
                >
                  {dayjs(day.date).date()}
                </div>
              ) : (
                <div
                  key={`empty-${i}-${j}`}
                  style={{ ...cellBase, background: "transparent" }}
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
