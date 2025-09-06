// src/pages/MyPage/components/ProgressCalendar.tsx
import React from "react";
import dayjs from "dayjs";

export type DayAction = { date: string; actions: number };

type ProgressCalendarProps = {
  days: DayAction[];
  year: number;
  month: number; // 1-12
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

/* ====== 定数（ピクセル固定でブレさせない） ====== */
const CELL = 24; // セル一辺(px)
const GAP = 4; // セル間隔(px)

/* 色 */
const getColorStyle = (actions: number): React.CSSProperties => {
  if (actions >= 5) return { backgroundColor: "#166534" };
  if (actions >= 4) return { backgroundColor: "#16a34a" };
  if (actions >= 3) return { backgroundColor: "#22c55e" };
  if (actions >= 2) return { backgroundColor: "#4ade80" };
  if (actions >= 1) return { backgroundColor: "#bbf7d0" };
  return { backgroundColor: "#374151" };
};

/* 型ガード */
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
  if (Array.isArray(input)) arr = input;
  else if (typeof (input as any)[Symbol.iterator] === "function")
    arr = Array.from(input as Iterable<unknown>);
  else return [];
  return (arr as unknown[]).filter(isDayAction);
}

export const ProgressCalendar: React.FC<ProgressCalendarProps> = ({
  days,
  year,
  month,
  onPrevMonth,
  onNextMonth,
}) => {
  const safeDays = normalizeDays(days);

  // 対象月の全日＋空白を計算
  const first = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  const daysInMonth = first.daysInMonth();
  const startWeekday = first.day(); // 0=日

  const actionsByDate = new Map<string, number>();
  for (const d of safeDays) {
    actionsByDate.set(dayjs(d.date).format("YYYY-MM-DD"), d.actions);
  }

  const monthDays: DayAction[] = [];
  for (let i = 0; i < daysInMonth; i++) {
    const d = first.add(i, "day");
    const key = d.format("YYYY-MM-DD");
    monthDays.push({ date: key, actions: actionsByDate.get(key) ?? 0 });
  }

  // 先頭空白 + 月の日 + 末尾空白 → 7の倍数に
  const cells: (DayAction | null)[] = [
    ...Array(startWeekday).fill(null),
    ...monthDays,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  /* ====== スタイル（固定値で崩れない） ====== */
  const headerRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    margin: "8px 0",
  };
  const btnStyle: React.CSSProperties = {
    fontSize: 14,
    background: "#1f2937",
    padding: "4px 10px",
    borderRadius: 6,
    cursor: "pointer",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  const gridCommon: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(7, ${CELL}px)`,
    gap: GAP,
    justifyContent: "center",
    width: 7 * CELL + 6 * GAP, // ← コンテナ幅を固定
    boxSizing: "border-box",
  };

  const weekHeaderStyle: React.CSSProperties = {
    ...gridCommon,
    marginBottom: GAP,
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    userSelect: "none",
  };

  const gridBodyStyle: React.CSSProperties = {
    ...gridCommon,
  };

  const cellBase: React.CSSProperties = {
    width: CELL,
    height: CELL,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    lineHeight: 1, // ← 高さブレ防止
    boxSizing: "border-box",
    transition: "transform .12s ease",
  };

  const WEEKS = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* ヘッダ */}
      <div style={{ ...headerRowStyle, width: gridCommon.width as number }}>
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

      {/* 曜日 */}
      <div style={weekHeaderStyle}>
        {WEEKS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {/* 本体 */}
      <div style={gridBodyStyle}>
        {cells.map((day, idx) =>
          day ? (
            <div
              key={day.date}
              style={{ ...cellBase, ...getColorStyle(day.actions) }}
              title={`${day.date}: ${day.actions}アクション`}
            >
              {dayjs(day.date).date()}
            </div>
          ) : (
            <div
              key={`empty-${idx}`}
              style={{ ...cellBase, background: "transparent" }}
            />
          )
        )}
      </div>
    </div>
  );
};
