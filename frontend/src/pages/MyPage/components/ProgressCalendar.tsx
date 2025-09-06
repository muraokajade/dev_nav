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

function normalizeDays(input: unknown): DayAction[] {
  if (!input) return [];
  let arr: unknown[];
  if (Array.isArray(input)) {
    arr = input as unknown[];
  } else if (typeof (input as any)[Symbol.iterator] === "function") {
    arr = Array.from(input as Iterable<unknown>);
  } else {
    return [];
  }
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
  // 1) API等から来た配列を正規化
  const safeDays = normalizeDays(days);

  // 2) 月の日付を全て生成し、safeDays をマージして actions を埋める
  const first = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  const daysInMonth = first.daysInMonth();
  const map = new Map<string, number>();
  for (const d of safeDays)
    map.set(dayjs(d.date).format("YYYY-MM-DD"), d.actions);

  const monthDays: DayAction[] = [];
  for (let i = 0; i < daysInMonth; i++) {
    const d = first.add(i, "day");
    const key = d.format("YYYY-MM-DD");
    monthDays.push({ date: key, actions: map.get(key) ?? 0 });
  }

  // 3) 週グリッドを作る（先頭の曜日に合わせて空セルを入れ、最後も7の倍数にパディング）
  // dayjs().day(): 0=日, 1=月, ...
  const startWeekday = first.day(); // 0..6
  const cells: (DayAction | null)[] = [];

  // 先頭の空き
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  // 月の日を並べる
  for (const d of monthDays) cells.push(d);
  // 末尾パディング
  while (cells.length % 7 !== 0) cells.push(null);

  // 7分割
  const weeks: (DayAction | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
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

  // 曜日ヘッダ（任意）
  const weekHeader: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1.5rem)",
    gap: ".25rem",
    marginBottom: ".25rem",
    fontSize: ".7rem",
    color: "#9ca3af",
  };
  const WEEKS = ["日", "月", "火", "水", "木", "金", "土"];

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

      {/* 曜日ヘッダ */}
      <div style={weekHeader}>
        {WEEKS.map((w) => (
          <div key={w} style={{ textAlign: "center" }}>
            {w}
          </div>
        ))}
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
