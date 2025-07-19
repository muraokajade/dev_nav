import dayjs from "dayjs";

type DayAction = { date: string; actions: number };

type ProgressCalendarProps = {
  days: DayAction[];
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export const ProgressCalendar: React.FC<ProgressCalendarProps> = ({
  days,
  year,
  month,
  onPrevMonth,
  onNextMonth,
}) => {
  const getColor = (actions: number) => {
    if (actions >= 5) return "bg-green-800";
    if (actions >= 4) return "bg-green-600";
    if (actions >= 3) return "bg-green-500";
    if (actions >= 2) return "bg-green-400";
    if (actions >= 1) return "bg-green-200";
    return "bg-gray-700";
  };
  // 7日ごとに分割
  const weeks: (DayAction | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    // 1. sliceでまずコピー
    const week = days.slice(i, i + 7) as (DayAction | null)[];
    // 2. 足りない分null詰め
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          className="text-sm bg-gray-800 px-3 py-1 rounded hover:bg-gray-600 whitespace-nowrap"
          onClick={onPrevMonth}
        >
          ← 前の月
        </button>
        <span className="font-bold whitespace-nowrap">
          {year}年{month}月
        </span>
        <button
          className="text-sm bg-gray-800 px-3 py-1 rounded hover:bg-gray-600 whitespace-nowrap"
          onClick={onNextMonth}
        >
          次の月 →
        </button>
      </div>
      {/* カレンダー（草） */}
      <div className="flex flex-col gap-1 items-center">
        {weeks.map((week, i) => (
          <div key={i} className="flex gap-1">
            {week.map((day, j) =>
              day ? (
                <div
                  key={day.date}
                  className={`w-6 h-6 rounded text-center ${getColor(
                    day.actions
                  )} transition duration-300`}
                  title={`${day.date}: ${day.actions}アクション`}
                >
                  {dayjs(day.date).date()}
                </div>
              ) : (
                <div key={j} className="w-6 h-6" /> // 空白マス
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
