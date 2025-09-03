// src/pages/ProceduresPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiHelper } from "../../../libs/apiHelper";
import { usePagination } from "../../../hooks/usePagination";
import { Procedure } from "../../../models/Procedure";
import { Pagination } from "../../../utils/Pagination";
import { useReadStatus, ReadTarget } from "../../../hooks/useReadStatus";

// セクション見出し
const sectionTitles: Record<string, string> = {
  "1": "セクション1:環境構築",
  "2": "セクション2:firebase × Reactで管理者ユーザー作成 + 認証機能実装",
  "3": "セクション3:Spring × firebaseで管理者権限確認",
  "4": "セクション4:Spring実際に管理者として記事投稿をする",
  "5": "セクション5:ReactとSpringの管理者CRUD機能",
  "6": "セクション6:記事公開",
  "7": "セクション7:ユーザーアクション機能（いいね・読了）",
  "8": "セクション8:レビュー点数",
  "9": "セクション9:レビューコメント",
  "10": "セクション10:Q&A機能",
  "11": "セクション11:マイページ機能",
};

// 全角→半角（数字のみ）
const toHalfWidthDigits = (s: string) =>
  (s || "").replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

// stepNumber 正規化
// 例: "59" -> "5-09", "509" -> "5-09", "5/9" -> "5-09"
const normalizeStep = (raw: string): string => {
  const t0 = toHalfWidthDigits(String(raw ?? ""))
    .replace(/[‐–—−－/／⁄・\.．,、]/g, "-") // 記号類をハイフンに寄せる
    .replace(/\s+/g, "")
    .trim();

  // 既に "x-yy" 形式なら整形だけして返す
  const mHyphen = t0.match(/^(\d+)-(\d+)$/);
  if (mHyphen) {
    const major = String(parseInt(mHyphen[1], 10)); // 先頭ゼロ除去
    const minor = mHyphen[2].padStart(2, "0"); // 2桁固定
    return `${major}-${minor}`;
  }

  // 数字のみ（ハイフンなし）
  if (/^\d+$/.test(t0)) {
    const len = t0.length;
    if (len === 1) return `0-0${t0}`; // 安全側（並びに影響しないよう後段で999扱いしない）
    if (len === 2) return `${t0[0]}-${t0.slice(1).padStart(2, "0")}`; // "59" -> "5-09"
    if (len === 3) return `${t0[0]}-${t0.slice(1).padStart(2, "0")}`; // "509" -> "5-09"
    // 4桁以上: 末尾2桁=minor, それ以外=major
    const major = String(parseInt(t0.slice(0, -2), 10));
    const minor = t0.slice(-2).padStart(2, "0");
    return `${major}-${minor}`;
  }

  // それ以外はそのまま返す（後段でフォールバック）
  return t0;
};

// major, minor を抽出（失敗時は [999,999] で最後尾へ）
const parseStep = (raw: string): [number, number] => {
  const s = normalizeStep(raw);
  const m = s.match(/^(\d+)-(\d{2})$/);
  if (!m) return [999, 999];
  const major = Number(m[1]);
  const minor = Number(m[2]);
  return Number.isFinite(major) && Number.isFinite(minor)
    ? [major, minor]
    : [999, 999];
};

type Row = Procedure & { major: number; minor: number; stepNumber: string };

export const ProceduresPage = () => {
  const [procedures, setProcedures] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialPage = parseInt(params.get("page") || "1", 10);

  const { totalPages, displayPage, setDisplayPage, setTotalPages } =
    usePagination(initialPage);
  const pageSize = 10;

  const { isRead } = useReadStatus(ReadTarget.Procedures);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        // まとめて全件取得
        const first = await apiHelper.get(`/api/procedures?page=0&size=50`);
        const total = Number(first.data.totalPages) || 1;
        const rest =
          total > 1
            ? await Promise.all(
                Array.from({ length: total - 1 }, (_, i) =>
                  apiHelper.get(`/api/procedures?page=${i + 1}&size=50`)
                )
              )
            : [];

        const content: Procedure[] = [
          ...first.data.content,
          ...rest.flatMap((r) => r.data.content),
        ];

        // 正規化 + major/minor 算出
        const normalized: Row[] = content.map((p) => {
          const step = normalizeStep(p.stepNumber);
          const [major, minor] = parseStep(step);
          return { ...p, stepNumber: step, major, minor };
        });

        // major -> minor で昇順ソート
        normalized.sort((a, b) =>
          a.major !== b.major ? a.major - b.major : a.minor - b.minor
        );

        setProcedures(normalized);
        setTotalPages(Math.ceil(normalized.length / pageSize));
      } catch (e: any) {
        console.error("手順一覧取得失敗", e);
        setError("手順一覧の取得に失敗しました");
        setProcedures([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [setTotalPages]);

  const start = (displayPage - 1) * pageSize;
  const visible = useMemo(
    () => procedures.slice(start, start + pageSize),
    [procedures, start]
  );

  return (
    <div className="text-white p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">開発手順 一覧</h1>

      {loading && <div className="mb-6 text-white/80">通信中...</div>}
      {!loading && error && (
        <div className="mb-6 text-red-300 bg-red-900/30 p-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {!loading &&
          visible.map((item, idx) => {
            const showHeader =
              idx === 0 || item.major !== visible[idx - 1].major;
            const majorStr = String(item.major);
            const readFlag = isRead(item.id);

            return (
              <div key={item.id}>
                {showHeader && (
                  <h2 className="text-xl tracking-wide text-white/80 mt-10 mb-3 flex items-center gap-2">
                    <span className="inline-block h-px w-6 bg-white/15" />
                    {sectionTitles[majorStr] || `セクション${majorStr}`}
                  </h2>
                )}
                <Link
                  to={`/procedures/${item.id}-${item.slug}?page=${displayPage}`}
                  className="group block rounded-lg p-4 bg-white/5 ring-1 ring-white/10 hover:bg-white/7 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 h-7 px-2 rounded bg-sky-500/20 text-sky-300 text-sm grid place-items-center font-semibold">
                      {item.stepNumber}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-white/60 line-clamp-1">
                        {sectionTitles[majorStr] || `セクション${majorStr}`}
                      </p>
                    </div>
                    <span
                      className={`ml-auto shrink-0 h-6 px-2 rounded text-xs grid place-items-center ${
                        readFlag
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      {readFlag ? "既読" : "未読"}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
      </div>

      {!loading && totalPages > 0 && (
        <Pagination
          displayPage={displayPage}
          totalPages={totalPages}
          maxPageLinks={5}
          paginate={setDisplayPage}
        />
      )}
    </div>
  );
};
